import { type ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { type LucideIcon } from 'lucide-react'

interface AppStatCardProps {
  title: string
  value: React.ReactNode
  icon?: LucideIcon
  trend?: { value: number; label: string }
  description?: string
  className?: string
  children?: ReactNode
}

export function AppStatCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  className,
  children,
}: AppStatCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-4 lg:p-5 flex flex-col gap-2 lg:gap-3',
        'hover:border-primary/30 transition-colors duration-200',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs lg:text-sm font-medium text-muted-foreground">{title}</p>
        {Icon && (
          <div className="rounded-lg bg-primary/10 p-1.5 lg:p-2">
            <Icon className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-primary" />
          </div>
        )}
      </div>

      <div>
        <p className="text-xl lg:text-2xl font-bold tracking-tight text-foreground leading-none">{value}</p>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{description}</p>
        )}
      </div>

      {trend && (
        <div className="flex items-center gap-1">
          <span
            className={cn(
              'text-xs font-medium',
              trend.value >= 0 ? 'text-green-400' : 'text-red-400'
            )}
          >
            {trend.value >= 0 ? '+' : ''}{trend.value}%
          </span>
          <span className="text-xs text-muted-foreground">{trend.label}</span>
        </div>
      )}

      {children}
    </div>
  )
}
