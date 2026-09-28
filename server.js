import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import admin from 'firebase-admin'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST_DIR = path.join(__dirname, 'dist')

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
  })
}

// Hostinger recrea todo el sistema de archivos de la app en cada deploy
// (no solo public_html), asi que cualquier archivo escrito a disco en tiempo
// de ejecucion se pierde en el siguiente rebuild. Las imagenes se guardan en
// Firestore (base64) en su lugar, que es una base de datos aparte.
const db = () => admin.firestore()

// Firestore limita cada documento a 1MiB; base64 agrega ~33% de overhead,
// asi que el archivo original debe pesar bastante menos que eso.
const MAX_IMAGE_BYTES = 700 * 1024

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'])

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES },
  fileFilter: (req, file, cb) => cb(null, ALLOWED_TYPES.has(file.mimetype)),
})

async function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token || !admin.apps.length) {
    return res.status(401).json({ error: 'No autorizado' })
  }
  try {
    req.user = await admin.auth().verifyIdToken(token)
    next()
  } catch {
    res.status(401).json({ error: 'No autorizado' })
  }
}

// Cuentas creadas antes de que existiera el sistema de roles no tienen
// documento en "users" -> se tratan como admin (comportamiento previo).
async function getProfile(uid) {
  const snap = await db().collection('users').doc(uid).get()
  if (!snap.exists) return { role: 'admin', name: null, refCode: null }
  const data = snap.data()
  return { role: data.role || 'admin', name: data.name || null, refCode: data.refCode || null }
}

async function requireAdminRole(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token || !admin.apps.length) {
    return res.status(401).json({ error: 'No autorizado' })
  }
  try {
    req.user = await admin.auth().verifyIdToken(token)
    req.profile = await getProfile(req.user.uid)
    if (req.profile.role !== 'admin') return res.status(403).json({ error: 'Solo un administrador puede hacer esto' })
    next()
  } catch {
    res.status(401).json({ error: 'No autorizado' })
  }
}

