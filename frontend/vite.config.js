import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ Get environment variable directly
const BACKEND_URI = process.env.VITE_BACKEND_URI;

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: BACKEND_URI,
        changeOrigin: true,
        secure: true,
      },
    },
  },
  plugins: [react()],
})
