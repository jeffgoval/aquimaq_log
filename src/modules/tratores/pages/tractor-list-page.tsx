import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, Tractor, Edit, PowerOff } from 'lucide-react'
import { useTractorList, useDeactivateTractor } from '../hooks/use-tractor-queries'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppErrorState } from '@/shared/components/app/app-error-state'
import { AppEmptyState } from '@/shared/components/app/app-empty-state'
import { AppMoney } from '@/shared/components/app/app-money'
import { cn } from '@/shared/lib/cn'
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
        title="Tratores"
        description="Gerencie os ativos de maquinário da frota"
        actions={
          <Link
            to={ROUTES.TRACTOR_NEW}
            className="flex items-center gap-2 gradient-amber text-white font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm"
          >
            <Plus className="h-4 w-4" />
            Novo trator
          </Link>
        }
      />

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, placa, marca..."
          className="w-full rounded-lg border border-input bg-input pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((tractor) => (
                <div
                  key={tractor.id}
                  className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-colors group cursor-pointer"
                  onClick={() => navigate(ROUTES.TRACTOR_DETAIL(tractor.id))}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'rounded-lg p-2',
                        tractor.is_active ? 'bg-primary/10' : 'bg-muted'
                      )}>
                        <Tractor className={cn(
                          'h-5 w-5',
                          tractor.is_active ? 'text-primary' : 'text-muted-foreground'
                        )} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-sm">{tractor.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {[tractor.brand, tractor.model].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    </div>
                    <span className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded-full',
                      tractor.is_active
                        ? 'bg-green-400/10 text-green-400'
                        : 'bg-muted text-muted-foreground'
                    )}>
                      {tractor.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Valor de compra</p>
                      <AppMoney value={tractor.purchase_value} size="sm" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Custo/hora</p>
                      <AppMoney value={tractor.standard_hour_cost ?? 0} size="sm" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Vida útil</p>
                      <p className="text-sm font-medium text-foreground">
                        {tractor.useful_life_hours.toLocaleString('pt-BR')}h
                      </p>
                    </div>
                    {tractor.plate && (
                      <div>
                        <p className="text-xs text-muted-foreground">Placa</p>
                        <p className="text-sm font-medium text-foreground font-mono">{tractor.plate}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-border">
                    <Link
                      to={ROUTES.TRACTOR_EDIT(tractor.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Editar
                    </Link>
                    {tractor.is_active && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm('Desativar este trator?')) deactivate.mutate(tractor.id)
                        }}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors ml-auto"
                      >
                        <PowerOff className="h-3.5 w-3.5" />
                        Desativar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
