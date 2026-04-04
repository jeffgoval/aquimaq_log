import { useState } from 'react'
import { useReceivables } from '../hooks/use-financial-queries'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppErrorState } from '@/shared/components/app/app-error-state'
import { AppEmptyState } from '@/shared/components/app/app-empty-state'
import { AppMoney } from '@/shared/components/app/app-money'
import { AppBadge } from '@/shared/components/app/app-badge'
import { AppSearchInput } from '@/shared/components/app/app-search-input'
import { AppDataCard } from '@/shared/components/app/app-data-card'
import { cn } from '@/shared/lib/cn'
import { RECEIVABLE_STATUS_LABELS, RECEIVABLE_STATUS_BADGE_VARIANTS } from '@/shared/constants/status'
import dayjs from '@/shared/lib/dayjs'
import { DollarSign } from 'lucide-react'

const FILTER_LABELS: Record<string, string> = {
  all: 'Todos',
  pending: RECEIVABLE_STATUS_LABELS.pending,
  paid: RECEIVABLE_STATUS_LABELS.paid,
  overdue: RECEIVABLE_STATUS_LABELS.overdue,
}

export function ReceivableListPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const { data, isLoading, isError, error, refetch } = useReceivables({ status: statusFilter })

  const filtered = data?.filter(r =>
    r.clients?.name.toLowerCase().includes(search.toLowerCase()) ||
    r.description?.toLowerCase().includes(search.toLowerCase())
  )

  const totalPending = data?.filter(r => r.status !== 'paid' && r.status !== 'cancelled').reduce((a, r) => a + r.final_amount - r.paid_amount, 0) ?? 0

  return (
    <div>
      <AppPageHeader title="Contas a Receber" description={`Total pendente: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPending)}`} />

      <div className="flex flex-col gap-4 mb-4">
        <AppSearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar parcela por cliente ou descrição..."
          containerClassName="max-w-md"
        />

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
          {Object.entries(FILTER_LABELS).map(([k, v]) => (
            <button
              key={k}
              onClick={() => setStatusFilter(k)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs uppercase font-bold transition-all shrink-0 whitespace-nowrap',
                statusFilter === k ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-secondary text-muted-foreground hover:text-foreground'
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <AppLoadingState />}
      {isError && <AppErrorState message={error.message} onRetry={refetch} />}
      {!isLoading && !isError && (
        !filtered?.length ? <AppEmptyState title="Nenhuma parcela encontrada" />
          : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered?.map(rec => (
              <AppDataCard
                key={rec.id}
                title={rec.clients?.name || 'Cliente'}
                subtitle={`Vence em ${dayjs(rec.due_date).format('DD/MM/YYYY')}`}
                icon={DollarSign}
                badge={
                  <AppBadge variant={RECEIVABLE_STATUS_BADGE_VARIANTS[rec.status] ?? 'default'}>
                    {RECEIVABLE_STATUS_LABELS[rec.status] ?? rec.status}
                  </AppBadge>
                }
                items={[
                  { label: 'Valor Final', value: <AppMoney value={rec.final_amount} size="sm" /> },
                  { label: 'Valor Pago', value: <AppMoney value={rec.paid_amount} size="sm" /> },
                ]}
                footer={
                  <p className="text-xs text-muted-foreground truncate border-t border-border/50 pt-2">
                    {rec.description || `Parcela ${rec.installment_number}/${rec.installment_count}`}
                  </p>
                }
              />
            ))}
          </div>
      )}
    </div>
  )
}
