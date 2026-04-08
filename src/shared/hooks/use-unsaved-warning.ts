import { useEffect } from 'react'
import { useBlocker } from 'react-router-dom'

/**
 * Bloqueia a navegação e mostra um confirm() do navegador quando há
 * alterações não salvas no formulário (isDirty === true).
 */
export function useUnsavedWarning(isDirty: boolean) {
  // Bloqueia navegação interna do React Router
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname,
  )

  useEffect(() => {
    if (blocker.state === 'blocked') {
      const confirmed = window.confirm(
        'Você tem alterações não salvas.\n\nDeseja sair mesmo assim? As alterações serão perdidas.',
      )
      if (confirmed) {
        blocker.proceed()
      } else {
        blocker.reset()
      }
    }
  }, [blocker])

  // Bloqueia reload/fechar aba
  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])
}
