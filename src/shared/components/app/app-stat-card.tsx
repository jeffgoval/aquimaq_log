import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
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
  /** Quando definido, o card torna-se um link (navegação no clique). */
  to?: string
}

export function AppStatCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  className,
  children,
  to,
}: AppStatCardProps) {
  const shellClassName = cn(
    'max-w-full min-w-0 rounded-xl border border-border bg-card p-4 lg:p-5 flex flex-col gap-2 lg:gap-3',
    'hover:border-primary/30 transition-colors duration-200',
    to &&
      'cursor-pointer hover:border-primary/40 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 no-underline text-inherit',
    className
  )

  const inner = (
    <>
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
              trend.value >= 0
                ? 'text-green-800 dark:text-green-400'
                : 'text-red-800 dark:text-red-400'
            )}
          >
            {trend.value >= 0 ? '+' : ''}{trend.value}%
          </span>
          <span className="typo-caption">{trend.label}</span>
        </div>
      )}

      {children}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={shellClassName}>
        {inner}
      </Link>
    )
  }

  return <div className={shellClassName}>{inner}</div>
}
