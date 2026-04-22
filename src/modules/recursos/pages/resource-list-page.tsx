import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, PowerOff } from 'lucide-react'
import { AppBadge } from '@/shared/components/app/app-badge'
import { AppButton } from '@/shared/components/app/app-button'
import { AppEmptyState } from '@/shared/components/app/app-empty-state'
import { AppErrorState } from '@/shared/components/app/app-error-state'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppMoney } from '@/shared/components/app/app-money'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppSearchInput } from '@/shared/components/app/app-search-input'
import { ROUTES } from '@/shared/constants/routes'
import { useDeactivateResource, useResourceList } from '../hooks/use-resource-queries'

const typeLabelMap = {
  tractor: 'Trator',
  truck: 'Guincho/Caminhão',
  equipment: 'Equipamento',
} as const

const statusBadgeMap = {
  available: { label: 'Disponível', variant: 'success' as const },
  maintenance: { label: 'Manutenção', variant: 'warning' as const },
  inactive: { label: 'Inativo', variant: 'default' as const },
} as const

type ResourceTypeKey = keyof typeof typeLabelMap
type ResourceStatusKey = keyof typeof statusBadgeMap

const resourceTypeKey = (value: string): ResourceTypeKey =>
  value in typeLabelMap ? (value as ResourceTypeKey) : 'tractor'

const resourceStatusKey = (value: string): ResourceStatusKey =>
  value in statusBadgeMap ? (value as ResourceStatusKey) : 'available'

export function ResourceListPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const urlType = searchParams.get('type')
  const defaultTypeFilter: 'all' | 'tractor' | 'truck' | 'equipment' =
    urlType === 'tractor' || urlType === 'truck' || urlType === 'equipment' ? urlType : 'all'
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'tractor' | 'truck' | 'equipment'>(defaultTypeFilter)
  const { data, isLoading, isError, error, refetch } = useResourceList()
  const deactivate = useDeactivateResource()

  const filtered = useMemo(() => {
    const base = data ?? []
    return base.filter((resource) => {
      const matchType = typeFilter === 'all' || resource.type === typeFilter
      const query = search.trim().toLowerCase()
      if (!query) return matchType
      const matchSearch = [resource.name, resource.brand, resource.model, resource.type]
        .filter(Boolean)
        .some((value) => (value ?? '').toLowerCase().includes(query))
      return matchType && matchSearch
    })
  }, [data, search, typeFilter])

  useEffect(() => {
    setTypeFilter(defaultTypeFilter)
  }, [defaultTypeFilter])

  return (
    <div>
      <AppPageHeader
        backTo={ROUTES.DASHBOARD}
        backLabel="Voltar ao início"
        title="Recursos"
        description="Gestão unificada de tratores, guinchos e equipamentos"
        actions={
          <Link
            to={ROUTES.RESOURCE_NEW}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Novo recurso
          </Link>
        }
      />

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <AppSearchInput
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nome, marca ou tipo..."
          containerClassName="mb-0 md:w-[420px]"
        />
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'Todos' },
            { value: 'tractor', label: 'Tratores' },
            { value: 'truck', label: 'Guinchos' },
            { value: 'equipment', label: 'Equipamentos' },
          ].map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => {
                const selectedType = filter.value as typeof typeFilter
                setTypeFilter(selectedType)
                const nextParams = new URLSearchParams(searchParams)
                if (selectedType === 'all') {
                  nextParams.delete('type')
                } else {
                  nextParams.set('type', selectedType)
                }
                setSearchParams(nextParams)
              }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                typeFilter === filter.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/70'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <AppLoadingState />}
      {isError && <AppErrorState message={error.message} onRetry={refetch} />}

      {!isLoading && !isError && (
        <>
          {filtered.length === 0 ? (
            <AppEmptyState
              title="Nenhum recurso encontrado"
              description="Cadastre um novo recurso para começar a gestão unificada."
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-left">
                    <th className="p-3 font-medium">Nome</th>
                    <th className="p-3 font-medium">Tipo</th>
                    <th className="p-3 font-medium hidden md:table-cell">Marca/Modelo</th>
                    <th className="p-3 font-medium whitespace-nowrap">Status</th>
                    <th className="p-3 text-right font-medium whitespace-nowrap">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((resource) => (
                    <tr
                      key={resource.id}
                      className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/20"
                      onClick={() => navigate(ROUTES.RESOURCE_DETAIL(resource.id))}
                    >
                      <td className="p-3 font-medium">{resource.name}</td>
                      <td className="p-3">{typeLabelMap[resourceTypeKey(resource.type)]}</td>
                      <td className="p-3 hidden text-muted-foreground md:table-cell">
                        {[resource.brand, resource.model].filter(Boolean).join(' · ') || '—'}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <AppBadge variant={statusBadgeMap[resourceStatusKey(resource.status)].variant}>
                          {statusBadgeMap[resourceStatusKey(resource.status)].label}
                        </AppBadge>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <AppButton
                          variant="ghost"
                          size="sm"
                          className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          disabled={deactivate.isPending}
                          onClick={() => {
                            if (confirm('Desativar este recurso?')) {
                              deactivate.mutate(resource.id)
                            }
                          }}
                        >
                          <PowerOff className="mr-1 h-3.5 w-3.5" />
                          Desativar
                        </AppButton>
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
