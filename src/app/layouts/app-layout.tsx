import { Outlet } from 'react-router-dom'
import { Sidebar } from './components/sidebar'
import { MobileHeader } from './components/mobile-header'
import { MobileBottomNav } from './components/mobile-bottom-nav'
import { AppPwaInstall } from '@/shared/components/app/app-pwa-install'

export function AppLayout() {
  return (
    <div className="flex flex-col h-screen lg:flex-row bg-background overflow-hidden relative">
      {/* Sidebar Desktop — Oculta em mobile */}
      <Sidebar />

      <div className="flex flex-col flex-1 relative h-full overflow-hidden">
        {/* Header Mobile — Somente acima do mobile nav */}
        <MobileHeader />

        <main className="flex-1 overflow-y-auto px-4 pt-20 pb-24 lg:pt-8 lg:pb-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Navegação Inferior Mobile */}
        <MobileBottomNav />

        {/* Banner de Instalação PWA */}
        <AppPwaInstall />
      </div>
    </div>
  )
}
