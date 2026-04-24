import { FleetSpendCategoryChart } from './fleet-spend-category-chart'
import { AppEmptyState } from '@/shared/components/app/app-empty-state'
import { AppMoney } from '@/shared/components/app/app-money'
import { AppStatCard } from '@/shared/components/app/app-stat-card'
import { AppButton } from '@/shared/components/app/app-button'
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Tractor,
  Truck,
  Users,
  Clock,
  Building2,
  AlertTriangle,
  Download,
  Activity,
  BarChart3,
  Gauge,
  ShieldAlert,
  Package,
} from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import type { TractorProfitabilityRow } from '../services/profitability.repository'
import type { ClientRevenueRow, TruckProfitabilityRow, ResourceProfitabilityRow, Views } from '@/integrations/supabase/db-types'
import type { ProfitabilityDateRange } from '../services/profitability.repository'
import { clientsToCsv, downloadUtf8Csv } from '../lib/profitability-export-csv'
import {
  calcAvailableHours,
  calcDRE,
  calcUtilization,
  calcMinViableRate,
  utilizationBarColor,
  utilizationTextColor,
  utilizationBgClass,
  utilizationLabel,
  minViableRateBgClass,
  minViableRateTextColor,
} from '../lib/profitability-calc'

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

interface Props {
  tractors: TractorProfitabilityRow[]
  trucks: TruckProfitabilityRow[]
  clients: ClientRevenueRow[]
  resources: ResourceProfitabilityRow[]
  fleetSpend: Views<'v_fleet_spend_by_category'> | undefined
  fleetSpendLoading: boolean
  fleetSpendError: boolean
  exportSlug: string
  range: ProfitabilityDateRange
}

