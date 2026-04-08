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
            <div className="overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-left">
                    <th className="p-3 font-medium">Trator</th>
                    <th className="p-3 font-medium hidden md:table-cell">Marca/Modelo</th>
                    <th className="p-3 font-medium hidden md:table-cell">Placa</th>
                    <th className="p-3 font-medium whitespace-nowrap hidden lg:table-cell">Custo/hora</th>
                    <th className="p-3 font-medium whitespace-nowrap">Status</th>
                    <th className="p-3 font-medium text-right whitespace-nowrap">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((tractor) => (
                    <tr
                      key={tractor.id}
                      className="border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer"
                      onClick={() => navigate(ROUTES.TRACTOR_DETAIL(tractor.id))}
                    >
                      <td className="p-3 min-w-0">
                        <div className="font-medium text-foreground truncate">{tractor.name}</div>
                        <div className="text-xs text-muted-foreground md:hidden truncate">
                          {[tractor.brand, tractor.model].filter(Boolean).join(' · ') || '—'} · {tractor.plate || '—'}
                        </div>
                      </td>
                      <td className="p-3 hidden md:table-cell typo-body-muted">
                        {[tractor.brand, tractor.model].filter(Boolean).join(' · ') || '—'}
                      </td>
                      <td className="p-3 hidden md:table-cell typo-body-muted">
                        {tractor.plate || '—'}
                      </td>
                      <td className="p-3 hidden lg:table-cell whitespace-nowrap">
                        <AppMoney value={tractor.standard_hour_cost ?? 0} size="sm" />
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <AppBadge variant={tractor.is_active ? 'success' : 'default'}>
                          {tractor.is_active ? 'Ativo' : 'Inativo'}
                        </AppBadge>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-3">
                          <Link
                            to={ROUTES.TRACTOR_EDIT(tractor.id)}
                            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
                          >
                            <Edit className="h-3 w-3" />
                            Editar
                          </Link>
                          {tractor.is_active && (
                            <button
                              onClick={() => {
                                if (confirm('Desativar este trator?')) deactivate.mutate(tractor.id)
                              }}
                              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors font-medium"
                            >
                              <PowerOff className="h-3 w-3" />
                              Desativar
                            </button>
                          )}
                        </div>
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
