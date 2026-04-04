import { useEffect, useState } from 'react'
import { Download, Share, X } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

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
    // Detect if already installed (standalone mode)
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone
    setIsStandalone(isStandaloneMode)

    // Detect iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(isIosDevice)

    // Capture the installation prompt (non-iOS)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Only show banner after a small delay or user interaction logic
      if (!isStandaloneMode) setIsVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // On iOS, we show the banner once per session if not standalone
    if (isIosDevice && !isStandaloneMode) {
      const shownThisSession = sessionStorage.getItem('pwa-ios-prompt-shown')
      if (!shownThisSession) {
        setIsVisible(true)
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [isStandalone])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    
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
    <div className="fixed bottom-20 left-4 right-4 z-[100] lg:hidden animate-in slide-in-from-bottom-5 duration-300">
      <div className="rounded-2xl border border-primary/20 bg-card/95 backdrop-blur-xl p-4 shadow-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-cat shrink-0 shadow-lg shadow-primary/20">
            <Download className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Instalar Aquimaq Log</p>
            {isIOS ? (
              <div className="flex items-center gap-1.5 mt-0.5">
                <Share className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground leading-tight">
                  Toque em "Compartilhar" e "Adicionar à Tela de Início"
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Experimente como um app nativo</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isIOS && (
            <button
              onClick={handleInstallClick}
              className="bg-primary text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 active:scale-95 transition-all"
            >
              Baixar
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
