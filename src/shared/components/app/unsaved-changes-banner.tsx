import { AlertCircle } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

interface UnsavedChangesBannerProps {
  isDirty: boolean
  className?: string
}

/**
 * Faixa discreta no topo do formulário indicando alterações não salvas.
 * Visível apenas quando isDirty === true.
 */
export function UnsavedChangesBanner({ isDirty, className }: UnsavedChangesBannerProps) {
  if (!isDirty) return null

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
        className,
      )}
    >
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span className="font-medium">Alterações não salvas</span>
      <span className="text-amber-700 dark:text-amber-400">— lembre-se de salvar antes de sair.</span>
    </div>
  )
}
