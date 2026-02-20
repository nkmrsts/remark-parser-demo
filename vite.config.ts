import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages では https://<user>.github.io/<repo>/ で配信される
  base: '/remark-parser-demo/',
})
