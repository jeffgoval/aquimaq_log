import { EnvConfigMissingScreen } from '@/app/components/env-config-missing-screen'
import { PwaUpdatePrompt } from '@/app/components/pwa-update-prompt'
import { envConfigMessage } from '@/app/config/env'
import { QueryProvider } from './query-provider'
import { AuthProvider } from './auth-provider'
import { ThemeProvider } from './theme-provider'
import { Toaster } from 'sonner'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="aquimaq-log-theme">
      {envConfigMessage ? (
        <EnvConfigMissingScreen />
      ) : (
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
            <PwaUpdatePrompt />
          </AuthProvider>
        </QueryProvider>
      )}
    </ThemeProvider>
  )
}
