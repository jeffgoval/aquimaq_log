import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/app/providers/theme-provider'
import { cn } from '@/shared/lib/cn'

interface ThemeToggleProps {
  className?: string
  variant?: 'icon' | 'switch'
}

export function ThemeToggle({ className, variant = 'icon' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  if (variant === 'switch') {
    return (
      <button
        onClick={toggleTheme}
        className={cn(
          'flex items-center justify-between w-full px-3 py-2.5 rounded-lg border border-border bg-card hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-ring',
          className
        )}
      >
        <span className="text-sm font-medium text-foreground">Modo Escuro</span>
        <div 
          className={cn(
            "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
            theme === 'dark' ? 'bg-primary' : 'bg-input'
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background ring-0 transition duration-200 ease-in-out shadow-sm",
              theme === 'dark' ? 'translate-x-4' : 'translate-x-0'
            )}
          />
        </div>
      </button>
    )
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
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </button>
  )
}
