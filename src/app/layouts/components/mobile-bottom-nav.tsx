import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Tractor, ClipboardList, DollarSign, MoreHorizontal } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { ROUTES } from '@/shared/constants/routes'
import { useState } from 'react'
import { MobileDrawer } from './mobile-drawer'

const PRIMARY_NAV = [
  { label: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard, end: true },
  { label: 'Tratores', href: ROUTES.TRACTORS, icon: Tractor, end: false },
  { label: 'Serviços', href: ROUTES.SERVICES, icon: ClipboardList, end: false },
  { label: 'Financeiro', href: ROUTES.RECEIVABLES, icon: DollarSign, end: false },
]

export function MobileBottomNav() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Bottom nav bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch border-t border-border"
        style={{ background: 'hsl(var(--card))', paddingBottom: 'env(safe-area-inset-bottom)' }}
        aria-label="Navegação principal"
      >
        {PRIMARY_NAV.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors min-h-[56px]',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className={cn(
                  'flex items-center justify-center w-7 h-7 rounded-xl transition-all duration-200',
                  isActive && 'bg-primary/15'
                )}>
                  <item.icon className="h-5 w-5 shrink-0" />
                </span>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* More button */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors min-h-[56px]"
          aria-label="Mais opções"
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-xl transition-all duration-200">
            <MoreHorizontal className="h-5 w-5 shrink-0" />
          </span>
          <span>Mais</span>
        </button>
      </nav>
    </>
  )
}
