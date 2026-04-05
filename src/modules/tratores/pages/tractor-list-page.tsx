import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Tractor, Edit, PowerOff } from 'lucide-react'
import { useTractorList, useDeactivateTractor } from '../hooks/use-tractor-queries'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppErrorState } from '@/shared/components/app/app-error-state'
import { AppEmptyState } from '@/shared/components/app/app-empty-state'
import { AppMoney } from '@/shared/components/app/app-money'
import { AppBadge } from '@/shared/components/app/app-badge'
import { AppSearchInput } from '@/shared/components/app/app-search-input'
import { AppDataCard } from '@/shared/components/app/app-data-card'
import { ROUTES } from '@/shared/constants/routes'

export function TractorListPage() {
  const { data, isLoading, isError, error, refetch } = useTractorList()
  const deactivate = useDeactivateTractor()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const filtered = data?.filter((t) =>
    [t.name, t.plate, t.brand, t.model].some((v) =>
      v?.toLowerCase().includes(search.toLowerCase())
    )
  ) ?? []

  return (
    <div>
      <AppPageHeader
        backTo={ROUTES.DASHBOARD}
        backLabel="Voltar ao início"
        title="Tratores"
        description="Gestão da frota e custos operacionais"
        actions={
          <Link
            to={ROUTES.TRACTOR_NEW}
            className="flex items-center gap-2 gradient-cat text-primary-foreground font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm"
          >
            <Plus className="h-4 w-4" />
            Novo trator
          </Link>
        }
      />

      <AppSearchInput
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por nome, placa, marca..."
        containerClassName="mb-4"
      />

      {/* States */}
      {isLoading && <AppLoadingState />}
      {isError && <AppErrorState message={error.message} onRetry={refetch} />}

      {!isLoading && !isError && (
        <>
          {filtered.length === 0 ? (
            <AppEmptyState
              title="Nenhum trator encontrado"
              description="Cadastre o primeiro ativo da sua frota"
              action={
                <Link to={ROUTES.TRACTOR_NEW} className="text-primary text-sm hover:underline">
                  Cadastrar trator
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((tractor) => (
                <AppDataCard
                  key={tractor.id}
                  title={tractor.name}
                  subtitle={[tractor.brand, tractor.model].filter(Boolean).join(' · ')}
                  icon={Tractor}
                  iconVariant={tractor.is_active ? 'default' : 'default'}
                  onClick={() => navigate(ROUTES.TRACTOR_DETAIL(tractor.id))}
                  badge={
                    <AppBadge variant={tractor.is_active ? 'success' : 'default'}>
                      {tractor.is_active ? 'Ativo' : 'Inativo'}
                    </AppBadge>
                  }
                  items={[
                    { label: 'Custo/hora', value: <AppMoney value={tractor.standard_hour_cost ?? 0} size="sm" /> },
                    { label: 'Placa', value: tractor.plate || '—' },
                  ]}
                  footer={
                    <div className="flex gap-2 pt-1">
                      <Link
                        to={ROUTES.TRACTOR_EDIT(tractor.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
                      >
                        <Edit className="h-3 w-3" />
                        Editar
                      </Link>
                      {tractor.is_active && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm('Desativar este trator?')) deactivate.mutate(tractor.id)
                          }}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors ml-auto font-medium"
                        >
                          <PowerOff className="h-3 w-3" />
                          Desativar
                        </button>
                      )}
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
