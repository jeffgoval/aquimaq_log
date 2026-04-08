import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { useTrucks } from '../hooks/use-truck-queries'
import { ROUTES } from '@/shared/constants/routes'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppErrorState } from '@/shared/components/app/app-error-state'
import { AppEmptyState } from '@/shared/components/app/app-empty-state'
import { AppButton } from '@/shared/components/app/app-button'
import { AppBadge } from '@/shared/components/app/app-badge'

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
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left">
                <th className="p-3 font-medium">Guincho</th>
                <th className="p-3 font-medium hidden md:table-cell">Marca/Modelo</th>
                <th className="p-3 font-medium hidden md:table-cell">Placa</th>
                <th className="p-3 font-medium whitespace-nowrap">Odômetro</th>
                <th className="p-3 font-medium whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer"
                  onClick={() => navigate(ROUTES.TRUCK_DETAIL(t.id))}
                >
                  <td className="p-3 min-w-0">
                    <div className="font-medium text-foreground truncate">{t.name}</div>
                    <div className="text-xs text-muted-foreground md:hidden truncate">
                      {[t.brand, t.model].filter(Boolean).join(' ') || '—'} · {t.plate || '—'}
                    </div>
                  </td>
                  <td className="p-3 hidden md:table-cell typo-body-muted">
                    {[t.brand, t.model].filter(Boolean).join(' ') || '—'}
                  </td>
                  <td className="p-3 hidden md:table-cell typo-body-muted font-mono uppercase">
                    {t.plate || '—'}
                  </td>
                  <td className="p-3 tabular-nums whitespace-nowrap">
                    {t.current_odometer.toLocaleString('pt-BR')} km
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <AppBadge variant={t.is_active ? 'success' : 'default'}>
                      {t.is_active ? 'Ativo' : 'Inativo'}
                    </AppBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
