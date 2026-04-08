import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/routes'
import { useServiceList } from '../hooks/use-service-queries'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppErrorState } from '@/shared/components/app/app-error-state'
import { AppEmptyState } from '@/shared/components/app/app-empty-state'
import { AppBadge } from '@/shared/components/app/app-badge'
import { AppSearchInput } from '@/shared/components/app/app-search-input'
import { cn } from '@/shared/lib/cn'
import { SERVICE_STATUS_LABELS, SERVICE_STATUS_BADGE_VARIANTS } from '@/shared/constants/status'
import {
  getServicePaymentBadgeKind,
  getServicePaymentBadgeProps,
} from '../lib/service-payment-badge'
import dayjs from '@/shared/lib/dayjs'
import { Plus, Edit } from 'lucide-react'

const FILTER_LABELS = { all: 'Todos', draft: SERVICE_STATUS_LABELS.draft, completed: SERVICE_STATUS_LABELS.completed, cancelled: SERVICE_STATUS_LABELS.cancelled }

export function ServiceListPage() {
  const navigate = useNavigate()
  const { data, isLoading, isError, error, refetch } = useServiceList()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filtered = data?.filter(s => {
    const matchesSearch = [s.clients?.name, s.tractors?.name, s.trucks?.name]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter
    return matchesSearch && matchesStatus
  }) ?? []

  return (
    <div>
      <AppPageHeader
        backTo={ROUTES.DASHBOARD}
        backLabel="Voltar ao início"
        title="Serviços"
        description="Acompanhamento de serviços e apontamentos"
        actions={
          <Link to={ROUTES.SERVICE_NEW} className="flex items-center gap-2 gradient-cat text-primary-foreground font-semibold px-4 py-2 rounded-lg hover:opacity-90 text-sm">
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
        {(Object.entries(FILTER_LABELS) as [string, string][]).map(([k, v]) => (
          <button key={k} onClick={() => setStatusFilter(k)}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors', statusFilter === k ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground')}>
            {v}
          </button>
        ))}
      </div>

      {isLoading && <AppLoadingState />}
      {isError && <AppErrorState message={error.message} onRetry={refetch} />}
      {!isLoading && !isError && (
        filtered.length === 0
          ? <AppEmptyState title="Nenhum serviço" action={<Link to={ROUTES.SERVICE_NEW} className="text-primary text-sm hover:underline">Criar serviço</Link>} />
          : (
            <div className="overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-left">
                    <th className="p-3 font-medium whitespace-nowrap">Data</th>
                    <th className="p-3 font-medium">Cliente</th>
                    <th className="p-3 font-medium hidden md:table-cell">Veículo</th>
                    <th className="p-3 font-medium whitespace-nowrap">Status</th>
                    <th className="p-3 font-medium whitespace-nowrap hidden lg:table-cell">Pagamento</th>
                    <th className="p-3 font-medium text-right whitespace-nowrap">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((service) => {
                    const payKind = getServicePaymentBadgeKind(service)
                    const pay = getServicePaymentBadgeProps(payKind)
                    const vehicle = service.tractors?.name || service.trucks?.name || '—'
                    return (
                      <tr
                        key={service.id}
                        className="border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer"
                        onClick={() => navigate(ROUTES.SERVICE_DETAIL(service.id))}
                      >
                        <td className="p-3 tabular-nums whitespace-nowrap">
                          {dayjs(service.service_date).format('DD/MM/YYYY')}
                        </td>
                        <td className="p-3 min-w-0">
                          <div className="font-medium text-foreground truncate">
                            {service.clients?.name || 'Cliente sem nome'}
                          </div>
                          <div className="text-xs text-muted-foreground md:hidden truncate">
                            {vehicle}
                          </div>
                        </td>
                        <td className="p-3 hidden md:table-cell typo-body-muted">
                          {vehicle}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <AppBadge variant={SERVICE_STATUS_BADGE_VARIANTS[service.status] ?? 'default'}>
                            {SERVICE_STATUS_LABELS[service.status] ?? service.status}
                          </AppBadge>
                        </td>
                        <td className="p-3 whitespace-nowrap hidden lg:table-cell">
                          <AppBadge variant={pay.variant}>{pay.label}</AppBadge>
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <Link
                            to={ROUTES.SERVICE_EDIT(service.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
                          >
                            <Edit className="h-3 w-3" />
                            Editar
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
      )}
    </div>
  )
}
