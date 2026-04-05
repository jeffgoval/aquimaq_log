import { useParams } from 'react-router-dom'
import { useOperator, useOperatorLedger } from '../hooks/use-operator-queries'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppErrorState } from '@/shared/components/app/app-error-state'
import { AppStatCard } from '@/shared/components/app/app-stat-card'
import { AppMoney } from '@/shared/components/app/app-money'
import { Clock, DollarSign, TrendingDown, ArrowUpRight, Banknote } from 'lucide-react'
import { OperatorLedgerSection } from '../components/operator-ledger-section'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/routes'

export function OperatorDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: operator, isLoading, isError, error } = useOperator(id!)
  const { data: ledger } = useOperatorLedger(id!)

  if (isLoading) return <AppLoadingState />
  if (isError) return <AppErrorState message={error.message} />
  if (!operator) return null

  return (
    <div>
      <AppPageHeader
        title={operator.name}
        description={operator.phone || undefined}
        actions={
          <Link to={ROUTES.OPERATOR_EDIT(operator.id)} className="flex items-center gap-2 bg-secondary text-foreground font-medium px-4 py-2 rounded-lg hover:bg-secondary/70 transition-colors text-sm">
            Editar
          </Link>
        }
      />
      {ledger && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <AppStatCard title="Horas Trabalhadas" value={`${Number(ledger.total_hours_worked).toFixed(1)}h`} icon={Clock} />
          <AppStatCard title="Total a Ganhar" value={<AppMoney value={Number(ledger.total_earned)} />} icon={DollarSign} />
          <AppStatCard title="Vales / adiantamentos" value={<AppMoney value={Number(ledger.total_advances)} />} icon={ArrowUpRight} />
          <AppStatCard title="Pagamentos feitos" value={<AppMoney value={Number(ledger.total_payments ?? 0)} />} icon={Banknote} />
          <AppStatCard
            title="Saldo a pagar"
            value={<AppMoney value={Number(ledger.current_balance)} colored />}
            icon={TrendingDown}
          />
        </div>
      )}
      <OperatorLedgerSection operatorId={operator.id} />

      <div className="rounded-xl border border-border bg-card p-6 mt-6">
        <h2 className="typo-section-title mb-4">Dados</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          {[
            { label: 'CNH', value: operator.document || '—' },
            { label: 'Telefone', value: operator.phone || '—' },
            { label: 'Taxa/hora', value: <AppMoney value={operator.default_hour_rate} /> },
          ].map(({ label, value }) => (
            <div key={label}><dt className="text-muted-foreground">{label}</dt><dd className="font-medium text-foreground mt-0.5">{value}</dd></div>
          ))}
        </dl>
        {operator.notes && <p className="mt-4 pt-4 border-t border-border text-sm text-foreground">{operator.notes}</p>}
      </div>
    </div>
  )
}
