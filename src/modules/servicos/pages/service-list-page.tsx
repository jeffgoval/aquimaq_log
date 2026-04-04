import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { useServiceList } from '../hooks/use-service-queries'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppErrorState } from '@/shared/components/app/app-error-state'
import { AppEmptyState } from '@/shared/components/app/app-empty-state'
import { cn } from '@/shared/lib/cn'
import { ROUTES } from '@/shared/constants/routes'
import dayjs from 'dayjs'

const STATUS_LABELS = { draft: 'Em aberto', in_progress: 'Em andamento', completed: 'Concluído', cancelled: 'Cancelado' }
const STATUS_COLORS = {
  draft: 'bg-slate-400/10 text-slate-400',
  in_progress: 'bg-amber-400/10 text-amber-400',
  completed: 'bg-green-400/10 text-green-400',
  cancelled: 'bg-red-400/10 text-red-400',
}

export function ServiceListPage() {
  const navigate = useNavigate()
  const { data, isLoading, isError, error, refetch } = useServiceList()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filtered = data?.filter(s => {
    const matchesSearch = [s.clients?.name, s.tractors?.name, s.operators?.name]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter
    return matchesSearch && matchesStatus
  }) ?? []

  return (
    <div>
      <AppPageHeader
        title="Serviços"
        description="Clique em um serviço para ver detalhes e registrar parcelamento"
        actions={
          <Link to={ROUTES.SERVICE_NEW} className="flex items-center gap-2 gradient-amber text-white font-semibold px-4 py-2 rounded-lg hover:opacity-90 text-sm">
            <Plus className="h-4 w-4" />Novo serviço
          </Link>
        }
      />

      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="rounded-lg border border-input bg-input pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        {(['all', 'draft', 'completed', 'cancelled'] as const).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors', statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground')}>
            {s === 'all' ? 'Todos' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {isLoading && <AppLoadingState />}
      {isError && <AppErrorState message={error.message} onRetry={refetch} />}
      {!isLoading && !isError && (
        filtered.length === 0
          ? <AppEmptyState title="Nenhum serviço" action={<Link to={ROUTES.SERVICE_NEW} className="text-primary text-sm hover:underline">Criar serviço</Link>} />
          : (
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Data</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Cliente</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Trator</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">Operador</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(service => (
                    <tr
                      key={service.id}
                      onClick={() => navigate(ROUTES.SERVICE_DETAIL(service.id))}
                      className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{dayjs(service.service_date).format('DD/MM/YY')}</td>
                      <td className="px-4 py-3 font-medium">{service.clients?.name || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{service.tractors?.name || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{service.operators?.name || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', STATUS_COLORS[service.status])}>
                          {STATUS_LABELS[service.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
      )}
    </div>
  )
}
