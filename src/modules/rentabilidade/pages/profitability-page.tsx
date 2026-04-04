import { useTractorProfitability } from '../hooks/use-profitability-queries'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppErrorState } from '@/shared/components/app/app-error-state'
import { AppEmptyState } from '@/shared/components/app/app-empty-state'
import { AppMoney } from '@/shared/components/app/app-money'
import { AppStatCard } from '@/shared/components/app/app-stat-card'
import { AppDataCard } from '@/shared/components/app/app-data-card'
import { AppBadge } from '@/shared/components/app/app-badge'
import { TrendingUp, TrendingDown, DollarSign, Clock, Tractor } from 'lucide-react'
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
                  <AppDataCard
                    key={t.tractor_id}
                    title={t.tractor_name || 'Desconhecido'}
                    subtitle="Análise de Performance"
                    icon={Tractor}
                    badge={
                      <AppBadge variant={margin >= 0 ? 'success' : 'destructive'}>
                        {marginPercent.toFixed(1)}% MARGEM
                      </AppBadge>
                    }
                    items={[
                      { label: 'Horas Totais', value: `${Number(t.total_hours).toFixed(1)}h` },
                      { label: 'Receita Bruta', value: <AppMoney value={Number(t.gross_revenue)} size="sm" /> },
                      { label: 'Depreciação', value: <AppMoney value={Number(t.depreciation_cost)} size="sm" /> },
                      { label: 'Custo Oper.', value: <AppMoney value={Number(t.operational_cost)} size="sm" /> },
                    ]}
                    footer={
                      <div className="space-y-3 pt-2 border-t border-border/50">
                        <div className="flex justify-between items-center bg-muted/20 p-2 rounded-lg">
                          <span className="text-xs font-bold text-foreground uppercase">Resultado Líquido</span>
                          <AppMoney value={margin} colored size="sm" />
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn('h-full rounded-full transition-all duration-500', margin >= 0 ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.4)]' : 'bg-red-400')}
                            style={{ width: `${Math.min(Math.abs(marginPercent), 100)}%` }}
                          />
                        </div>
                      </div>
                    }
                  />
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
