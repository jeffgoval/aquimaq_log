import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { APP_MAIN_SCROLL_ID } from '@/app/router/scroll-to-top'
import { Sidebar } from './components/sidebar'
import { MobileHeader } from './components/mobile-header'
import { MobileBottomNav } from './components/mobile-bottom-nav'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { usePrefetchLists } from '@/app/hooks/use-prefetch-lists'

export const AppLayout = () => {
  usePrefetchLists()
  return (
    <div className="relative flex h-screen w-full max-w-full min-w-0 flex-col overflow-hidden bg-background lg:flex-row">
      {/* Sidebar Desktop — Oculta em mobile */}
      <Sidebar />

      <div className="relative flex h-full min-w-0 max-w-full flex-1 flex-col overflow-hidden">
        {/* Header Mobile — Somente acima do mobile nav */}
        <MobileHeader />

        <main
          id={APP_MAIN_SCROLL_ID}
          className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden px-4 pt-20 pb-24 lg:pt-8 lg:pb-8"
        >
          <div className="mx-auto w-full min-w-0 max-w-7xl">
            <Suspense
              fallback={
                <div className="flex min-h-[40vh] w-full items-center justify-center py-12">
                  <AppLoadingState message="Carregando página…" />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </div>
        </main>

        {/* Navegação Inferior Mobile */}
        <MobileBottomNav />

      </div>
    </div>
  )
}

