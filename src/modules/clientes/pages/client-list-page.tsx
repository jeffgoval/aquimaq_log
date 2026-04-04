import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, Building2 } from 'lucide-react'
import { useClientList } from '../hooks/use-client-queries'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppErrorState } from '@/shared/components/app/app-error-state'
import { AppEmptyState } from '@/shared/components/app/app-empty-state'
import { cn } from '@/shared/lib/cn'
import { ROUTES } from '@/shared/constants/routes'

export function ClientListPage() {
  const { data, isLoading, isError, error, refetch } = useClientList()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const filtered = data?.filter(c => [c.name, c.document, c.phone, c.email].some(v => v?.toLowerCase().includes(search.toLowerCase()))) ?? []

  return (
    <div>
      <AppPageHeader
        title="Clientes"
        description="Gestão de clientes e contratos"
        actions={
          <Link to={ROUTES.CLIENT_NEW} className="flex items-center gap-2 gradient-amber text-white font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm">
            <Plus className="h-4 w-4" />Novo cliente
          </Link>
        }
      />
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente..." className="w-full rounded-lg border border-input bg-input pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      {isLoading && <AppLoadingState />}
      {isError && <AppErrorState message={error.message} onRetry={refetch} />}
      {!isLoading && !isError && (
        filtered.length === 0 ? <AppEmptyState title="Nenhum cliente encontrado" action={<Link to={ROUTES.CLIENT_NEW} className="text-primary text-sm hover:underline">Cadastrar cliente</Link>} />
          : <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(client => (
              <div key={client.id} onClick={() => navigate(ROUTES.CLIENT_DETAIL(client.id))}
                className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-colors cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-lg bg-primary/10 p-2.5"><Building2 className="h-5 w-5 text-primary" /></div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground text-sm truncate">{client.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{client.document || client.email || 'Sem documento'}</p>
                  </div>
                  <span className={cn('ml-auto text-xs font-medium px-2 py-0.5 rounded-full shrink-0', client.is_active ? 'bg-green-400/10 text-green-400' : 'bg-muted text-muted-foreground')}>
                    {client.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{client.phone || '—'}</p>
              </div>
            ))}
          </div>
      )}
    </div>
  )
}
