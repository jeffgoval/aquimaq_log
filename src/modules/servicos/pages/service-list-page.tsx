import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useServiceList } from '../hooks/use-service-queries'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppErrorState } from '@/shared/components/app/app-error-state'
import { AppEmptyState } from '@/shared/components/app/app-empty-state'
import { AppBadge } from '@/shared/components/app/app-badge'
import { AppSearchInput } from '@/shared/components/app/app-search-input'
import { AppDataCard } from '@/shared/components/app/app-data-card'
import { cn } from '@/shared/lib/cn'
import { ROUTES } from '@/shared/constants/routes'
import dayjs from 'dayjs'
import { Plus, Briefcase } from 'lucide-react'

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
        description="Acompanhamento de serviços e apontamentos"
        actions={
          <Link to={ROUTES.SERVICE_NEW} className="flex items-center gap-2 gradient-amber text-white font-semibold px-4 py-2 rounded-lg hover:opacity-90 text-sm">
            <Plus className="h-4 w-4" />Novo serviço
          </Link>
        }
      />

      <div className="flex gap-3 mb-4 flex-wrap">
        <AppSearchInput
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar..."
          containerClassName="max-w-xs"
        />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map(service => (
                <AppDataCard
                  key={service.id}
                  onClick={() => navigate(ROUTES.SERVICE_DETAIL(service.id))}
                  icon={Briefcase}
                  title={service.clients?.name || 'Cliente sem nome'}
                  subtitle={dayjs(service.service_date).format('DD [de] MMMM')}
                  badge={
                    <AppBadge variant={
                      service.status === 'completed' ? 'success' :
                      service.status === 'in_progress' ? 'warning' :
                      service.status === 'cancelled' ? 'destructive' : 'default'
                    }>
                      {STATUS_LABELS[service.status]}
                    </AppBadge>
                  }
                  items={[
                    { label: 'Trator', value: service.tractors?.name || '—' },
                    { label: 'Operador', value: service.operators?.name || '—' },
                  ]}
                />
              ))}
            </div>
          )
      )}
    </div>
  )
}
