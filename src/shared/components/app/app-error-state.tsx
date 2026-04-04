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
      <p className="text-sm font-medium">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm text-muted-foreground underline hover:text-foreground transition-colors"
        >
          Tentar novamente
        </button>
      )}
    </div>
  )
}
