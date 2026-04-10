import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    host: true,
    port: 5174,
    allowedHosts: [
      'fitting-readily-meanwhile-arm.trycloudflare.com'
    ],
  },
  define: {
    global: 'window',
  },
  resolve: {
    alias: {
      // ✅ ye add karo
      'simple-peer': 'simple-peer/simplepeer.min.js'
    }
  }

})
