import { cn } from '@/shared/lib/cn'

type AppBadgeVariant = 'default' | 'success' | 'destructive' | 'warning' | 'info' | 'outline'

interface AppBadgeProps {
  children: React.ReactNode
  variant?: AppBadgeVariant
  className?: string
}

export function AppBadge({ children, variant = 'default', className }: AppBadgeProps) {
  const variants = {
    default: 'bg-muted text-muted-foreground',
    success:
      'bg-green-100 text-green-900 dark:bg-green-500/15 dark:text-green-400',
    destructive:
      'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400',
    warning: 'bg-primary/10 text-primary',
    info:
      'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-400',
    outline: 'border border-border text-muted-foreground',
  }

  return (
    <span className={cn(
      'text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter shrink-0 inline-flex items-center justify-center',
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}