export const ProfitabilityOverviewPanel = ({
  tractors,
  trucks,
  clients,
  resources,
  fleetSpend,
  fleetSpendLoading,
  fleetSpendError,
  exportSlug,
  range,
}: Props) => {
  /* ───────── Tractor aggregation ───────── */
  const totals = tractors.reduce(
    (acc, t) => ({
      revenue: acc.revenue + Number(t.gross_revenue),
      margin: acc.margin + Number(t.net_margin),
      hours: acc.hours + Number(t.total_hours),
      depreciation: acc.depreciation + Number(t.depreciation_cost),
      operational: acc.operational + Number(t.operational_cost),
      operatorCost: acc.operatorCost + Number(t.operator_cost),
    }),
    { revenue: 0, margin: 0, hours: 0, depreciation: 0, operational: 0, operatorCost: 0 },
  )

  const tractorCostsTotal = totals.depreciation + totals.operational + totals.operatorCost
  const tractorRevenuePerHour = totals.hours > 0 ? totals.revenue / totals.hours : 0
  const tractorCostPerHour = totals.hours > 0 ? tractorCostsTotal / totals.hours : 0
  const tractorProfitPerHour = totals.hours > 0 ? totals.margin / totals.hours : 0

  /* ───────── Truck aggregation ───────── */
  const truckTotals = trucks.reduce(
    (acc, t) => ({
      revenue: acc.revenue + Number(t.gross_revenue),
      margin: acc.margin + Number(t.net_margin),
      km: acc.km + Number(t.total_km),
      depreciation: acc.depreciation + Number(t.depreciation_cost),
      operational: acc.operational + Number(t.operational_cost),
      operatorCost: acc.operatorCost + Number(t.operator_cost),
    }),
    { revenue: 0, margin: 0, km: 0, depreciation: 0, operational: 0, operatorCost: 0 },
  )

  const truckCostsTotal = truckTotals.depreciation + truckTotals.operational + truckTotals.operatorCost
  const truckRevenuePerKm = truckTotals.km > 0 ? truckTotals.revenue / truckTotals.km : 0
  const truckCostPerKm = truckTotals.km > 0 ? truckCostsTotal / truckTotals.km : 0
  const truckProfitPerKm = truckTotals.km > 0 ? truckTotals.margin / truckTotals.km : 0

  /* ───────── Client aggregation ───────── */
  const billedClients = clients.filter((c) => Number(c.total_billed) > 0)
  const totalPending = billedClients.reduce((s, c) => s + Number(c.total_pending), 0)
  const totalOverdue = billedClients.reduce((s, c) => s + Number(c.total_overdue), 0)
  const totalBilledClients = billedClients.reduce((s, c) => s + Number(c.total_billed), 0)

  /* ───────── DRE consolidada ───────── */
  const tractorDRE = calcDRE(totals.revenue, totals.operational, totals.operatorCost, totals.depreciation)
  const truckDRE   = calcDRE(truckTotals.revenue, truckTotals.operational, truckTotals.operatorCost, truckTotals.depreciation)

  /* Equipamentos (log_resources): todos os custos são operacionais; sem depreciação gerencial separada */
  const resTotals = resources.reduce(
    (acc, r) => ({
      revenue: acc.revenue + Number(r.total_revenue),
      cost:    acc.cost    + Number(r.machine_cost),
      margin:  acc.margin  + Number(r.net_margin),
    }),
    { revenue: 0, cost: 0, margin: 0 },
  )
  const resourceDRE = calcDRE(resTotals.revenue, resTotals.cost, 0, 0)

  const totalRevenue = totals.revenue + truckTotals.revenue + resTotals.revenue
  const totalDRE = calcDRE(
    totalRevenue,
    totals.operational + truckTotals.operational + resTotals.cost,
    totals.operatorCost + truckTotals.operatorCost,
    totals.depreciation + truckTotals.depreciation,
  )

  /* ───────── Utilização da frota ───────── */
  const availableHours = calcAvailableHours(range.from, range.to)
  const tractorsWithHours = tractors.filter((t) => Number(t.total_hours) > 0)
  const trucksWithKm = trucks.filter((t) => Number(t.total_km) > 0 || Number(t.gross_revenue) > 0)

  /* ───────── Semáforo de tarifas ───────── */
  const tractorRates = tractors
    .filter((t) => Number(t.total_hours) > 0)
    .map((t) => ({
      name: t.tractor_name,
      mvr: calcMinViableRate(Number(t.revenue_per_hour), Number(t.cost_per_hour)),
    }))
    .sort((a, b) => a.mvr.safetyPct - b.mvr.safetyPct)

  const truckRates = trucks
    .filter((t) => Number(t.total_km) > 0)
    .map((t) => ({
      name: t.truck_name,
      mvr: calcMinViableRate(Number(t.revenue_per_km), Number(t.cost_per_km)),
    }))
    .sort((a, b) => a.mvr.safetyPct - b.mvr.safetyPct)

  const hasRateAlerts =
    tractorRates.some((r) => r.mvr.status !== 'ok') ||
    truckRates.some((r) => r.mvr.status !== 'ok')

  /* ───────── Tractor ranking ───────── */
  const sortedTractorsAsc = [...tractorsWithHours].sort(
    (a, b) => Number(a.net_margin) - Number(b.net_margin),
  )
  const sortedTractorsDesc = [...tractorsWithHours].sort(
    (a, b) => Number(b.net_margin) - Number(a.net_margin),
  )

  const showTractorRanking = tractorsWithHours.length >= 2

  let worstTractors: typeof tractorsWithHours = []
  let bestTractors: typeof tractorsWithHours = []
  if (showTractorRanking) {
    if (tractorsWithHours.length === 2) {
      worstTractors = [sortedTractorsAsc[0]]
      bestTractors  = [sortedTractorsDesc[0]]
    } else {
      worstTractors = sortedTractorsAsc.slice(0, 2)
      const worstIds = new Set(worstTractors.map((t) => t.tractor_id))
      bestTractors = sortedTractorsDesc.filter((t) => !worstIds.has(t.tractor_id)).slice(0, 2)
    }
  }

  /* ───────── Truck ranking ───────── */
  const sortedTrucksAsc  = [...trucksWithKm].sort((a, b) => Number(a.net_margin) - Number(b.net_margin))
  const sortedTrucksDesc = [...trucksWithKm].sort((a, b) => Number(b.net_margin) - Number(a.net_margin))

  const showTruckRanking = trucksWithKm.length >= 2

  let worstTrucks: typeof trucksWithKm = []
  let bestTrucks: typeof trucksWithKm = []
  if (showTruckRanking) {
    if (trucksWithKm.length === 2) {
      worstTrucks = [sortedTrucksAsc[0]]
      bestTrucks  = [sortedTrucksDesc[0]]
    } else {
      worstTrucks = sortedTrucksAsc.slice(0, 2)
      const worstIds = new Set(worstTrucks.map((t) => t.truck_id))
      bestTrucks = sortedTrucksDesc.filter((t) => !worstIds.has(t.truck_id)).slice(0, 2)
    }
  }

  return (
    <div className="space-y-8">

      {/* ═══════════ DRE CONSOLIDADA ═══════════ */}
      {totalRevenue > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h2 className="typo-section-label">DRE Operacional — consolidado</h2>
          </div>
          <p className="typo-caption text-muted-foreground mb-4">
            Receita Bruta → <strong className="text-foreground">Margem de Contribuição</strong> (após custos variáveis) →{' '}
            <strong className="text-foreground">Resultado Operacional</strong> (após depreciação gerencial do ativo).
          </p>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide">Linha DRE</th>
                    {tractors.length > 0 && (
                      <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide">
                        <span className="flex items-center justify-end gap-1"><Tractor className="h-3.5 w-3.5" /> Tratores</span>
                      </th>
                    )}
                    {trucks.length > 0 && (
                      <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide">
                        <span className="flex items-center justify-end gap-1"><Truck className="h-3.5 w-3.5" /> Guinchos</span>
                      </th>
                    )}
                    {resources.length > 0 && (
                      <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide">
                        <span className="flex items-center justify-end gap-1"><Package className="h-3.5 w-3.5" /> Equipamentos</span>
                      </th>
                    )}
                    <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-primary">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Receita Bruta */}
                  <tr className="border-b border-border/50">
                    <td className="px-4 py-2.5 font-medium text-foreground">Receita Bruta</td>
                    {tractors.length > 0 && (
                      <td className="px-4 py-2.5 text-right tabular-nums font-semibold">
                        <AppMoney value={tractorDRE.grossRevenue} size="sm" />
                      </td>
                    )}
                    {trucks.length > 0 && (
                      <td className="px-4 py-2.5 text-right tabular-nums font-semibold">
                        <AppMoney value={truckDRE.grossRevenue} size="sm" />
                      </td>
                    )}
                    {resources.length > 0 && (
                      <td className="px-4 py-2.5 text-right tabular-nums font-semibold">
                        <AppMoney value={resourceDRE.grossRevenue} size="sm" />
                      </td>
                    )}
                    <td className="px-4 py-2.5 text-right tabular-nums font-bold text-primary">
                      <AppMoney value={totalDRE.grossRevenue} size="sm" />
                    </td>
                  </tr>
                  {/* Custos variáveis */}
                  <tr className="border-b border-border/50 bg-muted/10">
                    <td className="px-4 py-2.5 text-muted-foreground">
                      <span className="text-xs mr-1 text-destructive/70">(-)</span>
                      Custos Variáveis
                      <span className="ml-1 text-xs text-muted-foreground/70">(combustível + mão de obra)</span>
                    </td>
                    {tractors.length > 0 && (
                      <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                        <AppMoney value={tractorDRE.variableCost} size="sm" />
                      </td>
                    )}
                    {trucks.length > 0 && (
                      <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                        <AppMoney value={truckDRE.variableCost} size="sm" />
                      </td>
                    )}
                    {resources.length > 0 && (
                      <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                        <AppMoney value={resourceDRE.variableCost} size="sm" />
                      </td>
                    )}
                    <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                      <AppMoney value={totalDRE.variableCost} size="sm" />
                    </td>
                  </tr>
                  {/* Margem de Contribuição */}
                  <tr className="border-b border-border bg-primary/5">
                    <td className="px-4 py-2.5 font-semibold text-foreground">
                      <span className="text-xs mr-1 text-primary/70">(=)</span>
                      Margem de Contribuição
                    </td>
                    {tractors.length > 0 && (
                      <td className="px-4 py-2.5 text-right tabular-nums">
                        <span className={cn('font-semibold', tractorDRE.contributionMargin >= 0 ? 'text-green-700 dark:text-green-400' : 'text-destructive')}>
                          <AppMoney value={tractorDRE.contributionMargin} size="sm" />
                        </span>
                        <span className="ml-1 text-xs text-muted-foreground">({tractorDRE.contributionMarginPct.toFixed(1)}%)</span>
                      </td>
                    )}
                    {trucks.length > 0 && (
                      <td className="px-4 py-2.5 text-right tabular-nums">
                        <span className={cn('font-semibold', truckDRE.contributionMargin >= 0 ? 'text-green-700 dark:text-green-400' : 'text-destructive')}>
                          <AppMoney value={truckDRE.contributionMargin} size="sm" />
                        </span>
                        <span className="ml-1 text-xs text-muted-foreground">({truckDRE.contributionMarginPct.toFixed(1)}%)</span>
                      </td>
                    )}
                    {resources.length > 0 && (
                      <td className="px-4 py-2.5 text-right tabular-nums">
                        <span className={cn('font-semibold', resourceDRE.contributionMargin >= 0 ? 'text-green-700 dark:text-green-400' : 'text-destructive')}>
                          <AppMoney value={resourceDRE.contributionMargin} size="sm" />
                        </span>
                        <span className="ml-1 text-xs text-muted-foreground">({resourceDRE.contributionMarginPct.toFixed(1)}%)</span>
                      </td>
                    )}
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      <span className={cn('font-bold', totalDRE.contributionMargin >= 0 ? 'text-green-700 dark:text-green-400' : 'text-destructive')}>
                        <AppMoney value={totalDRE.contributionMargin} size="sm" />
                      </span>
                      <span className="ml-1 text-xs text-muted-foreground">({totalDRE.contributionMarginPct.toFixed(1)}%)</span>
                    </td>
                  </tr>
                  {/* Depreciação gerencial */}
                  <tr className="border-b border-border/50 bg-muted/10">
                    <td className="px-4 py-2.5 text-muted-foreground">
                      <span className="text-xs mr-1 text-destructive/70">(-)</span>
                      Depreciação Gerencial
                      <span className="ml-1 text-xs text-muted-foreground/70">(amortização do ativo)</span>
                    </td>
                    {tractors.length > 0 && (
                      <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                        <AppMoney value={tractorDRE.capitalCost} size="sm" />
                      </td>
                    )}
                    {trucks.length > 0 && (
                      <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                        <AppMoney value={truckDRE.capitalCost} size="sm" />
                      </td>
                    )}
                    {resources.length > 0 && (
                      <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                        —
                      </td>
                    )}
                    <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                      <AppMoney value={totalDRE.capitalCost} size="sm" />
                    </td>
                  </tr>
                  {/* Resultado Operacional */}
                  <tr className="bg-muted/20">
                    <td className="px-4 py-3 font-bold text-foreground">
                      <span className="text-xs mr-1 text-primary/70">(=)</span>
                      Resultado Operacional
                    </td>
                    {tractors.length > 0 && (
                      <td className="px-4 py-3 text-right tabular-nums">
                        <span className={cn('font-bold', tractorDRE.operatingResult >= 0 ? 'text-green-700 dark:text-green-400' : 'text-destructive')}>
                          <AppMoney value={tractorDRE.operatingResult} size="sm" />
                        </span>
                        <span className="ml-1 text-xs text-muted-foreground">({tractorDRE.operatingResultPct.toFixed(1)}%)</span>
                      </td>
                    )}
                    {trucks.length > 0 && (
                      <td className="px-4 py-3 text-right tabular-nums">
                        <span className={cn('font-bold', truckDRE.operatingResult >= 0 ? 'text-green-700 dark:text-green-400' : 'text-destructive')}>
                          <AppMoney value={truckDRE.operatingResult} size="sm" />
                        </span>
                        <span className="ml-1 text-xs text-muted-foreground">({truckDRE.operatingResultPct.toFixed(1)}%)</span>
                      </td>
                    )}
                    {resources.length > 0 && (
                      <td className="px-4 py-3 text-right tabular-nums">
                        <span className={cn('font-bold', resourceDRE.operatingResult >= 0 ? 'text-green-700 dark:text-green-400' : 'text-destructive')}>
                          <AppMoney value={resourceDRE.operatingResult} size="sm" />
                        </span>
                        <span className="ml-1 text-xs text-muted-foreground">({resourceDRE.operatingResultPct.toFixed(1)}%)</span>
                      </td>
                    )}
                    <td className="px-4 py-3 text-right tabular-nums">
                      <span className={cn('font-bold text-base', totalDRE.operatingResult >= 0 ? 'text-green-700 dark:text-green-400' : 'text-destructive')}>
                        <AppMoney value={totalDRE.operatingResult} size="sm" />
                      </span>
                      <span className="ml-1 text-xs text-muted-foreground">({totalDRE.operatingResultPct.toFixed(1)}%)</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Custos variáveis = combustível, peças, manutenção e mão de obra direta. Depreciação gerencial = rateio do ativo pela vida útil (horas/km). Equipamentos: todos os custos lançados são tratados como operacionais. Visão de gestão; não substitui contabilidade.
          </p>
        </section>
      )}

      {/* ═══════════ Tratores ═══════════ */}
      <section className="space-y-6">
        <div>
          <h2 className="typo-section-label mb-3">Situação geral — tratores</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <AppStatCard title="Receita (período)" value={<AppMoney value={totals.revenue} />} icon={DollarSign} />
            <AppStatCard title="Custos (período)" value={<AppMoney value={tractorCostsTotal} />} icon={TrendingDown} description="Máquina + operacional + mão de obra" />
            <AppStatCard title="Lucro (período)" value={<AppMoney value={totals.margin} colored />} icon={TrendingUp} description="Sobra após custos (gestão)" />
            <AppStatCard title="Horas trabalhadas" value={`${totals.hours.toFixed(1)} h`} icon={Clock} />
            <AppStatCard title="Receita por hora" value={<AppMoney value={tractorRevenuePerHour} />} icon={Tractor} description="Média no período" />
            <AppStatCard title="Lucro por hora" value={<AppMoney value={tractorProfitPerHour} colored />} icon={TrendingUp} description="Média no período" />
            <AppStatCard title="A receber (clientes)" value={<AppMoney value={totalPending} />} icon={Users} description={totalOverdue > 0 ? 'Inclui valores em atraso' : 'Parcelas em aberto'} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Dica: se a <strong className="text-foreground">receita por hora</strong> estiver perto do{' '}
            <strong className="text-foreground">custo por hora</strong> ({fmt(tractorCostPerHour)}), a margem fica apertada.
          </p>
        </div>

        {showTractorRanking && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="typo-section-label mb-2">Tratores — precisa de atenção</h3>
              <ul className="space-y-2 text-sm">
                {worstTractors.map((t) => (
                  <li key={t.tractor_id ?? ''} className="flex justify-between gap-2">
                    <span className="font-medium">{t.tractor_name}</span>
                    <span className={cn(Number(t.net_margin) >= 0 ? 'text-green-700 dark:text-green-400' : 'text-destructive')}>
                      <AppMoney value={Number(t.net_margin)} size="sm" />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="typo-section-label mb-2">Tratores — melhor resultado</h3>
              <ul className="space-y-2 text-sm">
                {bestTractors.map((t) => (
                  <li key={t.tractor_id ?? ''} className="flex justify-between gap-2">
                    <span className="font-medium">{t.tractor_name}</span>
                    <span className="text-green-700 dark:text-green-400 font-medium">
                      <AppMoney value={Number(t.net_margin)} size="sm" />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>

      {/* ═══════════ Guinchos ═══════════ */}
      {trucks.length > 0 && (
        <section className="space-y-6">
          <div>
            <h2 className="typo-section-label mb-3">Situação geral — guinchos</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <AppStatCard title="Receita (período)" value={<AppMoney value={truckTotals.revenue} />} icon={DollarSign} />
              <AppStatCard title="Custos (período)" value={<AppMoney value={truckCostsTotal} />} icon={TrendingDown} description="Máquina + operacional + mão de obra" />
              <AppStatCard title="Lucro (período)" value={<AppMoney value={truckTotals.margin} colored />} icon={TrendingUp} description="Sobra após custos (gestão)" />
              <AppStatCard title="KM no período" value={`${truckTotals.km.toFixed(1)} km`} icon={Truck} />
              <AppStatCard title="Receita por km" value={<AppMoney value={truckRevenuePerKm} />} icon={Truck} description="Média no período" />
              <AppStatCard title="Lucro por km" value={<AppMoney value={truckProfitPerKm} colored />} icon={TrendingUp} description="Média no período" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Dica: se a <strong className="text-foreground">receita por km</strong> estiver perto do{' '}
              <strong className="text-foreground">custo por km</strong> ({fmt(truckCostPerKm)}), a margem fica apertada.
            </p>
          </div>

          {showTruckRanking && (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="typo-section-label mb-2">Guinchos — precisa de atenção</h3>
                <ul className="space-y-2 text-sm">
                  {worstTrucks.map((t) => (
                    <li key={t.truck_id ?? ''} className="flex justify-between gap-2">
                      <span className="font-medium">{t.truck_name}</span>
                      <span className={cn(Number(t.net_margin) >= 0 ? 'text-green-700 dark:text-green-400' : 'text-destructive')}>
                        <AppMoney value={Number(t.net_margin)} size="sm" />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="typo-section-label mb-2">Guinchos — melhor resultado</h3>
                <ul className="space-y-2 text-sm">
                  {bestTrucks.map((t) => (
                    <li key={t.truck_id ?? ''} className="flex justify-between gap-2">
                      <span className="font-medium">{t.truck_name}</span>
                      <span className="text-green-700 dark:text-green-400 font-medium">
                        <AppMoney value={Number(t.net_margin)} size="sm" />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ═══════════ Utilização da frota ═══════════ */}
      {availableHours !== null && (tractorsWithHours.length > 0 || trucksWithKm.length > 0) && (
        <section>
          <div className="flex items-center gap-2 mb-1">
            <Gauge className="h-4 w-4 text-primary" />
            <h2 className="typo-section-label">Utilização da frota</h2>
          </div>
          <p className="typo-caption text-muted-foreground mb-4">
            Benchmark: {'>'} 70% = boa · 50–70% = atenção · {'<'} 50% = baixa.
            Base: {availableHours.toLocaleString('pt-BR')} horas disponíveis no período
            (dias corridos × 8 h/dia por máquina).
          </p>
          <div className="space-y-2">
            {tractorsWithHours.map((t) => {
              const util = calcUtilization(Number(t.total_hours), availableHours)
              if (!util) return null
              return (
                <div key={t.tractor_id ?? ''} className={cn('rounded-lg border p-3', utilizationBgClass(util.status))}>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Tractor className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="font-medium text-sm truncate">{t.tractor_name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn('text-xs font-semibold', utilizationTextColor(util.status))}>
                        {utilizationLabel(util.status)}
                      </span>
                      <span className={cn('text-sm font-bold tabular-nums', utilizationTextColor(util.status))}>
                        {util.pct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-500', utilizationBarColor(util.status))}
                      style={{ width: `${Math.min(util.pct, 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {util.worked.toFixed(1)} h trabalhadas / {util.available.toLocaleString('pt-BR')} h disponíveis
                    {util.status === 'critical' && (
                      <span className="ml-2 text-red-700 dark:text-red-400 font-medium">
                        — {(util.available - util.worked).toFixed(1)} h ociosas (receita potencial perdida:{' '}
                        {fmt((util.available - util.worked) * Number(t.revenue_per_hour))})
                      </span>
                    )}
                  </p>
                </div>
              )
            })}
            {trucksWithKm.map((t) => {
              const workedHours = Number(t.total_km) > 0
                ? Number(t.total_km) / 50  /* aprox. 50 km/h médio para estimar horas */
                : 0
              const util = calcUtilization(workedHours, availableHours)
              if (!util) return null
              return (
                <div key={t.truck_id ?? ''} className={cn('rounded-lg border p-3', utilizationBgClass(util.status))}>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Truck className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="font-medium text-sm truncate">{t.truck_name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn('text-xs font-semibold', utilizationTextColor(util.status))}>
                        {utilizationLabel(util.status)}
                      </span>
                      <span className={cn('text-sm font-bold tabular-nums', utilizationTextColor(util.status))}>
                        {util.pct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-500', utilizationBarColor(util.status))}
                      style={{ width: `${Math.min(util.pct, 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {Number(t.total_km).toFixed(1)} km registados no período
                  </p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ═══════════ Semáforo de tarifas ═══════════ */}
      {(tractorRates.length > 0 || truckRates.length > 0) && (
        <section>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className={cn('h-4 w-4', hasRateAlerts ? 'text-amber-500' : 'text-green-500')} />
            <h2 className="typo-section-label">Tarifa mínima viável</h2>
          </div>
          <p className="typo-caption text-muted-foreground mb-4">
            A tarifa mínima viável é o custo por hora/km — abaixo dela o serviço dá prejuízo gerencial.
            Margem de segurança {'<'} 15% = atenção; abaixo do custo = crítico.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tractorRates.map(({ name, mvr }) => (
              <div key={name ?? ''} className={cn('rounded-lg border p-3', minViableRateBgClass(mvr.status))}>
                <div className="flex items-center gap-1.5 mb-2">
                  <Tractor className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="font-medium text-sm truncate">{name}</span>
                </div>
                <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2 sm:gap-x-3">
                  <div>
                    <p className="text-muted-foreground">Mínima (custo/h)</p>
                    <p className="font-semibold text-foreground tabular-nums">{fmt(mvr.minRate)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cobrado (receita/h)</p>
                    <p className="font-semibold tabular-nums">{fmt(mvr.currentRate)}</p>
                  </div>
                </div>
                <div className={cn('mt-2 text-xs font-semibold', minViableRateTextColor(mvr.status))}>
                  {mvr.status === 'ok'
                    ? `Margem de segurança: ${mvr.safetyPct.toFixed(1)}% ✓`
                    : mvr.status === 'warning'
                      ? `⚠ Margem baixa: ${mvr.safetyPct.toFixed(1)}%`
                      : `✗ Abaixo do custo — prejuízo gerencial`}
                </div>
              </div>
            ))}
            {truckRates.map(({ name, mvr }) => (
              <div key={name ?? ''} className={cn('rounded-lg border p-3', minViableRateBgClass(mvr.status))}>
                <div className="flex items-center gap-1.5 mb-2">
                  <Truck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="font-medium text-sm truncate">{name}</span>
                </div>
                <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2 sm:gap-x-3">
                  <div>
                    <p className="text-muted-foreground">Mínima (custo/km)</p>
                    <p className="font-semibold text-foreground tabular-nums">{fmt(mvr.minRate)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cobrado (receita/km)</p>
                    <p className="font-semibold tabular-nums">{fmt(mvr.currentRate)}</p>
                  </div>
                </div>
                <div className={cn('mt-2 text-xs font-semibold', minViableRateTextColor(mvr.status))}>
                  {mvr.status === 'ok'
                    ? `Margem de segurança: ${mvr.safetyPct.toFixed(1)}% ✓`
                    : mvr.status === 'warning'
                      ? `⚠ Margem baixa: ${mvr.safetyPct.toFixed(1)}%`
                      : `✗ Abaixo do custo — prejuízo gerencial`}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════ Gráfico de gastos ═══════════ */}
      {fleetSpendError ? (
        <p className="typo-body text-destructive rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-3">
          Não foi possível carregar o gráfico de gastos. Tente novamente em instantes.
        </p>
      ) : (
        <FleetSpendCategoryChart row={fleetSpend} isLoading={fleetSpendLoading} />
      )}

      {/* ═══════════ Clientes ═══════════ */}
      <section>
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

        {!billedClients.length ? (
          <AppEmptyState title="Sem dados de clientes" description="Não há faturamento no período." />
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-sm">
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
                  {billedClients.map((c) => {
                    const billed    = Number(c.total_billed)
                    const received  = Number(c.total_received)
                    const pending   = Number(c.total_pending)
                    const overdue   = Number(c.total_overdue)
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
                                  {' '}vencido
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
      </section>
    </div>
  )
}
