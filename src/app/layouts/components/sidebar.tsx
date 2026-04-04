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
    <aside className="w-64 shrink-0 hidden lg:flex flex-col border-r border-border bg-card shadow-sm h-full z-10 relative">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 h-[72px] border-b border-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shrink-0">
          <Tractor className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <p className="text-base font-bold text-foreground leading-tight tracking-tight">Aquimaq Log</p>
          <p className="typo-section-label mt-0.5">Gestão de Frota</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto no-scrollbar">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === '/'}
            className={({ isActive }) =>
              cn(
                'typo-nav-item flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive
                  ? 'typo-nav-item-active bg-primary text-primary-foreground shadow-md shadow-primary/20'
                  : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
              )
            }
          >
            <item.icon className={cn("h-4 w-4 shrink-0", ({ isActive }: any) => isActive ? 'text-primary-foreground' : 'text-muted-foreground')} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer / Theme Toggle */}
      <div className="p-4 border-t border-border flex flex-col gap-2">
        <ThemeToggle variant="switch" />
        
        <button
          onClick={handleSignOut}
          className="typo-nav-item flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-destructive"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sair
        </button>
      </div>
    </aside>
  )
}
