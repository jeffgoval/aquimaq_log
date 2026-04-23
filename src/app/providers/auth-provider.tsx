import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

interface AuthContextType {
  session: Session | null
  user: User | null
  /** Só a resolução de `getSession` — não inclui permissões (evita spinner infinito se o RPC falhar ou demorar). */
  isLoading: boolean
  /** Enquanto há sessão e as permissões ainda não foram obtidas (para `RequirePermission`). */
  permissionsLoading: boolean
  permissions: string[]
  hasPermission: (code: string) => boolean
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  permissionsLoading: false,
  permissions: [],
  hasPermission: () => false,
})

const PERMISSIONS_RPC_TIMEOUT_MS = 15_000

async function fetchPermissions(): Promise<string[]> {
  const rpc = supabase.rpc('get_my_permissions')
  const timeout = new Promise<null>((resolve) => {
    setTimeout(() => resolve(null), PERMISSIONS_RPC_TIMEOUT_MS)
  })
  const result = (await Promise.race([rpc, timeout])) as Awaited<typeof rpc> | null
  if (result === null) {
    console.error('get_my_permissions: tempo limite excedido')
    return []
  }
  const { data, error } = result
  if (error || !data) return []
  return data as string[]
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [permissionsLoading, setPermissionsLoading] = useState(false)
  const [permissions, setPermissions] = useState<string[]>([])
  const permissionsFetchGen = useRef(0)

  const loadPermissionsForSession = useCallback((nextSession: Session | null) => {
    if (!nextSession) {
      permissionsFetchGen.current += 1
      setPermissions([])
      setPermissionsLoading(false)
      return
    }
    const gen = ++permissionsFetchGen.current
    setPermissionsLoading(true)
    void fetchPermissions()
      .then((p) => {
        if (gen !== permissionsFetchGen.current) return
        setPermissions(p)
      })
      .catch((err) => {
        console.error('fetchPermissions error:', err)
        if (gen !== permissionsFetchGen.current) return
        setPermissions([])
      })
      .finally(() => {
        if (gen !== permissionsFetchGen.current) return
        setPermissionsLoading(false)
      })
  }, [])

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error('Session error:', error)
        }
        setSession(session)
        loadPermissionsForSession(session)
      })
      .catch((err) => {
        console.error('getSession catch:', err)
      })
      .finally(() => {
        setIsLoading(false)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      loadPermissionsForSession(nextSession)
    })

    return () => subscription.unsubscribe()
  }, [loadPermissionsForSession])

  const hasPermission = useCallback((code: string) => permissions.includes(code), [permissions])

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        isLoading,
        permissionsLoading,
        permissions,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
