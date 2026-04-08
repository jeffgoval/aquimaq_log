import { FleetSpendCategoryChart } from './fleet-spend-category-chart'
import { AppEmptyState } from '@/shared/components/app/app-empty-state'
import { AppMoney } from '@/shared/components/app/app-money'
import { AppStatCard } from '@/shared/components/app/app-stat-card'
import { AppButton } from '@/shared/components/app/app-button'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Tractor,
  Users,
  Building2,
  AlertTriangle,
  Truck,
  Download,
} from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import type { TractorProfitabilityRow } from '../services/profitability.repository'
import type { ClientRevenueRow, TruckProfitabilityRow, Views } from '@/integrations/supabase/db-types'
import { clientsToCsv, downloadUtf8Csv, tractorsToCsv, trucksToCsv } from '../lib/profitability-export-csv'
import type { ProfitabilityFleetTab } from './profitability-toolbar'

interface Props {
  fleetTab: ProfitabilityFleetTab
  tractors: TractorProfitabilityRow[]
  trucks: TruckProfitabilityRow[]
  clients: ClientRevenueRow[]
  fleetSpend: Views<'v_fleet_spend_by_category'> | undefined
  fleetSpendLoading: boolean
  fleetSpendError: boolean
  exportSlug: string
}

export const ProfitabilityProPanel = ({
  fleetTab,
  tractors,
  trucks,
  clients,
  fleetSpend,
  fleetSpendLoading,
  fleetSpendError,
  exportSlug,
}: Props) => {
  const totals = tractors.reduce(
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

  const fleetCph = totals.hours > 0
    ? (totals.depreciation + totals.operational + totals.operatorCost) / totals.hours
    : 0
  const fleetRevPerHour = totals.hours > 0 ? totals.revenue / totals.hours : 0

  const truckTotals = trucks.reduce(
    (acc, t) => ({
      revenue: acc.revenue + Number(t.gross_revenue),
      margin: acc.margin + Number(t.net_margin),
      km: acc.km + Number(t.total_km),
      dep: acc.dep + Number(t.depreciation_cost),
      op: acc.op + Number(t.operational_cost),
      mo: acc.mo + Number(t.operator_cost),
    }),
    { revenue: 0, margin: 0, km: 0, dep: 0, op: 0, mo: 0 },
  )
  const fleetCpk = truckTotals.km > 0 ? (truckTotals.dep + truckTotals.op + truckTotals.mo) / truckTotals.km : 0
  const fleetRevPerKm = truckTotals.km > 0 ? truckTotals.revenue / truckTotals.km : 0

  const totalBilledClients = clients.reduce((s, c) => s + Number(c.total_billed), 0)

  const exportTractorBundle = () => {
    const stamp = exportSlug
    downloadUtf8Csv(`rentabilidade-tratores-${stamp}.csv`, tractorsToCsv(tractors))
    downloadUtf8Csv(`rentabilidade-clientes-${stamp}.csv`, clientsToCsv(clients))
  }

  const exportTrucksOnly = () => {
    downloadUtf8Csv(`rentabilidade-guinchos-${exportSlug}.csv`, trucksToCsv(trucks))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {fleetTab === 'tractor' ? (
          <AppButton type="button" variant="secondary" size="sm" onClick={exportTractorBundle} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar CSV (tratores e clientes)
          </AppButton>
        ) : (
          <AppButton type="button" variant="secondary" size="sm" onClick={exportTrucksOnly} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar CSV (guinchos)
          </AppButton>
        )}
      </div>

      {fleetTab === 'tractor' ? (
        <details className="rounded-xl border border-border bg-card p-4 group">
          <summary className="cursor-pointer text-sm font-semibold text-foreground list-none flex items-center justify-between">
            Como ler estes números — tratores
            <span className="text-muted-foreground text-xs font-normal group-open:hidden">Abrir</span>
            <span className="text-muted-foreground text-xs font-normal hidden group-open:inline">Fechar</span>
          </summary>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc pl-5">
            <li>
              <strong className="text-foreground">Período:</strong>
              {' '}
              usamos a <strong className="text-foreground">data do serviço</strong> para receita e horas; custos de máquina usam a <strong className="text-foreground">data do lançamento</strong>.
            </li>
            <li>
              <strong className="text-foreground">Receita:</strong> soma das parcelas de serviços no período (exceto canceladas).
            </li>
            <li>
              <strong className="text-foreground">Custos:</strong> incluem máquina (depreciação), operacional e mão de obra.
            </li>
            <li>
              <strong className="text-foreground">Custo por hora:</strong> custos totais ÷ horas no período.
            </li>
            <li>
              <strong className="text-foreground">Lucro:</strong> receita menos custos (visão de gestão; não substitui contabilidade).
            </li>
          </ul>
        </details>
      ) : (
        <details className="rounded-xl border border-border bg-card p-4 group">
          <summary className="cursor-pointer text-sm font-semibold text-foreground list-none flex items-center justify-between">
            Como ler estes números — guinchos
            <span className="text-muted-foreground text-xs font-normal group-open:hidden">Abrir</span>
            <span className="text-muted-foreground text-xs font-normal hidden group-open:inline">Fechar</span>
          </summary>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc pl-5">
            <li>
              <strong className="text-foreground">Período:</strong>
              {' '}
              usamos a <strong className="text-foreground">data do serviço</strong> para receita e km; custos de máquina usam a <strong className="text-foreground">data do lançamento</strong>.
            </li>
            <li>
              <strong className="text-foreground">Receita:</strong> soma das parcelas de serviços com guincho no período.
            </li>
            <li>
              <strong className="text-foreground">Custo por km:</strong> custos totais ÷ km no período.
            </li>
            <li>
              <strong className="text-foreground">Lucro por km:</strong> receita por km menos custo por km.
            </li>
          </ul>
        </details>
      )}

      {fleetTab === 'tractor' && (totals.hours > 0 || totals.revenue > 0 ? (
        <div>
          <h2 className="typo-section-label mb-3">Frota tratores — indicadores</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <AppStatCard title="Receita bruta" value={<AppMoney value={totals.revenue} />} icon={DollarSign} />
            <AppStatCard
              title="Custos"
              value={<AppMoney value={totals.depreciation + totals.operational + totals.operatorCost} />}
              icon={TrendingDown}
              description="Máquina + operacional + mão de obra"
            />
            <AppStatCard title="Mão de obra" value={<AppMoney value={totals.operatorCost} />} icon={Users} />
            <AppStatCard title="Margem líquida" value={<AppMoney value={totals.margin} colored />} icon={TrendingUp} />
            <AppStatCard title="Horas totais" value={`${totals.hours.toFixed(1)}h`} icon={Clock} />
            <AppStatCard
              title="Custo por hora"
              value={<AppMoney value={fleetCph} />}
              icon={Tractor}
              description={`Receita/h: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(fleetRevPerHour)}`}
            />
          </div>
        </div>
      ) : null)}

      {fleetTab === 'truck' && trucks.length > 0 && (truckTotals.km > 0 || truckTotals.revenue > 0 ? (
        <div>
          <h2 className="typo-section-label mb-3">Frota guinchos — indicadores</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <AppStatCard title="Receita bruta" value={<AppMoney value={truckTotals.revenue} />} icon={DollarSign} />
            <AppStatCard title="Margem líquida" value={<AppMoney value={truckTotals.margin} colored />} icon={TrendingUp} />
            <AppStatCard title="KM no período" value={`${truckTotals.km.toFixed(1)} km`} icon={Truck} />
            <AppStatCard
              title="Custo/km médio"
              value={<AppMoney value={fleetCpk} />}
              icon={Truck}
              description={`Receita/km: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(fleetRevPerKm)}`}
            />
          </div>
        </div>
      ) : null)}

      {fleetTab === 'tractor' && (
        <>
          {fleetSpendError ? (
            <p className="typo-body text-destructive rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-3">
              Não foi possível carregar o gráfico de gastos por categoria.
            </p>
          ) : (
            <FleetSpendCategoryChart row={fleetSpend} isLoading={fleetSpendLoading} />
          )}

          <div className="mb-8">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="typo-section-label">Análise por máquina — tratores</h2>
              <AppButton
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1"
                onClick={() => downloadUtf8Csv(`rentabilidade-tratores-${exportSlug}.csv`, tractorsToCsv(tractors))}
              >
                <Download className="h-3.5 w-3.5" />
                CSV
              </AppButton>
            </div>
            {!tractors.length ? (
              <AppEmptyState title="Sem tratores" description="Cadastre tratores e lance serviços no período." />
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border bg-card">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-left">
                      <th className="p-3 font-medium">Trator</th>
                      <th className="p-3 font-medium whitespace-nowrap">Horas</th>
                      <th className="p-3 font-medium text-right whitespace-nowrap">Receita</th>
                      <th className="p-3 font-medium text-right whitespace-nowrap hidden lg:table-cell">Custos</th>
                      <th className="p-3 font-medium text-right whitespace-nowrap">Margem</th>
                      <th className="p-3 font-medium whitespace-nowrap hidden md:table-cell">%</th>
                      <th className="p-3 font-medium text-right whitespace-nowrap hidden xl:table-cell">Receita/h</th>
                      <th className="p-3 font-medium text-right whitespace-nowrap hidden xl:table-cell">Custo/h</th>
                      <th className="p-3 font-medium text-right whitespace-nowrap hidden xl:table-cell">Lucro/h</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tractors.map((t) => {
                      const revenue = Number(t.gross_revenue)
                      const margin = Number(t.net_margin)
                      const hours = Number(t.total_hours)
                      const costs = Number(t.depreciation_cost) + Number(t.operational_cost) + Number(t.operator_cost)
                      const pct = revenue > 0 ? (margin / revenue) * 100 : 0
                      const revPerHour = Number(t.revenue_per_hour)
                      const cph = Number(t.cost_per_hour)
                      const spread = revPerHour - cph
                      return (
                        <tr key={t.tractor_id ?? ''} className="border-b border-border last:border-0 hover:bg-muted/20">
                          <td className="p-3 min-w-0">
                            <div className="font-medium text-foreground truncate">{t.tractor_name || '—'}</div>
                            <div className="text-xs text-muted-foreground lg:hidden truncate">
                              Custos: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(costs)}
                            </div>
                          </td>
                          <td className="p-3 tabular-nums whitespace-nowrap">{hours.toFixed(1)}h</td>
                          <td className="p-3 text-right tabular-nums whitespace-nowrap"><AppMoney value={revenue} size="sm" /></td>
                          <td className="p-3 text-right tabular-nums whitespace-nowrap hidden lg:table-cell"><AppMoney value={costs} size="sm" /></td>
                          <td className="p-3 text-right tabular-nums whitespace-nowrap"><AppMoney value={margin} size="sm" colored /></td>
                          <td className="p-3 tabular-nums whitespace-nowrap hidden md:table-cell">{pct.toFixed(1)}%</td>
                          <td className="p-3 text-right tabular-nums whitespace-nowrap hidden xl:table-cell"><AppMoney value={revPerHour} size="sm" /></td>
                          <td className="p-3 text-right tabular-nums whitespace-nowrap hidden xl:table-cell"><AppMoney value={cph} size="sm" /></td>
                          <td className="p-3 text-right tabular-nums whitespace-nowrap hidden xl:table-cell"><AppMoney value={spread} size="sm" colored /></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="typo-section-label">Concentração de receita por cliente</h2>
              <AppButton
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1"
                onClick={() => downloadUtf8Csv(`rentabilidade-clientes-${exportSlug}.csv`, clientsToCsv(clients))}
              >
                <Download className="h-3.5 w-3.5" />
                CSV
              </AppButton>
            </div>
            <p className="typo-caption text-muted-foreground mb-4">
              Parcelas de serviços com data no período selecionado. Identifica dependência de faturamento e risco de inadimplência.
            </p>

            {!clients.filter((c) => Number(c.total_billed) > 0).length ? (
              <AppEmptyState title="Sem dados de clientes" description="Não há faturamento no período." />
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
                      {clients
                        .filter((c) => Number(c.total_billed) > 0)
                        .map((c) => {
                          const billed = Number(c.total_billed)
                          const received = Number(c.total_received)
                          const pending = Number(c.total_pending)
                          const overdue = Number(c.total_overdue)
                          const sharePercent = totalBilledClients > 0 ? (billed / totalBilledClients) * 100 : 0

                          return (
                            <tr key={c.client_id ?? ''} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
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
                                        <AppMoney value={overdue} size="sm" />
                                        {' '}
                                        vencido
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
                              <td className="px-4 py-3 text-right tabular-nums text-green-800 dark:text-green-400 font-medium">
                                <AppMoney value={received} size="sm" />
                              </td>
                              <td className="px-4 py-3 text-right tabular-nums">
                                <span className={cn('font-medium', pending > 0 ? 'text-amber-800 dark:text-amber-400' : 'text-muted-foreground')}>
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
                                    {sharePercent.toFixed(1)}
                                    %
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
                          <td className="px-4 py-2 text-right font-semibold tabular-nums text-green-800 dark:text-green-400">
                            <AppMoney value={clients.reduce((s, c) => s + Number(c.total_received), 0)} size="sm" />
                          </td>
                          <td className="px-4 py-2 text-right font-semibold tabular-nums text-amber-800 dark:text-amber-400">
                            <AppMoney value={clients.reduce((s, c) => s + Number(c.total_pending), 0)} size="sm" />
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

      {fleetTab === 'truck' && (
        <div className="mb-8">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="typo-section-label">Análise por máquina — guinchos</h2>
            <AppButton
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1"
              onClick={() => downloadUtf8Csv(`rentabilidade-guinchos-${exportSlug}.csv`, trucksToCsv(trucks))}
            >
              <Download className="h-3.5 w-3.5" />
              CSV
            </AppButton>
          </div>
          {!trucks.length ? (
            <AppEmptyState title="Sem guinchos" description="Cadastre caminhões e lance serviços no período." />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-left">
                    <th className="p-3 font-medium">Guincho</th>
                    <th className="p-3 font-medium whitespace-nowrap">KM</th>
                    <th className="p-3 font-medium text-right whitespace-nowrap">Receita</th>
                    <th className="p-3 font-medium text-right whitespace-nowrap hidden lg:table-cell">Custos</th>
                    <th className="p-3 font-medium text-right whitespace-nowrap">Margem</th>
                    <th className="p-3 font-medium whitespace-nowrap hidden md:table-cell">%</th>
                    <th className="p-3 font-medium text-right whitespace-nowrap hidden xl:table-cell">Receita/km</th>
                    <th className="p-3 font-medium text-right whitespace-nowrap hidden xl:table-cell">Custo/km</th>
                    <th className="p-3 font-medium text-right whitespace-nowrap hidden xl:table-cell">Lucro/km</th>
                  </tr>
                </thead>
                <tbody>
                  {trucks.map((t) => {
                    const revenue = Number(t.gross_revenue)
                    const margin = Number(t.net_margin)
                    const km = Number(t.total_km)
                    const costs = Number(t.depreciation_cost) + Number(t.operational_cost) + Number(t.operator_cost)
                    const pct = revenue > 0 ? (margin / revenue) * 100 : 0
                    const revPerKm = Number(t.revenue_per_km)
                    const cpk = Number(t.cost_per_km)
                    const spread = revPerKm - cpk
                    return (
                      <tr key={t.truck_id ?? ''} className="border-b border-border last:border-0 hover:bg-muted/20">
                        <td className="p-3 min-w-0">
                          <div className="font-medium text-foreground truncate">{t.truck_name || '—'}</div>
                          <div className="text-xs text-muted-foreground lg:hidden truncate">
                            Custos: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(costs)}
                          </div>
                        </td>
                        <td className="p-3 tabular-nums whitespace-nowrap">{km.toFixed(1)} km</td>
                        <td className="p-3 text-right tabular-nums whitespace-nowrap"><AppMoney value={revenue} size="sm" /></td>
                        <td className="p-3 text-right tabular-nums whitespace-nowrap hidden lg:table-cell"><AppMoney value={costs} size="sm" /></td>
                        <td className="p-3 text-right tabular-nums whitespace-nowrap"><AppMoney value={margin} size="sm" colored /></td>
                        <td className="p-3 tabular-nums whitespace-nowrap hidden md:table-cell">{pct.toFixed(1)}%</td>
                        <td className="p-3 text-right tabular-nums whitespace-nowrap hidden xl:table-cell"><AppMoney value={revPerKm} size="sm" /></td>
                        <td className="p-3 text-right tabular-nums whitespace-nowrap hidden xl:table-cell"><AppMoney value={cpk} size="sm" /></td>
                        <td className="p-3 text-right tabular-nums whitespace-nowrap hidden xl:table-cell"><AppMoney value={spread} size="sm" colored /></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
