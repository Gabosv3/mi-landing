import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

/* Middleware local: guarda imágenes en public/imagenes/uploads/ */
function localUploadPlugin() {
  return {
    name: 'local-upload',
    configureServer(server) {
      server.middlewares.use('/api/upload', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }
        let body = ''
        req.setEncoding('utf8')
        req.on('data', (chunk) => { body += chunk })
        req.on('end', () => {
          try {
            const { data, name } = JSON.parse(body)
            const base64 = data.replace(/^data:image\/\w+;base64,/, '')
            const buffer = Buffer.from(base64, 'base64')
            const ext = (name.split('.').pop() || 'jpg').toLowerCase()
            const filename = `img_${Date.now()}.${ext}`
            const dir = path.resolve('./public/imagenes/uploads')
            fs.mkdirSync(dir, { recursive: true })
            fs.writeFileSync(path.join(dir, filename), buffer)
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ url: `/imagenes/uploads/${filename}` }))
          } catch {
            res.statusCode = 500
            res.end(JSON.stringify({ error: 'Error al guardar la imagen' }))
          }
        })
      })
    },
  }
}

// Plugin para copiar .htaccess a dist
function copyHtaccessPlugin() {
  return {
    name: 'copy-htaccess',
    writeBundle() {
      const source = path.resolve('./public/.htaccess')
      const dest = path.resolve('./dist/.htaccess')
      if (fs.existsSync(source)) {
        fs.copyFileSync(source, dest)
        console.log('✓ .htaccess copiado a dist/')
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localUploadPlugin(), copyHtaccessPlugin()],
  server: {
    host: '0.0.0.0', // Escucha en todas las interfaces de red
    port: 3030,
    strictPort: true,
    // Redirige todas las rutas desconocidas al index.html (SPA)
    historyApiFallback: true,
  },
  build: {
    rollupOptions: {
      output: {
        // Mejorar code-splitting con función
        manualChunks(id) {
          if (id.includes('firebase')) {
            return 'firebase'
          }
          if (id.includes('react-router')) {
            return 'react-router'
          }
        },
      },
    },
    // Incrementar el límite de tamaño para chunks
    chunkSizeWarningLimit: 1000,
  },
})
