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
        <p className="typo-kpi-label text-xs lg:text-sm">{title}</p>
        {Icon && (
          <div className="rounded-lg bg-primary/10 p-1.5 lg:p-2">
            <Icon className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-primary" />
          </div>
        )}
      </div>

      <div>
        <p className="typo-kpi-value">{value}</p>
        {description && (
          <p className="typo-caption mt-1 line-clamp-1">{description}</p>
        )}
      </div>

      {trend && (
        <div className="flex items-center gap-1">
          <span
            className={cn(
              'typo-caption font-medium',
              trend.value >= 0 ? 'text-green-400' : 'text-red-400'
            )}
          >
            {trend.value >= 0 ? '+' : ''}{trend.value}%
          </span>
          <span className="typo-caption">{trend.label}</span>
        </div>
      )}

      {children}
    </div>
  )
}
