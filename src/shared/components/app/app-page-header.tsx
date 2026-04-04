import { type ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

interface AppPageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

export function AppPageHeader({ title, description, actions, className }: AppPageHeaderProps) {
  return (
    <div className={cn('mb-6', className)}>
      {/* On mobile: stack vertically. On lg+: side by side */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl lg:text-2xl font-bold text-foreground tracking-tight">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
