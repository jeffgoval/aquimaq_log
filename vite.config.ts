import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
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
