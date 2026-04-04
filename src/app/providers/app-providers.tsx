import { QueryProvider } from './query-provider'
import { AuthProvider } from './auth-provider'
import { Toaster } from 'sonner'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          theme="dark"
        />
      </AuthProvider>
    </QueryProvider>
  )
}
