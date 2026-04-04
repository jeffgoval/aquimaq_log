import { useState } from 'react'
import { useReceivables } from '../hooks/use-financial-queries'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppErrorState } from '@/shared/components/app/app-error-state'
import { AppEmptyState } from '@/shared/components/app/app-empty-state'
import { AppMoney } from '@/shared/components/app/app-money'
import { cn } from '@/shared/lib/cn'
import dayjs from 'dayjs'

const STATUS_LABELS: Record<string, string> = { all: 'Todos', pending: 'Pendente', partially_paid: 'Parcial', paid: 'Pago', overdue: 'Vencido' }
const STATUS_COLORS: Record<string, string> = { pending: 'bg-amber-400/10 text-amber-400', partially_paid: 'bg-blue-400/10 text-blue-400', paid: 'bg-green-400/10 text-green-400', overdue: 'bg-red-400/10 text-red-400', cancelled: 'bg-muted text-muted-foreground' }

export function ReceivableListPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  const { data, isLoading, isError, error, refetch } = useReceivables({ status: statusFilter })

  const totalPending = data?.filter(r => r.status !== 'paid' && r.status !== 'cancelled').reduce((a, r) => a + r.final_amount - r.paid_amount, 0) ?? 0

  return (
    <div>
      <AppPageHeader title="Contas a Receber" description={`Total pendente: R$ ${totalPending.toFixed(2)}`} />

      <div className="flex gap-2 mb-4 flex-wrap">
        {Object.entries(STATUS_LABELS).map(([k, v]) => (
          <button key={k} onClick={() => setStatusFilter(k)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors', statusFilter === k ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground')}>
            {v}
          </button>
        ))}
      </div>

      {isLoading && <AppLoadingState />}
      {isError && <AppErrorState message={error.message} onRetry={refetch} />}
      {!isLoading && !isError && (
        !data?.length ? <AppEmptyState title="Nenhuma parcela encontrada" />
          : <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {['Cliente', 'Descrição', 'Vencimento', 'Valor', 'Pago', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map(rec => (
                  <tr key={rec.id} className="border-b border-border last:border-0 hover:bg-muted/10">
                    <td className="px-4 py-3 font-medium">{rec.clients?.name || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{rec.description || `Parcela ${rec.installment_number}/${rec.installment_count}`}</td>
                    <td className="px-4 py-3 text-muted-foreground">{dayjs(rec.due_date).format('DD/MM/YYYY')}</td>
                    <td className="px-4 py-3"><AppMoney value={rec.final_amount} size="sm" /></td>
                    <td className="px-4 py-3"><AppMoney value={rec.paid_amount} size="sm" /></td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', STATUS_COLORS[rec.status] ?? 'bg-muted text-muted-foreground')}>
                        {STATUS_LABELS[rec.status] ?? rec.status}
                      </span>
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
