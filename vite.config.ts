import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 5173,
    host: 'localhost',
    // Proxy pour éviter les problèmes de CORS et les conflits de routes avec /admin
    proxy: {
      '/api-gateway': {
        target: 'http://localhost:8765',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-gateway/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
  },
})
