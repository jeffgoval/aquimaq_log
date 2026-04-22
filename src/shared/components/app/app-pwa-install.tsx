import { useEffect, useMemo, useState } from 'react'
import { Download, Share, X } from 'lucide-react'
import { toast } from 'sonner'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function detectBrowsers(): {
  isIOS: boolean
  isSamsungInternet: boolean
  isFirefox: boolean
} {
  const ua = navigator.userAgent
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream
  const isSamsungInternet = /SamsungBrowser/i.test(ua)
  const isFirefox = /Firefox/i.test(ua) && !/Seamonkey/i.test(ua)

  return { isIOS, isSamsungInternet, isFirefox }
}

export function AppPwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  const { isIOS, isSamsungInternet, isFirefox } = useMemo(() => detectBrowsers(), [])

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsStandalone(standalone)

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      if (!standalone) setIsVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    let delayedShowId: ReturnType<typeof setTimeout> | undefined

    if (isIOS && !standalone) {
      const shownThisSession = sessionStorage.getItem('pwa-ios-prompt-shown')
      if (!shownThisSession) {
        setIsVisible(true)
      }
    } else if (!isIOS && !standalone) {
      delayedShowId = window.setTimeout(() => {
        setIsVisible((visible) => visible || !standalone)
      }, 2000)
    }

    return () => {
      if (delayedShowId !== undefined) window.clearTimeout(delayedShowId)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [isIOS])

  const showManualInstallToast = () => {
    if (isIOS) {
      toast.message('Instalar no iPhone / iPad', {
        description:
          'Ícone Partilhar (quadrado com seta) → «Adicionar ao ecrã inicial». O Safari não mostra o mesmo botão que no Android.',
      })
      return
    }

    if (isSamsungInternet) {
      toast.message('Samsung Internet', {
        description:
          'Se o site for reconhecido como app, aparece um «+» na barra de endereços: toque nele e escolha «Ecrã inicial». Se não aparecer, menu (⋮) → «Adicionar página a» / «Adicionar atalho» → Ecrã inicial. O texto pode variar com o idioma do telemóvel.',
      })
      return
    }

    if (isFirefox) {
      toast.message('Firefox', {
        description:
          'No Android, o Firefox costuma só criar atalho (menu ⋮ → «Instalar» ou «Adicionar página ao ecrã principal»). Para instalação completa em ecrã inteiro, experimente Samsung Internet ou Chrome.',
      })
      return
    }

    toast.message('Instalar no telemóvel', {
      description:
        'Abra o menu do navegador (⋮ ou …) e procure «Instalar aplicação», «Adicionar ao ecrã inicial» ou «Instalar app». O nome do menu depende do navegador e do idioma.',
    })
  }

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      showManualInstallToast()
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

  const hintText = (() => {
    if (isIOS) {
      return 'Toque em Partilhar e depois em «Adicionar ao ecrã inicial».'
    }
    if (isSamsungInternet) {
      return deferredPrompt
        ? 'Pode usar o botão Instalar ou o «+» na barra de endereços → Ecrã inicial.'
        : 'Procure o «+» junto ao endereço ou menu (⋮) → adicionar à página inicial / ecrã inicial.'
    }
    if (isFirefox) {
      return deferredPrompt
        ? 'Instale para abrir em ecrã inteiro, se o Firefox permitir.'
        : 'Menu ⋮ → «Instalar» ou «Adicionar ao ecrã». Para PWA completa, use Samsung Internet ou Chrome.'
    }
    return deferredPrompt
      ? 'Instale para abrir em ecrã inteiro, como uma aplicação.'
      : 'Menu do navegador (⋮ ou …) → «Instalar aplicação» ou «Adicionar ao ecrã inicial».'
  })()

  const installButtonLabel = !deferredPrompt && (isSamsungInternet || isFirefox) ? 'Como instalar' : 'Instalar'

  return (
    <div className="fixed bottom-20 left-4 right-4 z-110 mx-auto w-[calc(100%-2rem)] max-w-md animate-in slide-in-from-bottom-5 duration-300 sm:left-auto sm:right-6 sm:ml-auto sm:mr-0">
      <div className="flex max-w-full min-w-0 items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-card/95 p-4 shadow-2xl backdrop-blur-xl sm:gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="gradient-cat flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-lg shadow-primary/20">
            <Download className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold wrap-break-word text-foreground">Instalar Aquimaq Log</p>
            {isIOS ? (
              <div className="mt-0.5 flex items-start gap-1.5">
                <Share className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                <p className="text-xs leading-tight wrap-break-word text-muted-foreground">{hintText}</p>
              </div>
            ) : (
              <p className="mt-0.5 text-xs wrap-break-word text-muted-foreground">{hintText}</p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {!isIOS && (
            <button
              type="button"
              onClick={handleInstallClick}
              className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
            >
              {installButtonLabel}
            </button>
          )}
          <button
            type="button"
            onClick={closeBanner}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
