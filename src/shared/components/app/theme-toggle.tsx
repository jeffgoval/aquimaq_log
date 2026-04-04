import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/app/providers/theme-provider'
import { cn } from '@/shared/lib/cn'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-all hover:bg-secondary hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring',
        className
      )}
      aria-label="Alternar tema claro/escuro"
    >
      {/* Icon Sun (rotates when hidden) */}
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      {/* Icon Moon (rotates and scales in when hidden) */}
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </button>
  )
}
