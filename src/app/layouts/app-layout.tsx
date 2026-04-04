import { Outlet } from 'react-router-dom'
import { Sidebar } from './components/sidebar'
import { MobileHeader } from './components/mobile-header'
import { MobileBottomNav } from './components/mobile-bottom-nav'

export function AppLayout() {
  return (
    <div className="flex h-[100dvh] bg-background overflow-hidden">
      {/* Desktop sidebar — hidden on mobile */}
      <Sidebar />

      {/* Mobile fixed header — hidden on desktop (rendered inside MobileHeader itself) */}
      <MobileHeader />

      {/* Main scrollable area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/*
          Mobile: padding-top accounts for the fixed 56px header,
                  padding-bottom accounts for the 56px bottom nav + safe-area.
          Desktop (lg+): normal padding, no header/bottom-nav offsets.
        */}
        <div className="flex-1 p-4 pt-[calc(56px+1rem)] pb-[calc(56px+1rem)] lg:p-6 lg:pt-6 lg:pb-6 max-w-screen-2xl mx-auto w-full">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav — hidden on desktop (rendered inside MobileBottomNav itself) */}
      <MobileBottomNav />
    </div>
  )
}
