import { NavLink, useNavigate } from 'react-router-dom'
import { X, LogOut, Tractor } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { NAV_ITEMS } from '@/app/config/navigation'
import { ROUTES } from '@/shared/constants/routes'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

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
      <div
        className={cn(
          'pointer-events-none fixed inset-0 z-55 bg-black/60 opacity-0 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          open && 'pointer-events-auto opacity-100'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={cn(
          'fixed top-0 bottom-0 left-0 z-60 flex w-72 -translate-x-full flex-col border-r border-border transition-transform duration-300 ease-in-out lg:hidden',
          open && 'translate-x-0'
        )}
        style={{
          background: 'hsl(var(--card))',
          paddingTop: 'env(safe-area-inset-top)',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="gradient-cat flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
              <Tractor className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-base font-bold leading-none text-foreground">Aquimaq Log</p>
              <p className="typo-caption mt-0.5">Gestão de Frota</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <div key={item.href}>
              {item.sectionLabel && (
                <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 select-none">
                  {item.sectionLabel}
                </p>
              )}
              <NavLink
                to={item.href}
                end={item.href === ROUTES.DASHBOARD}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </NavLink>
            </div>
          ))}
        </nav>

        <div
          className="shrink-0 border-t border-border px-3 py-4"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
        >
          <button
            onClick={handleSignOut}
            className="flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </div>
    </>
  )
}
