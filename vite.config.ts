import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Vercel serves from root '/', while GitHub Pages serves from repo subpath '/Diwali_special/'
  base: process.env.VERCEL ? '/' : (process.env.GITHUB_ACTIONS ? '/Diwali_special/' : '/'),
})
