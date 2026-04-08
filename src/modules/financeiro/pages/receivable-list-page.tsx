import { useState } from 'react'
import { useReceivables } from '../hooks/use-financial-queries'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppErrorState } from '@/shared/components/app/app-error-state'
import { AppEmptyState } from '@/shared/components/app/app-empty-state'
import { AppMoney } from '@/shared/components/app/app-money'
import { AppBadge } from '@/shared/components/app/app-badge'
import { AppSearchInput } from '@/shared/components/app/app-search-input'
import { cn } from '@/shared/lib/cn'
import { RECEIVABLE_STATUS_LABELS, RECEIVABLE_STATUS_BADGE_VARIANTS } from '@/shared/constants/status'
import dayjs from '@/shared/lib/dayjs'
import { ROUTES } from '@/shared/constants/routes'

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
      <AppPageHeader
        backTo={ROUTES.DASHBOARD}
        backLabel="Voltar ao início"
        title="Contas a receber"
        description={`Parcelas e pendências do cliente · Em aberto: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPending)}`}
      />

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
          : (
            <div className="overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-left">
                    <th className="p-3 font-medium whitespace-nowrap">Vencimento</th>
                    <th className="p-3 font-medium">Cliente</th>
                    <th className="p-3 font-medium hidden lg:table-cell">Descrição</th>
                    <th className="p-3 font-medium whitespace-nowrap">Status</th>
                    <th className="p-3 font-medium text-right whitespace-nowrap">Em aberto</th>
                    <th className="p-3 font-medium text-right whitespace-nowrap hidden md:table-cell">Pago</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((rec) => {
                    const open = rec.status !== 'paid' && rec.status !== 'cancelled'
                      ? (rec.final_amount - rec.paid_amount)
                      : 0
                    const desc = rec.description || `Parcela ${rec.installment_number}/${rec.installment_count}`
                    return (
                      <tr key={rec.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                        <td className="p-3 tabular-nums whitespace-nowrap">
                          {dayjs(rec.due_date).format('DD/MM/YYYY')}
                        </td>
                        <td className="p-3 min-w-0">
                          <div className="font-medium text-foreground truncate">{rec.clients?.name || 'Cliente'}</div>
                          <div className="text-xs text-muted-foreground lg:hidden truncate">{desc}</div>
                        </td>
                        <td className="p-3 hidden lg:table-cell typo-body-muted max-w-[420px] truncate" title={desc}>
                          {desc}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <AppBadge variant={RECEIVABLE_STATUS_BADGE_VARIANTS[rec.status] ?? 'default'}>
                            {RECEIVABLE_STATUS_LABELS[rec.status] ?? rec.status}
                          </AppBadge>
                        </td>
                        <td className="p-3 text-right tabular-nums whitespace-nowrap">
                          <AppMoney value={open} size="sm" />
                        </td>
                        <td className="p-3 text-right tabular-nums whitespace-nowrap hidden md:table-cell">
                          <AppMoney value={rec.paid_amount} size="sm" />
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
