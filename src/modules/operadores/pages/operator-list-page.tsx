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
import { AppDataCard } from '@/shared/components/app/app-data-card'
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
        title="Operadores"
        description="Gestão de operadores e equipe"
        actions={
          <Link
            to={ROUTES.OPERATOR_NEW}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all outline-none"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((operator) => (
                <AppDataCard
                  key={operator.id}
                  title={operator.name}
                  subtitle={operator.document || 'Sem documento'}
                  icon={User}
                  onClick={() => navigate(ROUTES.OPERATOR_DETAIL(operator.id))}
                  badge={
                    <AppBadge variant={operator.is_active ? 'success' : 'default'}>
                      {operator.is_active ? 'Ativo' : 'Inativo'}
                    </AppBadge>
                  }
                  items={[
                    { label: 'Telefone', value: operator.phone || '—' },
                    { label: 'Taxa/hora', value: <AppMoney value={operator.default_hour_rate ?? 0} size="sm" /> },
                  ]}
                  footer={
                    <div className="flex gap-2 pt-1 border-t border-border/50">
                      <Link
                        to={ROUTES.OPERATOR_EDIT(operator.id)}
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
