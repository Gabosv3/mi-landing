import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

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
  plugins: [react(), copyHtaccessPlugin()],
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
