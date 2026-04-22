import '@/shared/lib/dayjs'
import '@/app/pwa-register'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/app/styles/globals.css'
import { AppProviders } from '@/app/providers/app-providers'
import { AppRouter } from '@/app/router'
import { AppErrorBoundary } from '@/shared/components/app/app-error-boundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </AppErrorBoundary>
  </StrictMode>
)
