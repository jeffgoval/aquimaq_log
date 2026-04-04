import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/app/styles/globals.css'
import { AppProviders } from '@/app/providers/app-providers'
import { AppRouter } from '@/app/router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </StrictMode>
)
