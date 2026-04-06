import { useEffect } from 'react'
import type { RefObject } from 'react'
import { useLocation } from 'react-router-dom'

interface ScrollToTopProps {
  /** Área rolável da app (ex.: `<main>`); além disso, corrige `window` para auth/outros. */
  scrollContainerRef?: RefObject<HTMLElement | null>
}

export const ScrollToTop = ({ scrollContainerRef }: ScrollToTopProps) => {
  const { pathname, search, hash } = useLocation()

  useEffect(() => {
    const apply = (): void => {
      const el = scrollContainerRef?.current
      if (el) {
        el.scrollTop = 0
        el.scrollLeft = 0
      }
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }

    apply()
    const raf = requestAnimationFrame(apply)
    const t = window.setTimeout(apply, 0)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(t)
    }
  }, [pathname, search, hash, scrollContainerRef])

  return null
}
