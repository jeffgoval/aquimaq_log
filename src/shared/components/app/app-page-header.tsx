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
    <div className={cn('mb-5 lg:mb-8', className)}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="typo-page-title">{title}</h1>
          {description && <p className="typo-page-description">{description}</p>}
        </div>
        {actions && (
          <div className="flex items-center gap-2 lg:gap-3 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
