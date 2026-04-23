import { AppEmptyState } from '@/shared/components/app/app-empty-state'
import { AppMoney } from '@/shared/components/app/app-money'
import { AppStatCard } from '@/shared/components/app/app-stat-card'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  CalendarDays,
  Gauge,
  Activity,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import type { ResourceProfitabilityRow } from '@/integrations/supabase/db-types'
import type { ProfitabilityDateRange } from '../services/profitability.repository'
import { calcAvailableDays, utilizationBarColor, utilizationBgClass, utilizationLabel, utilizationTextColor, calcUtilization } from '../lib/profitability-calc'

const BILLING_LABELS: Record<string, string> = {
  daily:         'Diária',
  hourly:        'Por hora',
  fixed:         'Valor fixo',
  equipment_15d: '15 dias',
  equipment_30d: '30 dias',
}

const TYPE_LABELS: Record<string, string> = {
  tractor:   'Trator',
  truck:     'Caminhão/Guincho',
  equipment: 'Equipamento',
}

interface Props {
  resources: ResourceProfitabilityRow[]
  isLoading: boolean
  isError: boolean
  range: ProfitabilityDateRange
}

export const ProfitabilityResourcesPanel = ({ resources, isLoading, isError, range }: Props) => {
  if (isLoading) return <AppLoadingState />
  if (isError) {
    return (
      <p className="typo-body text-destructive rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-3">
        Não foi possível carregar os dados de equipamentos. Tente novamente.
      </p>
    )
  }

  const availableDays = calcAvailableDays(range.from, range.to)
  const activeResources = resources.filter((r) => Number(r.total_revenue) > 0 || Number(r.services_count) > 0)

  /* Aggregates */
  const totalRevenue  = resources.reduce((s, r) => s + Number(r.total_revenue), 0)
  const totalCost     = resources.reduce((s, r) => s + Number(r.machine_cost), 0)
  const totalMargin   = resources.reduce((s, r) => s + Number(r.net_margin), 0)
  const totalServices = resources.reduce((s, r) => s + Number(r.services_count), 0)

  /* Sort: revenue desc, inactive last */
  const sorted = [...resources].sort((a, b) => Number(b.total_revenue) - Number(a.total_revenue))

  const topEarner  = sorted.find((r) => Number(r.total_revenue) > 0)
  const bestMargin = [...resources]
    .filter((r) => Number(r.services_count) > 0)
    .sort((a, b) => Number(b.net_margin) - Number(a.net_margin))[0]

  return (
    <div className="space-y-8">
      {/* Legenda */}
      <details className="rounded-xl border border-border bg-card p-4 group">
        <summary className="cursor-pointer text-sm font-semibold text-foreground list-none flex items-center justify-between">
          Como ler estes números — equipamentos (log)
          <span className="text-muted-foreground text-xs font-normal group-open:hidden">Abrir</span>
          <span className="text-muted-foreground text-xs font-normal hidden group-open:inline">Fechar</span>
        </summary>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc pl-5">
          <li><strong className="text-foreground">Receita:</strong> soma dos serviços encerrados (status closed ou cancelled com pró-rata) com data de início no período.</li>
          <li><strong className="text-foreground">Custos:</strong> lançamentos em <em>Custos de Máquina</em> vinculados ao equipamento no período.</li>
          <li><strong className="text-foreground">Uso (dias/horas):</strong> soma de <code>usage_quantity</code> dos serviços — unidade depende da modalidade de cobrança.</li>
          <li><strong className="text-foreground">Utilização:</strong> dias usados ÷ dias disponíveis no período (apenas quando período tem data início e fim).</li>
        </ul>
      </details>

      {/* KPIs */}
      {(totalRevenue > 0 || resources.length > 0) && (
        <div>
          <h2 className="typo-section-label mb-3">Equipamentos — indicadores</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <AppStatCard title="Receita total"     value={<AppMoney value={totalRevenue} />}  icon={DollarSign} />
            <AppStatCard title="Custos totais"     value={<AppMoney value={totalCost} />}     icon={TrendingDown} />
            <AppStatCard title="Margem líquida"    value={<AppMoney value={totalMargin} colored />} icon={TrendingUp} />
            <AppStatCard title="Serviços no período" value={String(totalServices)}            icon={Activity} />
          </div>
        </div>
      )}

      {/* Destaques */}
      {(topEarner || bestMargin) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {topEarner && (
            <div className="rounded-xl border border-green-200 bg-green-50 dark:bg-green-500/10 dark:border-green-500/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-400 mb-1">
                Maior receita no período
              </p>
              <p className="font-bold text-foreground">{topEarner.resource_name}</p>
              <p className="text-lg font-bold tabular-nums text-green-700 dark:text-green-400 mt-1">
                <AppMoney value={Number(topEarner.total_revenue)} />
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {Number(topEarner.services_count)} serviço(s) · {TYPE_LABELS[topEarner.resource_type] ?? topEarner.resource_type}
              </p>
            </div>
          )}
          {bestMargin && bestMargin.resource_id !== topEarner?.resource_id && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-500/10 dark:border-blue-500/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-1">
                Melhor margem no período
              </p>
              <p className="font-bold text-foreground">{bestMargin.resource_name}</p>
              <p className="text-lg font-bold tabular-nums text-blue-700 dark:text-blue-400 mt-1">
                <AppMoney value={Number(bestMargin.net_margin)} />
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {Number(bestMargin.services_count)} serviço(s) · {TYPE_LABELS[bestMargin.resource_type] ?? bestMargin.resource_type}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Grid de equipamentos */}
      <section>
        <h2 className="typo-section-label mb-3">Análise por equipamento</h2>
        {!resources.length ? (
          <AppEmptyState
            title="Sem equipamentos"
            description="Cadastre equipamentos no módulo de Reservas e feche serviços para ver a rentabilidade aqui."
          />
        ) : (
          <>
            {/* Tabela de equipamentos com serviços */}
            {activeResources.length > 0 && (
              <div className="rounded-xl border border-border bg-card overflow-hidden mb-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-left">
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Equipamento</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide">Serviços</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide hidden sm:table-cell">Uso</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide">Receita</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide hidden md:table-cell">Custos</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide">Margem</th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide hidden lg:table-cell">%</th>
                        {availableDays !== null && (
                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide hidden xl:table-cell">Utilização</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {activeResources.map((r) => {
                        const rev    = Number(r.total_revenue)
                        const cost   = Number(r.machine_cost)
                        const margin = Number(r.net_margin)
                        const pct    = rev > 0 ? (margin / rev) * 100 : 0
                        const usage  = Number(r.total_usage)

                        /* Utilização por dias (para billing daily/equipment_*) */
                        const usageIsDays = r.billing_type?.startsWith('daily') || r.billing_type?.startsWith('equipment')
                        const util = usageIsDays && availableDays !== null
                          ? calcUtilization(usage, availableDays)
                          : null

                        return (
                          <tr key={r.resource_id} className="border-b border-border last:border-0 hover:bg-muted/20">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                  <Package className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-foreground truncate">{r.resource_name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {TYPE_LABELS[r.resource_type] ?? r.resource_type}
                                    {r.billing_type && (
                                      <span className="ml-1">· {BILLING_LABELS[r.billing_type] ?? r.billing_type}</span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                              {Number(r.services_count)}
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums text-muted-foreground hidden sm:table-cell">
                              {usage > 0
                                ? `${usage.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ${usageIsDays ? 'd' : 'h'}`
                                : '—'}
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums font-semibold">
                              <AppMoney value={rev} size="sm" />
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums text-muted-foreground hidden md:table-cell">
                              <AppMoney value={cost} size="sm" />
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums">
                              <AppMoney value={margin} size="sm" colored />
                            </td>
                            <td className="px-4 py-3 tabular-nums text-sm hidden lg:table-cell">
                              <span className={cn(pct >= 0 ? 'text-green-700 dark:text-green-400' : 'text-destructive')}>
                                {pct.toFixed(1)}%
                              </span>
                            </td>
                            {availableDays !== null && (
                              <td className="px-4 py-3 hidden xl:table-cell min-w-[140px]">
                                {util ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className={cn('text-xs font-semibold', utilizationTextColor(util.status))}>
                                        {util.pct.toFixed(0)}%
                                      </span>
                                      <span className={cn('text-[10px]', utilizationTextColor(util.status))}>
                                        {utilizationLabel(util.status)}
                                      </span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                      <div
                                        className={cn('h-full rounded-full', utilizationBarColor(util.status))}
                                        style={{ width: `${Math.min(util.pct, 100)}%` }}
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </td>
                            )}
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-border bg-muted/30">
                        <td className="px-4 py-2 font-semibold text-xs uppercase" colSpan={3}>Total</td>
                        <td className="px-4 py-2 text-right font-bold tabular-nums">
                          <AppMoney value={totalRevenue} size="sm" />
                        </td>
                        <td className="px-4 py-2 text-right tabular-nums text-muted-foreground hidden md:table-cell">
                          <AppMoney value={totalCost} size="sm" />
                        </td>
                        <td className="px-4 py-2 text-right font-bold tabular-nums" colSpan={availableDays !== null ? 3 : 2}>
                          <AppMoney value={totalMargin} size="sm" colored />
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Equipamentos sem serviços */}
            {resources.filter((r) => Number(r.services_count) === 0).length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <h3 className="typo-section-label text-amber-700 dark:text-amber-400">
                    Sem serviços no período
                  </h3>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {resources
                    .filter((r) => Number(r.services_count) === 0)
                    .map((r) => (
                      <div
                        key={r.resource_id}
                        className="rounded-lg border border-border bg-card/50 p-3 flex items-center gap-3"
                      >
                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{r.resource_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {TYPE_LABELS[r.resource_type] ?? r.resource_type}
                            {' '}· {r.resource_status === 'available' ? 'Disponível' : r.resource_status === 'maintenance' ? 'Em manutenção' : 'Inativo'}
                          </p>
                        </div>
                        {Number(r.machine_cost) > 0 && (
                          <div className="ml-auto text-right shrink-0">
                            <p className="text-[10px] text-muted-foreground">Custo</p>
                            <p className="text-xs font-semibold text-destructive tabular-nums">
                              <AppMoney value={Number(r.machine_cost)} size="sm" />
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Utilização por período — apenas se período definido e billing por dia */}
      {availableDays !== null && activeResources.some((r) => r.billing_type?.startsWith('daily') || r.billing_type?.startsWith('equipment')) && (
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Gauge className="h-4 w-4 text-primary" />
            <h2 className="typo-section-label">Utilização dos equipamentos (cobrança diária)</h2>
          </div>
          <p className="typo-caption text-muted-foreground mb-3">
            Base: {availableDays} dias disponíveis no período. Benchmark: {'>'} 70% = boa.
          </p>
          <div className="space-y-2">
            {activeResources
              .filter((r) => r.billing_type?.startsWith('daily') || r.billing_type?.startsWith('equipment'))
              .map((r) => {
                const usage = Number(r.total_usage)
                const util  = calcUtilization(usage, availableDays)
                if (!util) return null
                return (
                  <div key={r.resource_id} className={cn('rounded-lg border p-3', utilizationBgClass(util.status))}>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-medium text-sm">{r.resource_name}</span>
                      <span className={cn('text-sm font-bold tabular-nums', utilizationTextColor(util.status))}>
                        {util.pct.toFixed(1)}% — {utilizationLabel(util.status)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-500', utilizationBarColor(util.status))}
                        style={{ width: `${Math.min(util.pct, 100)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {util.worked.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} d usados / {util.available} d disponíveis
                    </p>
                  </div>
                )
              })}
          </div>
        </section>
      )}
    </div>
  )
}
