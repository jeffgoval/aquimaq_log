import { useRegisterSW } from 'virtual:pwa-register/react'

export function PwaUpdatePrompt() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 shadow-lg">
      <span className="text-sm">Nova versão disponível.</span>
      <button
        className="rounded bg-primary px-3 py-1 text-sm font-medium text-primary-foreground"
        onClick={() => updateServiceWorker(true)}
      >
        Atualizar
      </button>
    </div>
  )
}
