import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
    host: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost/vehicle-parking-system/backend/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'bootstrap'],
  },
})
