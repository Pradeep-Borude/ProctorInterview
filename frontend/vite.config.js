import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',  // ✅ Fixes simple-peer "global" error
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020'
    }
  }
})
