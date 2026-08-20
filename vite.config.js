import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // '@/...' resolves to 'src/...' everywhere in the app — keeps
      // imports stable across folder moves and avoids '../../../' chains
      // once components live a few directories deep (see jsconfig.json
      // for the matching editor-intellisense config).
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
