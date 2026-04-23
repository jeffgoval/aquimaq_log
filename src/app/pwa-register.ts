import { registerSW } from 'virtual:pwa-register'

/** Evento disparado quando existe build novo (registerType: prompt). */
export const EVENT_PWA_NEED_REFRESH = 'aquimaq:pwa-need-refresh'

// Force-update the SW on every page load so stuck/broken SWs are replaced quickly.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready
    .then((reg) => reg.update())
    .catch(() => {
      // If the active SW is unrecoverable, unregister all and reload once.
      navigator.serviceWorker.getRegistrations().then((regs) => {
        if (regs.length === 0) return
        const RELOAD_KEY = 'pwa-sw-force-reload'
        if (sessionStorage.getItem(RELOAD_KEY)) return
        sessionStorage.setItem(RELOAD_KEY, '1')
        Promise.all(regs.map((r) => r.unregister())).then(() => window.location.reload())
      })
    })
}

/**
 * Regista o Service Worker o mais cedo possível (import no main).
 * O Chrome só considera a app “instalável” com SW ativo; registar só dentro
 * de um componente React chega tarde para o `beforeinstallprompt`.
 */
export const updateServiceWorker = registerSW({
  immediate: true,
  onNeedRefresh() {
    window.dispatchEvent(new CustomEvent(EVENT_PWA_NEED_REFRESH))
  },
  onOfflineReady() {
    if (import.meta.env.DEV) {
      console.info('[PWA] Pronto para uso offline.')
    }
  },
})
