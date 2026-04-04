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
      <AppPageHeader title="Contas a Receber" description={`Total pendente: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPending)}`} />

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
        {Object.entries(STATUS_LABELS).map(([k, v]) => (
          <button key={k} onClick={() => setStatusFilter(k)} className={cn('px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold transition-all shrink-0 whitespace-nowrap', statusFilter === k ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-secondary text-muted-foreground hover:text-foreground')}>
            {v}
          </button>
        ))}
      </div>

      {isLoading && <AppLoadingState />}
      {isError && <AppErrorState message={error.message} onRetry={refetch} />}
      {!isLoading && !isError && (
        !data?.length ? <AppEmptyState title="Nenhuma parcela encontrada" />
          : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.map(rec => (
              <div key={rec.id} className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3 group">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Vence em {dayjs(rec.due_date).format('DD/MM/YYYY')}
                    </p>
                    <h3 className="font-bold text-foreground text-sm truncate mt-0.5">{rec.clients?.name || 'Cliente'}</h3>
                    <p className="text-[10px] text-muted-foreground truncate">{rec.description || `Parcela ${rec.installment_number}/${rec.installment_count}`}</p>
                  </div>
                  <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter shrink-0', STATUS_COLORS[rec.status] ?? 'bg-muted text-muted-foreground')}>
                    {STATUS_LABELS[rec.status] ?? rec.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 py-2 border-y border-border/50">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Valor Final</p>
                    <AppMoney value={rec.final_amount} size="sm" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Valor Pago</p>
                    <AppMoney value={rec.paid_amount} size="sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
      )}
    </div>
  )
}
