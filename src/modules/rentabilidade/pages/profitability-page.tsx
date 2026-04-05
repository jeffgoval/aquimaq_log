import { useTractorProfitability, useClientRevenue } from '../hooks/use-profitability-queries'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppErrorState } from '@/shared/components/app/app-error-state'
import { AppEmptyState } from '@/shared/components/app/app-empty-state'
import { AppMoney } from '@/shared/components/app/app-money'
import { AppStatCard } from '@/shared/components/app/app-stat-card'
import { AppDataCard } from '@/shared/components/app/app-data-card'
import { AppBadge } from '@/shared/components/app/app-badge'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Tractor,
  Users,
  AlertTriangle,
  Building2,
} from 'lucide-react'
import { cn } from '@/shared/lib/cn'

export function ProfitabilityPage() {
  const { data, isLoading, isError, error, refetch } = useTractorProfitability()
  const { data: clientData } = useClientRevenue()

  const totals = data?.reduce(
    (acc, t) => ({
      revenue: acc.revenue + Number(t.gross_revenue),
      depreciation: acc.depreciation + Number(t.depreciation_cost),
      operational: acc.operational + Number(t.operational_cost),
      operatorCost: acc.operatorCost + Number(t.operator_cost),
      margin: acc.margin + Number(t.net_margin),
      hours: acc.hours + Number(t.total_hours),
    }),
    { revenue: 0, depreciation: 0, operational: 0, operatorCost: 0, margin: 0, hours: 0 },
  )

  const fleetCph = totals && totals.hours > 0
    ? (totals.depreciation + totals.operational + totals.operatorCost) / totals.hours
    : 0

  const fleetRevPerHour = totals && totals.hours > 0
    ? totals.revenue / totals.hours
    : 0

  const totalBilledClients = clientData?.reduce((s, c) => s + Number(c.total_billed), 0) ?? 0

  return (
    <div>
      <AppPageHeader
        title="Rentabilidade"
        description="Análise completa por máquina: receita, depreciação, custos operacionais e mão de obra. CPH (Custo por Hora) é o indicador central de precificação."
      />

      {isLoading && <AppLoadingState />}
      {isError && <AppErrorState message={error.message} onRetry={refetch} />}

      {!isLoading && !isError && (
        <>
          {/* ── SEÇÃO 1: KPIs da Frota ── */}
          {totals && (
            <div className="mb-6">
              <h2 className="typo-section-label mb-3">Frota — Visão Geral</h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                <AppStatCard
                  title="Receita Bruta"
                  value={<AppMoney value={totals.revenue} />}
                  icon={DollarSign}
                />
                <AppStatCard
                  title="Custos Totais"
                  value={<AppMoney value={totals.depreciation + totals.operational + totals.operatorCost} />}
                  icon={TrendingDown}
                  description="Deprec. + Oper. + M.O."
                />
                <AppStatCard
                  title="Mão de Obra"
                  value={<AppMoney value={totals.operatorCost} />}
                  icon={Users}
                  description="Custo operadores"
                />
                <AppStatCard
                  title="Margem Líquida"
                  value={<AppMoney value={totals.margin} colored />}
                  icon={TrendingUp}
                  description="Após todos os custos"
                />
                <AppStatCard
                  title="Horas Totais"
                  value={`${totals.hours.toFixed(1)}h`}
                  icon={Clock}
                />
                <AppStatCard
                  title="CPH Médio da Frota"
                  value={<AppMoney value={fleetCph} />}
                  icon={Tractor}
                  description={`Receita/h: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(fleetRevPerHour)}`}
                />
              </div>
            </div>
          )}

          {/* ── SEÇÃO 2: Cards por Trator ── */}
          <div className="mb-8">
            <h2 className="typo-section-label mb-3">Análise por Máquina</h2>
            {!data?.length ? (
              <AppEmptyState
                title="Sem dados de rentabilidade"
                description="Registre serviços e apontamentos para ver a análise"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.map(t => {
                  const margin = Number(t.net_margin)
                  const revenue = Number(t.gross_revenue)
                  const cph = Number(t.cost_per_hour)
                  const revPerHour = Number(t.revenue_per_hour)
                  const marginPercent = revenue > 0 ? (margin / revenue) * 100 : 0
                  const isCphOk = revPerHour >= cph

                  return (
                    <AppDataCard
                      key={t.tractor_id}
                      title={t.tractor_name || 'Desconhecido'}
                      subtitle="Performance Gerencial"
                      icon={Tractor}
                      iconVariant={margin >= 0 ? 'success' : 'destructive'}
                      badge={
                        <AppBadge variant={margin >= 0 ? 'success' : 'destructive'}>
                          {marginPercent.toFixed(1)}%
                        </AppBadge>
                      }
                      items={[
                        {
                          label: 'Horas trabalhadas',
                          value: `${Number(t.total_hours).toFixed(1)}h`,
                        },
                        {
                          label: 'Receita Bruta',
                          value: <AppMoney value={revenue} size="sm" />,
                        },
                        {
                          label: 'Depreciação',
                          value: <AppMoney value={Number(t.depreciation_cost)} size="sm" />,
                        },
                        {
                          label: 'Custo Operacional',
                          value: <AppMoney value={Number(t.operational_cost)} size="sm" />,
                        },
                        {
                          label: 'Mão de Obra',
                          value: <AppMoney value={Number(t.operator_cost)} size="sm" />,
                        },
                      ]}
                      footer={
                        <div className="space-y-3 pt-2 border-t border-border/50">

                          {/* Comparativo por hora — bloco principal de diagnóstico */}
                          {Number(t.total_hours) > 0 && (
                            <div className={cn(
                              'rounded-lg p-3 space-y-2',
                              isCphOk ? 'bg-green-500/8 border border-green-500/20' : 'bg-destructive/8 border border-destructive/20',
                            )}>
                              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Análise por hora trabalhada
                              </p>
                              <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Receita/h</p>
                                  <p className={cn('text-sm font-bold tabular-nums', isCphOk ? 'text-green-400' : 'text-destructive')}>
                                    <AppMoney value={revPerHour} size="sm" />
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">CPH</p>
                                  <p className="text-sm font-bold tabular-nums text-foreground">
                                    <AppMoney value={cph} size="sm" />
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Spread/h</p>
                                  <p className={cn('text-sm font-bold tabular-nums', isCphOk ? 'text-green-400' : 'text-destructive')}>
                                    <AppMoney value={revPerHour - cph} size="sm" />
                                  </p>
                                </div>
                              </div>
                              <p className={cn('text-xs font-medium leading-snug', isCphOk ? 'text-green-400' : 'text-destructive')}>
                                {isCphOk
                                  ? `Cada hora trabalhada gera ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(revPerHour - cph)} de lucro líquido.`
                                  : `Atenção: a receita por hora está abaixo do custo real — reajuste o preço cobrado.`}
                              </p>
                            </div>
                          )}

                          {/* Margem total */}
                          <div className="flex justify-between items-center bg-muted/20 p-2 rounded-lg">
                            <div>
                              <span className="typo-section-label">Margem líquida real</span>
                              <span className="text-xs text-muted-foreground ml-1">({marginPercent.toFixed(1)}% da receita)</span>
                            </div>
                            <AppMoney value={margin} colored size="sm" />
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all duration-500',
                                margin >= 0
                                  ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.4)]'
                                  : 'bg-red-400',
                              )}
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
          </div>

          {/* ── SEÇÃO 3: Concentração por Cliente ── */}
          <div>
            <h2 className="typo-section-label mb-3">Concentração de Receita por Cliente</h2>
            <p className="typo-caption text-muted-foreground mb-4">
              Identifica dependência de receita e risco de inadimplência. Clientes com alto percentual de faturamento representam risco caso saiam.
            </p>

            {!clientData?.filter(c => Number(c.total_billed) > 0).length ? (
              <AppEmptyState title="Sem dados de clientes" description="Registre serviços com contas a receber para ver a concentração" />
            ) : (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-left">
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Cliente</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-right">Serviços</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-right">Faturado</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-right">Recebido</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-right">Pendente</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wide">Participação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientData
                        ?.filter(c => Number(c.total_billed) > 0)
                        .map(c => {
                          const billed = Number(c.total_billed)
                          const received = Number(c.total_received)
                          const pending = Number(c.total_pending)
                          const overdue = Number(c.total_overdue)
                          const sharePercent = totalBilledClients > 0 ? (billed / totalBilledClients) * 100 : 0

                          return (
                            <tr key={c.client_id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <Building2 className="h-3.5 w-3.5 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-foreground">{c.client_name}</p>
                                    {overdue > 0 && (
                                      <p className="flex items-center gap-0.5 text-xs text-destructive font-medium mt-0.5">
                                        <AlertTriangle className="h-3 w-3" />
                                        <AppMoney value={overdue} size="sm" /> vencido
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                                {Number(c.service_count)}
                              </td>
                              <td className="px-4 py-3 text-right tabular-nums font-semibold">
                                <AppMoney value={billed} size="sm" />
                              </td>
                              <td className="px-4 py-3 text-right tabular-nums text-green-400 font-medium">
                                <AppMoney value={received} size="sm" />
                              </td>
                              <td className="px-4 py-3 text-right tabular-nums">
                                <span className={cn('font-medium', pending > 0 ? 'text-amber-400' : 'text-muted-foreground')}>
                                  <AppMoney value={pending} size="sm" />
                                </span>
                              </td>
                              <td className="px-4 py-3 min-w-[140px]">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-primary transition-all duration-500"
                                      style={{ width: `${Math.min(sharePercent, 100)}%` }}
                                    />
                                  </div>
                                  <span className="tabular-nums text-xs font-semibold w-10 text-right text-muted-foreground">
                                    {sharePercent.toFixed(1)}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                    {totalBilledClients > 0 && (
                      <tfoot>
                        <tr className="border-t border-border bg-muted/30">
                          <td className="px-4 py-2 font-semibold text-xs uppercase tracking-wide" colSpan={2}>Total</td>
                          <td className="px-4 py-2 text-right font-bold tabular-nums">
                            <AppMoney value={totalBilledClients} size="sm" />
                          </td>
                          <td className="px-4 py-2 text-right font-semibold tabular-nums text-green-400">
                            <AppMoney value={clientData?.reduce((s, c) => s + Number(c.total_received), 0) ?? 0} size="sm" />
                          </td>
                          <td className="px-4 py-2 text-right font-semibold tabular-nums text-amber-400">
                            <AppMoney value={clientData?.reduce((s, c) => s + Number(c.total_pending), 0) ?? 0} size="sm" />
                          </td>
                          <td className="px-4 py-2 text-xs text-muted-foreground">100%</td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
