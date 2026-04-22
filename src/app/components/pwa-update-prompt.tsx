import { useRef, useState } from 'react'
import { RefreshCw, X } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { cn } from '@/shared/lib/cn'

/**
 * Limpa Cache Storage e desregista todos os Service Workers, com teto de tempo
 * por passo (evita promises que nunca resolvem no Safari / PWA reinstalado).
 */
async function clearPwaAndServiceWorkersForReload(): Promise<void> {
  if ('caches' in window) {
    try {
      const names = await Promise.race([
        caches.keys(),
        new Promise<string[]>((r) => {
          setTimeout(() => {
            r([])
          }, 4000)
        }),
      ])
      for (const name of names) {
        try {
          await Promise.race([
            caches.delete(name),
            new Promise<boolean>((r) => {
              setTimeout(() => {
                r(false)
              }, 3000)
            }),
          ])
        } catch {
          /* noop */
        }
      }
    } catch {
      /* noop */
    }
  }

  if ('serviceWorker' in navigator) {
    try {
      const regs = await Promise.race([
        navigator.serviceWorker.getRegistrations(),
        new Promise<ServiceWorkerRegistration[]>((r) => {
          setTimeout(() => {
            r([])
          }, 4000)
        }),
      ])
      await Promise.race([
        Promise.all(regs.map((reg) => reg.unregister())),
        new Promise<void>((r) => {
          setTimeout(r, 4000)
        }),
      ])
    } catch {
      /* noop */
    }
  }
}

export function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
  } = useRegisterSW({
    immediate: true,
    onOfflineReady() {
      if (import.meta.env.DEV) {
        console.info('[PWA] Pronto para uso offline.')
      }
    },
  })

  const [isBusy, setIsBusy] = useState(false)
  const runOnceRef = useRef(false)

  if (!needRefresh) return null

  const handleUpdate = () => {
    if (isBusy || runOnceRef.current) return
    runOnceRef.current = true
    setIsBusy(true)

    // Sempre sair deste fluxo com reload, mesmo que promises fiquem presas.
    const safetyId = window.setTimeout(() => {
      window.location.reload()
    }, 9000)

    void (async () => {
      try {
        await clearPwaAndServiceWorkersForReload()
      } catch {
        /* sem-op: reload cobre tudo */
      } finally {
        window.clearTimeout(safetyId)
        window.location.reload()
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
          disabled={isBusy}
          onClick={handleUpdate}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md bg-primary-foreground px-2.5 py-1.5 text-xs font-semibold',
            'text-primary shadow-sm transition-opacity disabled:opacity-60 sm:px-3 sm:text-sm'
          )}
        >
          <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
          Atualizar
        </button>
        <button
          type="button"
          onClick={() => setNeedRefresh(false)}
          disabled={isBusy}
          className="rounded-md p-1.5 text-primary-foreground/90 transition-colors hover:bg-primary-foreground/15 disabled:opacity-50"
          aria-label="Fechar aviso de atualização"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}
