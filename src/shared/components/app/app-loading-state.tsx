import { cn } from '@/shared/lib/cn'
import { Loader2 } from 'lucide-react'

interface AppLoadingStateProps {
  fullScreen?: boolean
  message?: string
}

export function AppLoadingState({ fullScreen, message = 'Carregando...' }: AppLoadingStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 text-muted-foreground',
        fullScreen ? 'h-screen w-screen bg-background' : 'h-48 w-full'
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}
