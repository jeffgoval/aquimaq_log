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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.map(t => {
                const margin = Number(t.estimated_margin)
                const revenue = Number(t.gross_revenue)
                const marginPercent = revenue > 0 ? (margin / revenue) * 100 : 0

                return (
                  <div key={t.tractor_id} className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-all shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div className="min-w-0">
                        <h3 className="font-bold text-foreground text-sm truncate">{t.tractor_name}</h3>
                        <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-tight">Análise de Performance</p>
                      </div>
                      <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter shrink-0', margin >= 0 ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400')}>
                        {marginPercent.toFixed(1)}% MARGEM
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 pb-3 border-b border-border/50">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">Horas Totais</p>
                          <p className="text-xs font-bold text-foreground">{Number(t.total_hours).toFixed(1)}h</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">Receita Bruta</p>
                          <AppMoney value={Number(t.gross_revenue)} size="sm" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pb-3 border-b border-border/50">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">Depreciação</p>
                          <AppMoney value={Number(t.depreciation_cost)} size="sm" />
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">Custo Oper.</p>
                          <AppMoney value={Number(t.operational_cost)} size="sm" />
                        </div>
                      </div>

                      <div className="flex justify-between items-center bg-muted/20 p-2 rounded-lg">
                        <span className="text-[10px] font-bold text-foreground uppercase">Resultado Liquido</span>
                        <AppMoney value={margin} colored size="sm" />
                      </div>
                    </div>

                    {/* Margin bar */}
                    <div className="mt-4 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-500', margin >= 0 ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.4)]' : 'bg-red-400')}
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
