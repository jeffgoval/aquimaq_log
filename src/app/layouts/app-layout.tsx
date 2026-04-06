import { useRef } from 'react'
import { Outlet } from 'react-router-dom'
import { ScrollToTop } from '@/app/router/scroll-to-top'
import { Sidebar } from './components/sidebar'
import { MobileHeader } from './components/mobile-header'
import { MobileBottomNav } from './components/mobile-bottom-nav'
import { AppPwaInstall } from '@/shared/components/app/app-pwa-install'

export const AppLayout = () => {
  const mainScrollRef = useRef<HTMLElement>(null)

  return (
    <div className="flex flex-col h-screen lg:flex-row bg-background overflow-hidden relative">
      {/* Sidebar Desktop — Oculta em mobile */}
      <Sidebar />

      <div className="flex flex-col flex-1 relative h-full overflow-hidden">
        {/* Header Mobile — Somente acima do mobile nav */}
        <MobileHeader />

        <main
          ref={mainScrollRef}
          className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden px-4 pt-20 pb-24 lg:pt-8 lg:pb-8"
        >
          <ScrollToTop scrollContainerRef={mainScrollRef} />
          <div className="mx-auto w-full min-w-0 max-w-7xl">
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

