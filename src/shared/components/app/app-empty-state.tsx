import { InboxIcon } from 'lucide-react'

interface AppEmptyStateProps {
  title?: string
  description?: string
  action?: React.ReactNode
}

export function AppEmptyState({
  title = 'Nenhum registro encontrado',
  description,
  action,
}: AppEmptyStateProps) {
  return (
    <div className="flex h-48 flex-col items-center justify-center gap-3 text-muted-foreground">
      <InboxIcon className="h-10 w-10 opacity-40" />
      <p className="text-base font-medium text-foreground">{title}</p>
      {description && <p className="typo-body-muted max-w-sm text-center">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
