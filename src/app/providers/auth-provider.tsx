import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

interface AuthContextType {
  session: Session | null
  user: User | null
  isLoading: boolean
  permissions: string[]
  hasPermission: (code: string) => boolean
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  permissions: [],
  hasPermission: () => false,
})

async function fetchPermissions(): Promise<string[]> {
  const { data, error } = await supabase.rpc('get_my_permissions')
  if (error || !data) return []
  return data as string[]
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [permissions, setPermissions] = useState<string[]>([])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session) setPermissions(await fetchPermissions())
      setIsLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setPermissions(session ? await fetchPermissions() : [])
    })

    return () => subscription.unsubscribe()
  }, [])

  const hasPermission = useCallback((code: string) => permissions.includes(code), [permissions])

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, isLoading, permissions, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
