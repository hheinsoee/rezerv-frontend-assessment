import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Keep the generated artwork as real, hashed, cacheable files. Inlining it as
    // base64 would bloat the entry chunk, defeat `loading="lazy"` on the collection
    // cards, and leave the preloader with nothing real to measure.
    assetsInlineLimit: 0,
  },
})
