import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Tryb "standalone" buduje jeden samodzielny plik HTML (release/KawasakiPalletizer.html),
// który można otworzyć dwuklikiem bez serwera i bez internetu.
export default defineConfig(({ mode }) => {
  const standalone = mode === 'standalone'
  return {
    base: process.env.DEPLOY_BASE || './',
    plugins: [react(), tailwindcss(), ...(standalone ? [viteSingleFile()] : [])],
    build: standalone
      ? {
          outDir: 'release',
          emptyOutDir: false,
          assetsInlineLimit: 100_000_000,
          chunkSizeWarningLimit: 10_000,
          rollupOptions: { input: 'KawasakiPalletizer.html' },
        }
      : { chunkSizeWarningLimit: 900 },
    test: {
      environment: 'jsdom',
      setupFiles: ['tests/setup.ts'],
      include: ['tests/**/*.test.{ts,tsx}'],
      css: false,
    },
  }
})
