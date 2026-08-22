/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: './', // relative asset paths so the build works under any GitHub Pages subpath
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Bridge',
        short_name: 'Bridge',
        description: 'Swipe through property listings, save favorites, report issues, and arrange viewings.',
        // Relative to the manifest's own location (site root) so this resolves
        // correctly under any subpath, matching the base: './' setting above -
        // required for GitHub Pages project-page deployments.
        start_url: '.',
        scope: '.',
        display: 'standalone',
        background_color: '#fafafa',
        theme_color: '#ff5864',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
})
