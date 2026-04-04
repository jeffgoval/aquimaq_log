import '@/shared/lib/dayjs'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/app/styles/globals.css'
import { AppProviders } from '@/app/providers/app-providers'
import { AppRouter } from '@/app/router'
import { registerSW } from 'virtual:pwa-register'

// Register Service Worker for PWA (Browser/CI build)
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Nova versão disponível! Deseja atualizar o sistema agora?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('Aquimaq Log está pronto para uso offline!')
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </StrictMode>
)
