import { useState } from 'react'
import { Tractor, Menu } from 'lucide-react'
import { MobileDrawer } from './mobile-drawer'
import { ThemeToggle } from '@/shared/components/app/theme-toggle'

export function MobileHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 border-b border-border shrink-0"
        style={{
          background: 'hsl(var(--card))',
          height: '56px',
          paddingTop: 'env(safe-area-inset-top)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-amber shrink-0">
            <Tractor className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-sm text-foreground">Aquimaq Log</span>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center justify-center h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Abrir menu de navegação"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>
    </>
  )
}
