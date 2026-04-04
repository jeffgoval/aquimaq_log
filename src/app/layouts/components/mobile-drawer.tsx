import { NavLink, useNavigate } from 'react-router-dom'
import { X, LogOut, Tractor, LayoutDashboard, Users, Building2, ClipboardList, DollarSign, Wrench, TrendingUp } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { ROUTES } from '@/shared/constants/routes'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

const ALL_NAV = [
  { label: 'Dashboard',     href: ROUTES.DASHBOARD,     icon: LayoutDashboard, end: true },
  { label: 'Tratores',      href: ROUTES.TRACTORS,      icon: Tractor,         end: false },
  { label: 'Operadores',    href: ROUTES.OPERATORS,     icon: Users,           end: false },
  { label: 'Clientes',      href: ROUTES.CLIENTS,       icon: Building2,       end: false },
  { label: 'Serviços',      href: ROUTES.SERVICES,      icon: ClipboardList,   end: false },
  { label: 'Financeiro',    href: ROUTES.RECEIVABLES,   icon: DollarSign,      end: false },
  { label: 'Custos',        href: ROUTES.MACHINE_COSTS, icon: Wrench,          end: false },
  { label: 'Rentabilidade', href: ROUTES.PROFITABILITY, icon: TrendingUp,      end: false },
]

interface MobileDrawerProps {
  open: boolean
  onClose: () => void
}

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const navigate = useNavigate()

  async function handleSignOut() {
    await supabase.auth.signOut()
    toast.success('Sessão encerrada')
    navigate('/login')
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={cn(
          'lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 flex flex-col transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ background: 'linear-gradient(180deg, hsl(222 25% 9%) 0%, hsl(222 20% 7%) 100%)' }}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-amber shrink-0">
              <Tractor className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground leading-none">Aquimaq Log</p>
              <p className="text-xs text-muted-foreground mt-0.5">Gestão de Frota</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {ALL_NAV.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-150 min-h-[44px]',
                  isActive
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-border shrink-0" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors min-h-[44px]"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </div>
    </>
  )
}
