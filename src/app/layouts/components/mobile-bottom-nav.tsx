import { NavLink } from 'react-router-dom'
import { MoreHorizontal } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { MOBILE_BOTTOM_NAV } from '@/app/config/navigation'
import { ROUTES } from '@/shared/constants/routes'
import { useState } from 'react'
import { MobileDrawer } from './mobile-drawer'

export function MobileBottomNav() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Barra inferior */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex max-w-full min-w-0 items-stretch border-t border-border lg:hidden"
        style={{ background: 'hsl(var(--card))', paddingBottom: 'env(safe-area-inset-bottom)' }}
        aria-label="Navegação principal"
      >
        {MOBILE_BOTTOM_NAV.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === ROUTES.DASHBOARD}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium leading-tight transition-colors min-h-[56px] sm:text-xs',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-xl transition-all duration-200',
                    isActive && 'bg-primary/15'
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                </span>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}

        <button
          onClick={() => setDrawerOpen(true)}
          className="flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium leading-tight text-muted-foreground transition-colors hover:text-foreground sm:text-xs"
          aria-label="Mais opções"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-xl transition-all duration-200">
            <MoreHorizontal className="h-5 w-5 shrink-0" />
          </span>
          <span>Mais</span>
        </button>
      </nav>
    </>
  )
}
