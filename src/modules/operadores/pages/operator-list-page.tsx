import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, User, Edit } from 'lucide-react'
import { useOperatorList } from '../hooks/use-operator-queries'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppErrorState } from '@/shared/components/app/app-error-state'
import { AppEmptyState } from '@/shared/components/app/app-empty-state'
import { AppBadge } from '@/shared/components/app/app-badge'
import { AppSearchInput } from '@/shared/components/app/app-search-input'
import { AppMoney } from '@/shared/components/app/app-money'
import { ROUTES } from '@/shared/constants/routes'

export function OperatorListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const { data: operators, isLoading, isError, error, refetch } = useOperatorList()

  const filtered = operators?.filter((op) =>
    op.name.toLowerCase().includes(search.toLowerCase()) ||
    op.document?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <AppPageHeader
        backTo={ROUTES.DASHBOARD}
        backLabel="Voltar ao início"
        title="Operadores"
        description="Gestão de operadores e equipe"
        actions={
          <Link
            to={ROUTES.OPERATOR_NEW}
            className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] bg-primary text-primary-foreground rounded-lg text-base font-semibold shadow-lg shadow-primary/20 active:scale-95 transition-all outline-none"
          >
            <Plus className="h-4 w-4" />
            Novo Operador
          </Link>
        }
      />

      <AppSearchInput
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar operador..."
        containerClassName="mb-4"
      />

      {isLoading && <AppLoadingState />}
      {isError && <AppErrorState message={error.message} onRetry={refetch} />}

      {!isLoading && !isError && (
        <>
          {!filtered?.length ? (
            <AppEmptyState
              title="Nenhum operador encontrado"
              description="Tente ajustar sua busca ou cadastrar um novo operador."
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-left">
                    <th className="p-3 font-medium">Operador</th>
                    <th className="p-3 font-medium hidden md:table-cell">Documento</th>
                    <th className="p-3 font-medium hidden lg:table-cell">Telefone</th>
                    <th className="p-3 font-medium whitespace-nowrap hidden lg:table-cell">Taxa/hora</th>
                    <th className="p-3 font-medium whitespace-nowrap">Status</th>
                    <th className="p-3 font-medium text-right whitespace-nowrap">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((operator) => (
                    <tr
                      key={operator.id}
                      className="border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer"
                      onClick={() => navigate(ROUTES.OPERATOR_DETAIL(operator.id))}
                    >
                      <td className="p-3 min-w-0">
                        <div className="font-medium text-foreground truncate">{operator.name}</div>
                        <div className="text-xs text-muted-foreground md:hidden truncate">
                          {operator.document || 'Sem documento'} · {operator.phone || '—'}
                        </div>
                      </td>
                      <td className="p-3 hidden md:table-cell typo-body-muted">
                        {operator.document || '—'}
                      </td>
                      <td className="p-3 hidden lg:table-cell typo-body-muted">
                        {operator.phone || '—'}
                      </td>
                      <td className="p-3 hidden lg:table-cell whitespace-nowrap">
                        <AppMoney value={operator.default_hour_rate ?? 0} size="sm" />
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <AppBadge variant={operator.is_active ? 'success' : 'default'}>
                          {operator.is_active ? 'Ativo' : 'Inativo'}
                        </AppBadge>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <Link
                          to={ROUTES.OPERATOR_EDIT(operator.id)}
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
