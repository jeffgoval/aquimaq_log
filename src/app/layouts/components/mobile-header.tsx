import { Tractor } from 'lucide-react'
import { ThemeToggle } from '@/shared/components/app/theme-toggle'

export function MobileHeader() {
  return (
    <header
      className="fixed left-0 right-0 top-0 z-40 flex max-w-full min-w-0 shrink-0 items-center justify-between border-b border-border px-4 lg:hidden"
      style={{
        background: 'hsl(var(--card))',
        height: '56px',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      {/* Logo */}
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary">
          <Tractor className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="truncate text-base font-bold tracking-tight text-foreground">Aquimaq Log</span>
      </div>

      {/* Toolbar */}
      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  )
}
