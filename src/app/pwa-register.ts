import { registerSW } from 'virtual:pwa-register'

/** Evento disparado quando existe build novo (registerType: prompt). */
export const EVENT_PWA_NEED_REFRESH = 'aquimaq:pwa-need-refresh'

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
