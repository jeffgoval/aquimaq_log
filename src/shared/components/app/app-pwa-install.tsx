import { useEffect, useState } from 'react'
import { Download, Share, X } from 'lucide-react'
import { toast } from 'sonner'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function AppPwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsStandalone(standalone)

    const isIosDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream
    setIsIOS(isIosDevice)

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      if (!standalone) setIsVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    let delayedShowId: ReturnType<typeof setTimeout> | undefined

    if (isIosDevice && !standalone) {
      const shownThisSession = sessionStorage.getItem('pwa-ios-prompt-shown')
      if (!shownThisSession) {
        setIsVisible(true)
      }
    } else if (!isIosDevice && !standalone) {
      delayedShowId = window.setTimeout(() => {
        setIsVisible((visible) => visible || !standalone)
      }, 2000)
    }

    return () => {
      if (delayedShowId !== undefined) window.clearTimeout(delayedShowId)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast.message('Instalação no Chrome/Edge', {
        description:
          'Menu (⋮ ou …) do canto superior → "Instalar Aquimaq Log" ou "Aplicação" / "Adicionar ao ecrã". No iPhone use Partilhar → Ecrã inicial.',
      })
      return
    }

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setIsVisible(false)
    }
  }

  const closeBanner = () => {
    setIsVisible(false)
    if (isIOS) {
      sessionStorage.setItem('pwa-ios-prompt-shown', 'true')
    }
  }

  if (isStandalone || !isVisible) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-100 max-w-md mx-auto w-[calc(100%-2rem)] sm:left-auto sm:right-6 sm:ml-auto sm:mr-0 animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex max-w-full min-w-0 items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-card/95 p-4 shadow-2xl backdrop-blur-xl sm:gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-cat shrink-0 shadow-lg shadow-primary/20">
            <Download className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold wrap-break-word text-foreground">Instalar Aquimaq Log</p>
            {isIOS ? (
              <div className="mt-0.5 flex items-start gap-1.5">
                <Share className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                <p className="text-xs leading-tight wrap-break-word text-muted-foreground">
                  Toque em "Compartilhar" e depois em "Adicionar à Tela de Início".
                </p>
              </div>
            ) : (
              <p className="text-xs wrap-break-word text-muted-foreground">
                {deferredPrompt
                  ? 'Instale para abrir em ecrã inteiro, como app.'
                  : 'Se o botão não abrir a instalação, use o menu (⋮) do browser e escolha "Instalar aplicação".'}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isIOS && (
            <button
              onClick={handleInstallClick}
              className="bg-primary text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 active:scale-95 transition-all"
            >
              Instalar
            </button>
          )}
          <button
            onClick={closeBanner}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
