import { AlertTriangle } from 'lucide-react'

interface AppErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function AppErrorState({
  message = 'Erro ao carregar dados.',
  onRetry,
}: AppErrorStateProps) {
  return (
    <div className="flex h-48 flex-col items-center justify-center gap-3 text-destructive">
      <AlertTriangle className="h-8 w-8" />
      <p className="text-base font-medium">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="typo-body text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
        >
          Tentar novamente
        </button>
      )}
    </div>
  )
}
