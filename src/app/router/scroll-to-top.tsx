import { useEffect, useLayoutEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

/** ID do `<main>` rolável em `AppLayout` — usado após navegação mesmo quando o hook corre na raiz do router. */
export const APP_MAIN_SCROLL_ID = 'app-main-scroll'

const scrollAllToTop = (): void => {
  document.getElementById(APP_MAIN_SCROLL_ID)?.scrollTo(0, 0)
  window.scrollTo(0, 0)
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
}

/**
 * Garante topo em toda mudança de rota (pathname/search/hash).
 * - useLayoutEffect: antes da pintura (evita flash no meio da página).
 * - timeouts: conteúdo lazy/Suspense monta depois e pode alterar altura/scroll.
 * - history.scrollRestoration = 'manual': o browser não repõe posição antiga sozinho.
 */
export const useScrollToTopOnRouteChange = (): void => {
  const { pathname, search, hash } = useLocation()
  const routeKey = `${pathname}${search}${hash}`
  const didSetRestoration = useRef(false)

  useEffect(() => {
    if (didSetRestoration.current) return
    didSetRestoration.current = true
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  useLayoutEffect(() => {
    scrollAllToTop()
  }, [routeKey])

  useEffect(() => {
    scrollAllToTop()
    const t0 = window.setTimeout(scrollAllToTop, 0)
    const t1 = window.setTimeout(scrollAllToTop, 50)
    const t2 = window.setTimeout(scrollAllToTop, 150)
    const t3 = window.setTimeout(scrollAllToTop, 400)
    return () => {
      window.clearTimeout(t0)
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.clearTimeout(t3)
    }
  }, [routeKey])
}

/** Envolve todas as rotas para o scroll reagir a qualquer navegação (login, app, etc.). */
export const AppRouteShell = () => {
  useScrollToTopOnRouteChange()
  return <Outlet />
}
