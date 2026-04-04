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
    success: 'bg-green-400/10 text-green-400',
    destructive: 'bg-red-400/10 text-red-400',
    warning: 'bg-amber-400/10 text-amber-400',
    info: 'bg-blue-400/10 text-blue-400',
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