function slugify(text) {
  return (text || '')
    .toString()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function generateRefCode(name) {
  const base = slugify(name) || 'vendedor'
  for (let i = 0; i < 5; i++) {
    const candidate = i === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`
    const existing = await db().collection('users').where('refCode', '==', candidate).limit(1).get()
    if (existing.empty) return candidate
  }
  return `${base}-${Date.now()}`
}

const app = express()

app.use(express.json())

// index: false porque el index.html lo serviremos aparte, sin cachear,
// para que nunca quede una version vieja apuntando a assets con hash ya borrados.
app.use(express.static(DIST_DIR, { index: false }))

function handleUpload(req, res, next) {
  upload.single('file')(req, res, (err) => {
    if (!err) return next()
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'La imagen sigue siendo muy pesada tras comprimirla. Prueba con una foto mas simple o de menor resolucion.' })
    }
    res.status(400).json({ error: err.message })
  })
}

app.post('/api/upload', requireAdmin, handleUpload, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se envio ningun archivo' })
  try {
    const docRef = await db().collection('uploads').add({
      data: req.file.buffer.toString('base64'),
      contentType: req.file.mimetype,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    res.json({ url: `/api/image/${docRef.id}` })
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar la imagen: ' + err.message })
  }
})

// Cache en memoria del proceso: evita releer Firestore en cada request de una
// imagen ya servida (las imagenes son inmutables una vez subidas). Tamano
// acotado con expulsion FIFO simple para no crecer sin limite.
const IMAGE_CACHE_MAX = 300
const imageCache = new Map()

function cacheImage(id, buffer, contentType) {
  if (imageCache.size >= IMAGE_CACHE_MAX) {
    imageCache.delete(imageCache.keys().next().value)
  }
  imageCache.set(id, { buffer, contentType })
}

app.get('/api/image/:id', async (req, res) => {
  try {
    const cached = imageCache.get(req.params.id)
    if (cached) {
      res.set('Content-Type', cached.contentType)
      res.set('Cache-Control', 'public, max-age=31536000, immutable')
      return res.send(cached.buffer)
    }
    const snap = await db().collection('uploads').doc(req.params.id).get()
    if (!snap.exists) return res.status(404).send('Not found')
    const { data, contentType } = snap.data()
    const buffer = Buffer.from(data, 'base64')
    cacheImage(req.params.id, buffer, contentType)
    res.set('Content-Type', contentType)
    res.set('Cache-Control', 'public, max-age=31536000, immutable')
    res.send(buffer)
  } catch {
    res.status(500).send('Error loading image')
  }
})

/* ── Usuarios (admin y vendedores) ──────────────────────────
   Se manejan aqui (no directo desde el cliente a Firestore) porque crear o
   borrar una cuenta de Firebase Auth solo se puede hacer con el SDK de
   administrador, y de paso evitamos exponer la coleccion "users" con reglas
   de seguridad propias: todo pasa por estos endpoints, protegidos por rol. */

app.get('/api/users/me', requireAdmin, async (req, res) => {
  try {
    const profile = await getProfile(req.user.uid)
    res.json({ uid: req.user.uid, email: req.user.email, ...profile })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/users', requireAdminRole, async (req, res) => {
  try {
    const snap = await db().collection('users').orderBy('createdAt', 'desc').get()
    res.json(snap.docs.map((d) => ({ uid: d.id, ...d.data() })))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/users', requireAdminRole, async (req, res) => {
  const { email, password, name, role } = req.body || {}
  if (!email || !password || !name) return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' })
  if (password.length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })
  const finalRole = role === 'vendedor' ? 'vendedor' : 'admin'
  try {
    const userRecord = await admin.auth().createUser({ email, password, displayName: name })
    const refCode = await generateRefCode(name)
    const data = { email, name, role: finalRole, refCode, createdAt: admin.firestore.FieldValue.serverTimestamp() }
    await db().collection('users').doc(userRecord.uid).set(data)
    res.json({ uid: userRecord.uid, ...data })
  } catch (err) {
    const msg = err.code === 'auth/email-already-exists' ? 'Ya existe una cuenta con ese email.' : err.message
    res.status(400).json({ error: msg })
  }
})

app.patch('/api/users/:uid', requireAdminRole, async (req, res) => {
  const { name, role } = req.body || {}
  const data = {}
  if (name) data.name = name
  if (role === 'admin' || role === 'vendedor') data.role = role
  try {
    await db().collection('users').doc(req.params.uid).update(data)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete('/api/users/:uid', requireAdminRole, async (req, res) => {
  if (req.params.uid === req.user.uid) return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta.' })
  try {
    await admin.auth().deleteUser(req.params.uid)
    await db().collection('users').doc(req.params.uid).delete()
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/* ── Ventas referidas ────────────────────────────────────────
   Se registran cuando un cliente llega con el link de un vendedor
   (?ref=codigo) y le da "Enviar a WhatsApp" en el carrito. El endpoint es
   publico (el cliente no esta autenticado) pero solo guarda algo si el
   refCode corresponde a un vendedor real. */

app.post('/api/sales', async (req, res) => {
  if (!admin.apps.length) return res.json({ ok: true })
  const { refCode, items, subtotal, total, couponCode } = req.body || {}
  if (!refCode || !Array.isArray(items) || items.length === 0) return res.json({ ok: true })
  try {
    const sellerSnap = await db().collection('users').where('refCode', '==', refCode).limit(1).get()
    if (sellerSnap.empty) return res.json({ ok: true })
    const seller = sellerSnap.docs[0]
    await db().collection('sales').add({
      refCode,
      sellerUid: seller.id,
      sellerName: seller.data().name || seller.data().email,
      items,
      subtotal: subtotal ?? null,
      total: total ?? null,
      couponCode: couponCode || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    res.json({ ok: true })
  } catch {
    res.json({ ok: true }) // nunca romper el flujo de compra del cliente por esto
  }
})

app.get('/api/sales', requireAdmin, async (req, res) => {
  try {
    const profile = await getProfile(req.user.uid)
    // Se evita combinar where + orderBy en la misma consulta (requeriria un
    // indice compuesto que no se puede crear sin acceso a la consola de
    // Firebase); se ordena en memoria en su lugar.
    const q = profile.role === 'admin'
      ? db().collection('sales').orderBy('createdAt', 'desc')
      : db().collection('sales').where('sellerUid', '==', req.user.uid)
    const snap = await q.get()
    const rows = snap.docs.map((d) => {
      const data = d.data()
      return { id: d.id, ...data, createdAt: data.createdAt?.toDate?.().toISOString() || null }
    })
    if (profile.role !== 'admin') rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// SPA fallback: solo para rutas de navegacion (sin extension), nunca para
// assets/api que no existen (esas deben dar 404 real, no HTML).
app.get(/.*/, (req, res, next) => {
  if (req.path.startsWith('/assets/') || req.path.startsWith('/api/') || path.extname(req.path)) {
    return next()
  }
  res.set('Cache-Control', 'no-cache')
  res.sendFile(path.join(DIST_DIR, 'index.html'))
})

app.use((req, res) => res.status(404).send('Not found'))

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Server listening on port ${port}`))
