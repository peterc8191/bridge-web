import { defineConfig, type Plugin } from 'vite'
import { configDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages serves this project at /bridge-web/. Override with BASE_PATH
// (e.g. BASE_PATH=/ for a custom domain or another host).
const PAGES_BASE = '/bridge-web/'

/**
 * GitHub Pages has no SPA rewrites: a hard refresh on /bridge-web/saved hits
 * its 404 page. This emits a 404.html that redirects to
 * /bridge-web/?/saved, which the script in index.html turns back into
 * /bridge-web/saved before React Router starts.
 * (Technique from https://github.com/rafgraph/spa-github-pages.)
 */
function githubPagesSpaFallback(base: string): Plugin {
  const segmentsToKeep = base.split('/').filter(Boolean).length
  return {
    name: 'github-pages-spa-fallback',
    apply: 'build',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: '404.html',
        source: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Bridge</title>
    <script>
      // Redirect /base/some/route?x=1 to /base/?/some/route&x=1 (see index.html).
      var segmentsToKeep = ${segmentsToKeep};
      var l = window.location;
      l.replace(
        l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
        l.pathname.split('/').slice(0, 1 + segmentsToKeep).join('/') + '/?/' +
        l.pathname.slice(1).split('/').slice(segmentsToKeep).join('/').replace(/&/g, '~and~') +
        (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        l.hash
      );
    </script>
  </head>
  <body></body>
</html>
`,
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const base = process.env.BASE_PATH ?? (command === 'build' ? PAGES_BASE : '/')

  return {
    base,
    plugins: [
      react(),
      githubPagesSpaFallback(base),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.png', 'apple-touch-icon.png'],
        manifest: {
          name: 'Bridge',
          short_name: 'Bridge',
          description: 'Swipe through property listings, save favorites, report issues, and arrange viewings.',
          // Relative to the manifest's own location, so it resolves under the base path.
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
        workbox: {
          // Deep links work offline too: the service worker answers any
          // navigation with index.html (no 404.html round-trip needed).
          navigateFallback: 'index.html',
          // Listing photos are remote (picsum.photos redirects to its CDN), so
          // cache them as they're viewed: previously seen listings keep their
          // photos offline. Requests are no-cors, hence status 0 (opaque).
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/(fastly\.)?picsum\.photos\//,
              handler: 'CacheFirst',
              options: {
                cacheName: 'listing-photos',
                expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 30 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
      }),
    ],
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      globals: true,
      // Form-heavy tests type a lot with user-event; the default 5s is tight on slow machines.
      testTimeout: 15000,
      exclude: [...configDefaults.exclude, 'e2e/**'],
    },
  }
})
