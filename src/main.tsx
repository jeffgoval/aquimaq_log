import '@/shared/lib/dayjs'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/app/styles/globals.css'
import { AppProviders } from '@/app/providers/app-providers'
import { AppRouter } from '@/app/router'
import { AppErrorBoundary } from '@/shared/components/app/app-error-boundary'

const CHUNK_ERROR_MESSAGES = [
  'Failed to fetch dynamically imported module',
  'Importing a module script failed',
  'Loading chunk',
]

const isChunkLoadError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return CHUNK_ERROR_MESSAGES.some((message) => error.message.includes(message))
  }

  if (typeof error === 'string') {
    return CHUNK_ERROR_MESSAGES.some((message) => error.includes(message))
  }

  return false
}

const recoverFromChunkLoadError = (): void => {
  const reloadGuardKey = 'aquimaq:chunk-reload-once'

  if (sessionStorage.getItem(reloadGuardKey)) return

  sessionStorage.setItem(reloadGuardKey, '1')
  window.location.reload()
}

const installChunkErrorRecovery = (): void => {
  window.addEventListener('unhandledrejection', (event) => {
    if (isChunkLoadError(event.reason)) recoverFromChunkLoadError()
  })

  window.addEventListener('error', (event) => {
    if (isChunkLoadError(event.error ?? event.message)) recoverFromChunkLoadError()
  })
}

installChunkErrorRecovery()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </AppErrorBoundary>
  </StrictMode>
)
