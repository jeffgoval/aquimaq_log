import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5min — dados em cache ainda válidos ao navegar
      gcTime: 1000 * 60 * 60 * 24, // 24h — mantém cache entre sessões
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'aquimaq-query-cache',
})

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24, // 24h
        buster: import.meta.env.VITE_APP_VERSION ?? '1',
      }}
    >
      {children}
    </PersistQueryClientProvider>
  )
}
