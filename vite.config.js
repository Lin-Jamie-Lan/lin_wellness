import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Set specific port
    strictPort: false, // Allow fallback to other ports if 5173 is busy
  }
})
