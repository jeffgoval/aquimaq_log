import { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { LucideIcon } from 'lucide-react'

interface AppDataCardItem {
  label: string
  value: ReactNode
  className?: string
}

interface AppDataCardProps {
  title: string
  subtitle?: string
  badge?: ReactNode
  icon?: LucideIcon
  iconVariant?: 'default' | 'success' | 'warning' | 'destructive'
  items?: AppDataCardItem[]
  footer?: ReactNode
  onClick?: () => void
  containerClassName?: string
  className?: string
}

export function AppDataCard({
  title,
  subtitle,
  badge,
  icon: Icon,
  iconVariant = 'default',
  items,
  footer,
  onClick,
  containerClassName,
  className,
}: AppDataCardProps) {
  const iconVariants = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-green-400/10 text-green-400',
    warning: 'bg-primary/10 text-primary',
    destructive: 'bg-red-400/10 text-red-400',
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl border border-border bg-card p-4 flex flex-col gap-3 group transition-all',
        onClick && 'cursor-pointer hover:border-primary/30 active:scale-[0.98]',
        containerClassName
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <div className={cn('rounded-lg p-1.5 shrink-0', iconVariants[iconVariant])}>
              <Icon className="h-4 w-4" />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-bold text-foreground text-sm truncate leading-tight">{title}</h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground uppercase font-medium tracking-tight truncate mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {badge}
      </div>

      {items && items.length > 0 && (
        <div className={cn(
          'grid gap-x-4 gap-y-2 py-2 border-y border-border/50',
          items.length === 1 ? 'grid-cols-1' : 'grid-cols-2',
          className
        )}>
          {items.map((item, idx) => (
            <div key={idx} className={cn('min-w-0', item.className)}>
              <p className="text-xs text-muted-foreground uppercase font-semibold leading-none mb-1">
                {item.label}
              </p>
              <div className="text-xs font-bold text-foreground truncate">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {footer && <div className="mt-auto">{footer}</div>}
      
      {!footer && onClick && (
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto opacity-40 group-hover:opacity-100 transition-opacity uppercase font-bold tracking-widest">
          <span>Ver Detalhes</span>
        </div>
      )}
    </div>
  )
}
