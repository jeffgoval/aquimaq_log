import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

interface AppPageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
  /** Rota para voltar (lista, detalhe ou dashboard). Visível em todos os breakpoints. */
  backTo?: string
  backLabel?: string
}

export function AppPageHeader({
  title,
  description,
  actions,
  className,
  backTo,
  backLabel = 'Voltar',
}: AppPageHeaderProps) {
  return (
    <div className={cn('mb-5 lg:mb-8', className)}>
      {backTo ? (
        <div className="mb-3">
          <Link
            to={backTo}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md -ml-1 px-1 py-0.5"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
            {backLabel}
          </Link>
        </div>
      ) : null}
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
