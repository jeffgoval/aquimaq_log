import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { shouldPersistQuery } from './query-persist-filter'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Em dev: sem persistência + dados "stale" imediato → F5 reflete API e evita sensação de "nada mudou".
      staleTime: import.meta.env.DEV ? 0 : 1000 * 60 * 5,
      gcTime: import.meta.env.DEV ? 1000 * 60 * 30 : 1000 * 60 * 60 * 24,
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
  if (import.meta.env.DEV) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24, // 24h
        buster: import.meta.env.VITE_APP_VERSION ?? '1',
        dehydrateOptions: {
          shouldDehydrateQuery: shouldPersistQuery,
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  )
}
