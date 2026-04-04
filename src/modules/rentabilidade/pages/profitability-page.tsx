import { useTractorProfitability } from '../hooks/use-profitability-queries'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppErrorState } from '@/shared/components/app/app-error-state'
import { AppEmptyState } from '@/shared/components/app/app-empty-state'
import { AppMoney } from '@/shared/components/app/app-money'
import { AppStatCard } from '@/shared/components/app/app-stat-card'
import { TrendingUp, TrendingDown, DollarSign, Clock } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

export function ProfitabilityPage() {
  const { data, isLoading, isError, error, refetch } = useTractorProfitability()

  const totals = data?.reduce(
    (acc, t) => ({
      revenue: acc.revenue + Number(t.gross_revenue),
      costs: acc.costs + Number(t.depreciation_cost) + Number(t.operational_cost),
      margin: acc.margin + Number(t.estimated_margin),
      hours: acc.hours + Number(t.total_hours),
    }),
    { revenue: 0, costs: 0, margin: 0, hours: 0 }
  )

  return (
    <div>
      <AppPageHeader title="Rentabilidade" description="Margem por máquina baseada em receita, depreciação e custos operacionais" />

      {isLoading && <AppLoadingState />}
      {isError && <AppErrorState message={error.message} onRetry={refetch} />}

      {!isLoading && !isError && (
        <>
          {/* Fleet totals */}
          {totals && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <AppStatCard title="Receita Bruta" value={<AppMoney value={totals.revenue} />} icon={DollarSign} />
              <AppStatCard title="Custos Totais" value={<AppMoney value={totals.costs} />} icon={TrendingDown} />
              <AppStatCard title="Margem Estimada" value={<AppMoney value={totals.margin} colored />} icon={TrendingUp} />
              <AppStatCard title="Horas Totais" value={`${totals.hours.toFixed(1)}h`} icon={Clock} />
            </div>
          )}

          {/* Per-tractor cards */}
          {!data?.length ? (
            <AppEmptyState title="Sem dados de rentabilidade" description="Registre serviços e apontamentos para ver a análise" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {data.map(t => {
                const margin = Number(t.estimated_margin)
                const revenue = Number(t.gross_revenue)
                const marginPercent = revenue > 0 ? (margin / revenue) * 100 : 0

                return (
                  <div key={t.tractor_id} className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-semibold text-foreground">{t.tractor_name}</h3>
                      <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', margin >= 0 ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400')}>
                        {marginPercent.toFixed(1)}%
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      {[
                        { label: 'Horas', value: `${Number(t.total_hours).toFixed(1)}h` },
                        { label: 'Receita', value: <AppMoney value={Number(t.gross_revenue)} size="sm" /> },
                        { label: 'Depreciação', value: <AppMoney value={Number(t.depreciation_cost)} size="sm" /> },
                        { label: 'Custo operacional', value: <AppMoney value={Number(t.operational_cost)} size="sm" /> },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                      <div className="flex justify-between pt-2 border-t border-border">
                        <span className="font-semibold text-foreground">Margem</span>
                        <AppMoney value={margin} colored size="sm" />
                      </div>
                    </div>

                    {/* Margin bar */}
                    <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', margin >= 0 ? 'bg-green-400' : 'bg-red-400')}
                        style={{ width: `${Math.min(Math.abs(marginPercent), 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
