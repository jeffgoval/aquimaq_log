import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, User, Edit } from 'lucide-react'
import { useClientList } from '../hooks/use-client-queries'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppErrorState } from '@/shared/components/app/app-error-state'
import { AppEmptyState } from '@/shared/components/app/app-empty-state'
import { AppBadge } from '@/shared/components/app/app-badge'
import { AppSearchInput } from '@/shared/components/app/app-search-input'
import { AppDataCard } from '@/shared/components/app/app-data-card'
import { ROUTES } from '@/shared/constants/routes'

export function ClientListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const { data: clients, isLoading, isError, error, refetch } = useClientList()

  const filtered = clients?.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.document?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <AppPageHeader
        title="Clientes"
        description="Gestão de clientes e parceiros"
        actions={
          <Link
            to={ROUTES.CLIENT_NEW}
            className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] bg-primary text-primary-foreground rounded-lg text-base font-semibold shadow-lg shadow-primary/20 active:scale-95 transition-all outline-none"
          >
            <Plus className="h-4 w-4" />
            Novo Cliente
          </Link>
        }
      />

      <AppSearchInput
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar cliente..."
        containerClassName="mb-4"
      />

      {isLoading && <AppLoadingState />}
      {isError && <AppErrorState message={error.message} onRetry={refetch} />}

      {!isLoading && !isError && (
        <>
          {!filtered?.length ? (
            <AppEmptyState
              title="Nenhum cliente encontrado"
              description="Tente ajustar sua busca ou cadastrar um novo cliente."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((client) => (
                <AppDataCard
                  key={client.id}
                  title={client.name}
                  subtitle={client.document || 'Sem documento'}
                  icon={User}
                  onClick={() => navigate(ROUTES.CLIENT_DETAIL(client.id))}
                  badge={
                    <AppBadge variant={client.is_active ? 'success' : 'default'}>
                      {client.is_active ? 'Ativo' : 'Inativo'}
                    </AppBadge>
                  }
                  items={[
                    { label: 'Telefone', value: client.phone || '—' },
                    { label: 'E-mail', value: client.email || '—' },
                  ]}
                  footer={
                    <div className="flex gap-2 pt-1 border-t border-border/50">
                      <Link
                        to={ROUTES.CLIENT_EDIT(client.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
                      >
                        <Edit className="h-3 w-3" />
                        Editar
                      </Link>
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
