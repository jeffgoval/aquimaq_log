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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((tractor) => (
                <div
                  key={tractor.id}
                  className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-all group cursor-pointer flex flex-col gap-3"
                  onClick={() => navigate(ROUTES.TRACTOR_DETAIL(tractor.id))}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'rounded-lg p-1.5',
                        tractor.is_active ? 'bg-primary/10' : 'bg-muted'
                      )}>
                        <Tractor className={cn(
                          'h-4 w-4',
                          tractor.is_active ? 'text-primary' : 'text-muted-foreground'
                        )} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-foreground text-sm truncate">{tractor.name}</h3>
                        <p className="text-[10px] text-muted-foreground truncate uppercase font-medium tracking-tight">
                          {[tractor.brand, tractor.model].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    </div>
                    <span className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter',
                      tractor.is_active
                        ? 'bg-green-400/10 text-green-400'
                        : 'bg-muted text-muted-foreground'
                    )}>
                      {tractor.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 py-2 border-y border-border/50">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">Custo/hora</p>
                      <AppMoney value={tractor.standard_hour_cost ?? 0} size="sm" />
                    </div>
                    {tractor.plate && (
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">Placa</p>
                        <p className="text-xs font-bold text-foreground font-mono">{tractor.plate}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-1 mt-auto">
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
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
