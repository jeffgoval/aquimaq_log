import { Tractor } from 'lucide-react'
import { ThemeToggle } from '@/shared/components/app/theme-toggle'

export function MobileHeader() {
  return (
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
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary shrink-0">
          <Tractor className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-sm text-foreground tracking-tight">Aquimaq Log</span>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  )
}
