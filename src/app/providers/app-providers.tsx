import { QueryProvider } from './query-provider'
import { AuthProvider } from './auth-provider'
import { ThemeProvider } from './theme-provider'
import { Toaster } from 'sonner'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="aquimaq-log-theme">
      <QueryProvider>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{ closeButtonAriaLabel: 'Fechar notificação' }}
            containerAriaLabel="Notificações"
          />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}
