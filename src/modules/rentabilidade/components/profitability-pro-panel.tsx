import { FleetSpendCategoryChart } from './fleet-spend-category-chart'
import { ProfitabilityTractorProCard } from './profitability-tractor-pro-card'
import { ProfitabilityTruckProCard } from './profitability-truck-pro-card'
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

interface Props {
  tractors: TractorProfitabilityRow[]
  trucks: TruckProfitabilityRow[]
  clients: ClientRevenueRow[]
  fleetSpend: Views<'v_fleet_spend_by_category'> | undefined
  fleetSpendLoading: boolean
  fleetSpendError: boolean
  exportSlug: string
}

export const ProfitabilityProPanel = ({
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

  const exportAll = () => {
    const stamp = exportSlug
    downloadUtf8Csv(`rentabilidade-tratores-${stamp}.csv`, tractorsToCsv(tractors))
    if (trucks.length) downloadUtf8Csv(`rentabilidade-guinchos-${stamp}.csv`, trucksToCsv(trucks))
    downloadUtf8Csv(`rentabilidade-clientes-${stamp}.csv`, clientsToCsv(clients))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AppButton type="button" variant="secondary" size="sm" onClick={exportAll} className="gap-2">
          <Download className="h-4 w-4" />
          Exportar CSV (tratores, guinchos, clientes)
        </AppButton>
      </div>

      <details className="rounded-xl border border-border bg-card p-4 group">
        <summary className="cursor-pointer text-sm font-semibold text-foreground list-none flex items-center justify-between">
          Glossário e bases de cálculo (contador / analista)
          <span className="text-muted-foreground text-xs font-normal group-open:hidden">Abrir</span>
          <span className="text-muted-foreground text-xs font-normal hidden group-open:inline">Fechar</span>
        </summary>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc pl-5">
          <li>
            <strong className="text-foreground">Período:</strong>
            {' '}
            receita e apontamentos filtrados pela
            {' '}
            <strong className="text-foreground">data do serviço</strong>
            ; custos de máquina pela
            {' '}
            <strong className="text-foreground">data do lançamento</strong>
            .
          </li>
          <li>
            <strong className="text-foreground">Receita bruta:</strong>
            {' '}
            soma de parcelas (contas a receber) não canceladas, ligadas a serviços no período.
          </li>
          <li>
            <strong className="text-foreground">Custo máquina / horas (trator):</strong>
            {' '}
            horas trabalhadas × custo/hora padrão do equipamento (derivado de compra, residual e vida útil em horas).
          </li>
          <li>
            <strong className="text-foreground">Depreciação gerencial (guincho):</strong>
            {' '}
            km × (compra − residual) / vida útil em km.
          </li>
          <li>
            <strong className="text-foreground">CPH:</strong>
            {' '}
            custo total por hora (custo máquina + operacional + mão de obra) / horas.
          </li>
          <li>
            <strong className="text-foreground">Recuperação do investimento:</strong>
            {' '}
            lucro gerencial acumulado no período face à
            {' '}
            <strong className="text-foreground">base depreciável (compra − residual)</strong>
            . Não equivale a fluxo de caixa nem a lucro fiscal.
          </li>
        </ul>
      </details>

      {totals.hours > 0 || totals.revenue > 0 ? (
        <div>
          <h2 className="typo-section-label mb-3">Frota tratores — indicadores</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            <AppStatCard title="Receita bruta" value={<AppMoney value={totals.revenue} />} icon={DollarSign} />
            <AppStatCard
              title="Custos totais"
              value={<AppMoney value={totals.depreciation + totals.operational + totals.operatorCost} />}
              icon={TrendingDown}
              description="Máquina + operacional + M.O."
            />
            <AppStatCard title="Mão de obra" value={<AppMoney value={totals.operatorCost} />} icon={Users} />
            <AppStatCard title="Margem líquida" value={<AppMoney value={totals.margin} colored />} icon={TrendingUp} />
            <AppStatCard title="Horas totais" value={`${totals.hours.toFixed(1)}h`} icon={Clock} />
            <AppStatCard
              title="CPH médio frota"
              value={<AppMoney value={fleetCph} />}
              icon={Tractor}
              description={`Receita/h: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(fleetRevPerHour)}`}
            />
          </div>
        </div>
      ) : null}

      {trucks.length > 0 && (truckTotals.km > 0 || truckTotals.revenue > 0) ? (
        <div>
          <h2 className="typo-section-label mb-3">Frota guinchos — indicadores</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
      ) : null}

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {tractors.map((t) => (
              <ProfitabilityTractorProCard key={t.tractor_id ?? ''} t={t} />
            ))}
          </div>
        )}
      </div>

      {trucks.length > 0 && (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {trucks.map((t) => (
              <ProfitabilityTruckProCard key={t.truck_id} t={t} />
            ))}
          </div>
        </div>
      )}

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
    </div>
  )
}
