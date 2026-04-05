import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, Truck } from 'lucide-react'
import { useState } from 'react'
import { useTrucks } from '../hooks/use-truck-queries'
import { ROUTES } from '@/shared/constants/routes'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppErrorState } from '@/shared/components/app/app-error-state'
import { AppEmptyState } from '@/shared/components/app/app-empty-state'
import { AppButton } from '@/shared/components/app/app-button'

export function TruckListPage() {
  const { data: trucks, isLoading, isError, error } = useTrucks()
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  if (isLoading) return <AppLoadingState />
  if (isError) return <AppErrorState message={error.message} />

  const filtered = trucks?.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.plate?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AppPageHeader
        title="Guinchos"
        description="Gerenciamento de frota rodoviária"
        actions={
          <Link to={ROUTES.TRUCK_NEW}>
            <AppButton variant="primary" className="gap-2">
              <Plus className="h-4 w-4" />
              <span>Novo Guincho</span>
            </AppButton>
          </Link>
        }
      />

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar por placa ou nome..."
            className="field pl-9 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {!filtered?.length ? (
        <AppEmptyState
          title="Nenhum guincho encontrado"
          description={search ? 'Tente buscar com outros termos.' : 'Comece cadastrando um novo veículo na frota.'}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <div
              key={t.id}
              onClick={() => navigate(ROUTES.TRUCK_DETAIL(t.id))}
              className="group cursor-pointer rounded-xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-md transition-all active:scale-[0.98]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="typo-section-title group-hover:text-primary transition-colors">{t.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {t.plate && <span className="typo-caption px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground uppercase font-mono">{t.plate}</span>}
                    {t.brand && <span className="typo-caption text-muted-foreground">{t.brand} {t.model}</span>}
                  </div>
                </div>
                {!t.is_active && (
                  <span className="shrink-0 text-[10px] font-medium px-2 py-1 bg-muted text-muted-foreground rounded-full">INATIVO</span>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
                <div>
                  <p className="typo-caption text-muted-foreground mb-0.5">Odômetro</p>
                  <p className="font-semibold tabular-nums">{t.current_odometer.toLocaleString('pt-BR')} KM</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
