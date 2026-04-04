import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut, Tractor } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { NAV_ITEMS } from '@/app/config/navigation'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { ThemeToggle } from '@/shared/components/app/theme-toggle'

export function Sidebar() {
  const navigate = useNavigate()

  async function handleSignOut() {
    await supabase.auth.signOut()
    toast.success('Sessão encerrada')
    navigate('/login')
  }

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-amber shrink-0">
          <Tractor className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-sm text-foreground leading-none">Aquimaq Log</p>
          <p className="text-xs text-muted-foreground mt-0.5">Gestão de Frota</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
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

      {/* Footer / Theme Toggle */}
      <div className="px-3 py-4 border-t border-border flex flex-col gap-1">
        <div className="flex items-center justify-between px-3 py-2 mb-1 rounded-lg bg-secondary/30">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Aparência</span>
          </div>
          <ThemeToggle />
        </div>
        
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  )
}
