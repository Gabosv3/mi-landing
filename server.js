import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import admin from 'firebase-admin'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST_DIR = path.join(__dirname, 'dist')
// Fuera de public_html: el deploy solo reemplaza dist/, así las imágenes
// subidas sobreviven a cada rebuild.
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads')

fs.mkdirSync(UPLOADS_DIR, { recursive: true })

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
  })
}

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'])

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
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

app.use('/imagenes/uploads', express.static(UPLOADS_DIR))
app.use(express.static(DIST_DIR))

app.post('/api/upload', requireAdmin, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se envio ningun archivo' })
  const ext = (path.extname(req.file.originalname) || '.jpg').toLowerCase()
  const filename = `img_${Date.now()}${ext}`
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), req.file.buffer)
  res.json({ url: `/imagenes/uploads/${filename}` })
})

// SPA fallback: cualquier otra ruta GET devuelve index.html
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'))
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Server listening on port ${port}`))
