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

const app = express()

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

app.get('/api/image/:id', async (req, res) => {
  try {
    const snap = await db().collection('uploads').doc(req.params.id).get()
    if (!snap.exists) return res.status(404).send('Not found')
    const { data, contentType } = snap.data()
    res.set('Content-Type', contentType)
    res.set('Cache-Control', 'public, max-age=31536000, immutable')
    res.send(Buffer.from(data, 'base64'))
  } catch {
    res.status(500).send('Error loading image')
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
