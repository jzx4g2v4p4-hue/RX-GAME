import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' keeps asset paths relative, so it works on GitHub Pages
// project sites (https://user.github.io/rxready/) without extra config.
export default defineConfig({
  base: './',
  plugins: [react()],
})
