import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 5173,
    strictPort: true, // Always use port 5173 — prevents localStorage data loss from port switching
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
