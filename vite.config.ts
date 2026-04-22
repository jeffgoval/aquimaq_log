import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('react-dom') || id.includes('/react/')) return 'react-vendor'
          if (id.includes('@tanstack/react-query') || id.includes('@tanstack/query-core')) return 'query-vendor'
          if (id.includes('@tanstack')) return 'tanstack-vendor'
          if (id.includes('react-router')) return 'router-vendor'
          if (id.includes('@supabase')) return 'supabase-vendor'
          if (id.includes('lucide-react')) return 'icons-vendor'
          if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('canvg') || id.includes('dompurify'))
            return 'pdf-vendor'
          if (id.includes('zod')) return 'zod-vendor'
          return undefined
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: false, // We manage our own public/manifest.json
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        // Não incluir *.html: precarregar o shell (index) faz o SW servir o app antigo com JS antigo
        // (o menu / chunks ficam "presos" em mobile após deploy).
        globPatterns: ['**/*.{js,css,ico,png,svg,woff2}'],
        globIgnores: ['**/*.html'],
        navigateFallback: null,

        // Runtime caching rules
        runtimeCaching: [
          {
            // Sempre verificar rede no HTML/SPA; evita menu antigo de cache
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-nav',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 5 },
            },
          },
          {
            // Google Fonts — cache first
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Supabase auth endpoints — nunca cachear (refresh token, session, logout)
            urlPattern: /^https:\/\/.*\.supabase\.co\/auth\/.*/i,
            handler: 'NetworkOnly',
          },
          {
            // Supabase API (dados) — network first, sem cache de auth
            urlPattern: /^https:\/\/.*\.supabase\.co\/(?!auth\/).*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              networkTimeoutSeconds: 10,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      // Desligado em dev: SW antigo costuma causar tela branca / assets em cache inválidos após mudanças.
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
  },
})
