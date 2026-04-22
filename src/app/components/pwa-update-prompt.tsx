import { useState } from 'react'
import { RefreshCw, X } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { cn } from '@/shared/lib/cn'

export function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onOfflineReady() {
      if (import.meta.env.DEV) {
        console.info('[PWA] Pronto para uso offline.')
      }
    },
  })

  const [isUpdating, setIsUpdating] = useState(false)

  if (!needRefresh) return null

  const handleUpdate = () => {
    if (isUpdating) return
    setIsUpdating(true)

    // `updateServiceWorker` pode ficar pendente (ex.: mensagem ao SW sem resposta).
    // Recarregamos no `controllerchange` (caminho normal) ou após timeout (fallback).
    const fallbackMs = 4000
    const raceMs = 2000
    let fallbackId: ReturnType<typeof setTimeout> | undefined

    const clearFallback = () => {
      if (fallbackId !== undefined) {
        window.clearTimeout(fallbackId)
        fallbackId = undefined
      }
    }

    const reload = () => {
      clearFallback()
      window.location.reload()
    }

    fallbackId = window.setTimeout(reload, fallbackMs)

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', reload, { once: true })
    }

    void (async () => {
      try {
        await Promise.race([
          updateServiceWorker(true),
          new Promise<void>((resolve) => {
            window.setTimeout(resolve, raceMs)
          }),
        ])
      } catch {
        // ignorar — o fallback ou controllerchange trata o reload
      } finally {
        setIsUpdating(false)
      }
    })()
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed inset-x-0 top-0 z-60 flex min-h-11 w-full items-center justify-center gap-2 border-b border-primary/25',
        'bg-primary px-3 py-2 text-primary-foreground shadow-md sm:gap-3 sm:px-4'
      )}
      style={{ paddingTop: 'max(0.375rem, env(safe-area-inset-top, 0px))' }}
    >
      <span className="min-w-0 flex-1 truncate text-center text-xs font-medium sm:text-sm">
        Nova versão disponível — toque para atualizar
      </span>
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          disabled={isUpdating}
          onClick={handleUpdate}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md bg-primary-foreground px-2.5 py-1.5 text-xs font-semibold',
            'text-primary shadow-sm transition-opacity disabled:opacity-60 sm:px-3 sm:text-sm'
          )}
        >
          <RefreshCw className={cn('h-3.5 w-3.5 sm:h-4 sm:w-4', isUpdating && 'animate-spin')} aria-hidden />
          {isUpdating ? 'A atualizar…' : 'Atualizar'}
        </button>
        <button
          type="button"
          onClick={() => setNeedRefresh(false)}
          disabled={isUpdating}
          className="rounded-md p-1.5 text-primary-foreground/90 transition-colors hover:bg-primary-foreground/15 disabled:opacity-50"
          aria-label="Fechar aviso de atualização"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}
