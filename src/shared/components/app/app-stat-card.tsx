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
        'rounded-xl border border-border bg-card p-5 flex flex-col gap-3',
        'hover:border-primary/30 transition-colors duration-200',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {Icon && (
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        )}
      </div>

      <div>
        <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
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
