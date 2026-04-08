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
        backTo={ROUTES.DASHBOARD}
        backLabel="Voltar ao início"
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
            <div className="overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-left">
                    <th className="p-3 font-medium">Cliente</th>
                    <th className="p-3 font-medium hidden md:table-cell">Documento</th>
                    <th className="p-3 font-medium hidden lg:table-cell">Telefone</th>
                    <th className="p-3 font-medium hidden lg:table-cell">E-mail</th>
                    <th className="p-3 font-medium whitespace-nowrap">Status</th>
                    <th className="p-3 font-medium text-right whitespace-nowrap">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((client) => (
                    <tr
                      key={client.id}
                      className="border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer"
                      onClick={() => navigate(ROUTES.CLIENT_DETAIL(client.id))}
                    >
                      <td className="p-3 min-w-0">
                        <div className="font-medium text-foreground truncate">{client.name}</div>
                        <div className="text-xs text-muted-foreground md:hidden truncate">
                          {client.document || 'Sem documento'} · {client.phone || '—'}
                        </div>
                      </td>
                      <td className="p-3 hidden md:table-cell typo-body-muted">
                        {client.document || '—'}
                      </td>
                      <td className="p-3 hidden lg:table-cell typo-body-muted">
                        {client.phone || '—'}
                      </td>
                      <td className="p-3 hidden lg:table-cell typo-body-muted max-w-[240px] truncate">
                        {client.email || '—'}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <AppBadge variant={client.is_active ? 'success' : 'default'}>
                          {client.is_active ? 'Ativo' : 'Inativo'}
                        </AppBadge>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <Link
                          to={ROUTES.CLIENT_EDIT(client.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
                        >
                          <Edit className="h-3 w-3" />
                          Editar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
