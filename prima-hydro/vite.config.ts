import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Na GitHub Pages aplikacja jest serwowana z podkatalogu /<nazwa-repo>/ –
  // workflow deployu ustawia DEPLOY_BASE, lokalnie zostaje "/".
  base: process.env.DEPLOY_BASE || '/',
  plugins: [react(), tailwindcss()],
})
