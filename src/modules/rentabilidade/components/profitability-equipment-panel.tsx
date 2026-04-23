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
  Clock,
  Download,
  Gauge,
  BarChart3,
  ShieldAlert,
} from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import type { TractorProfitabilityRow } from '../services/profitability.repository'
import type { TruckProfitabilityRow } from '@/integrations/supabase/db-types'
import type { ProfitabilityDateRange } from '../services/profitability.repository'
import { tractorsToCsv, trucksToCsv, downloadUtf8Csv } from '../lib/profitability-export-csv'
import { ProfitabilityTractorProCard } from './profitability-tractor-pro-card'
import { ProfitabilityTruckProCard } from './profitability-truck-pro-card'
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

/* ═══════════════════════════════════════════════════════════════════
   Aba "Tratores" — análise por máquina (horas / CPH)
   ═══════════════════════════════════════════════════════════════════ */

interface TractorProps {
  tractors: TractorProfitabilityRow[]
  exportSlug: string
  range: ProfitabilityDateRange
}

export const ProfitabilityTractorPanel = ({ tractors, exportSlug, range }: TractorProps) => {
  const totals = tractors.reduce(
    (acc, t) => ({
      revenue:      acc.revenue      + Number(t.gross_revenue),
      depreciation: acc.depreciation + Number(t.depreciation_cost),
      operational:  acc.operational  + Number(t.operational_cost),
      operatorCost: acc.operatorCost + Number(t.operator_cost),
      margin:       acc.margin       + Number(t.net_margin),
      hours:        acc.hours        + Number(t.total_hours),
    }),
    { revenue: 0, depreciation: 0, operational: 0, operatorCost: 0, margin: 0, hours: 0 },
  )

  const fleetCph = totals.hours > 0
    ? (totals.depreciation + totals.operational + totals.operatorCost) / totals.hours
    : 0
  const fleetRevPerHour = totals.hours > 0 ? totals.revenue / totals.hours : 0
  const fleetDRE = calcDRE(totals.revenue, totals.operational, totals.operatorCost, totals.depreciation)
  const availableHours = calcAvailableHours(range.from, range.to)

  /* Semáforo de tarifas */
  const rateItems = tractors
    .filter((t) => Number(t.total_hours) > 0)
    .map((t) => ({
      id: t.tractor_id ?? '',
      name: t.tractor_name,
      mvr: calcMinViableRate(Number(t.revenue_per_hour), Number(t.cost_per_hour)),
    }))
    .sort((a, b) => a.mvr.safetyPct - b.mvr.safetyPct)

  return (
    <div className="space-y-8">
      {/* Legenda */}
      <details className="rounded-xl border border-border bg-card p-4 group">
        <summary className="cursor-pointer text-sm font-semibold text-foreground list-none flex items-center justify-between">
          Como ler estes números — tratores
          <span className="text-muted-foreground text-xs font-normal group-open:hidden">Abrir</span>
          <span className="text-muted-foreground text-xs font-normal hidden group-open:inline">Fechar</span>
        </summary>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc pl-5">
          <li><strong className="text-foreground">Período:</strong> data do serviço (receita e horas); data do lançamento (custos).</li>
          <li><strong className="text-foreground">Custos variáveis:</strong> combustível, peças, manutenção e mão de obra operacional.</li>
          <li><strong className="text-foreground">Margem de contribuição:</strong> receita menos custos variáveis — o quanto cada hora contribui antes da depreciação.</li>
          <li><strong className="text-foreground">Depreciação gerencial:</strong> rateio do ativo (compra − residual) pela vida útil em horas.</li>
          <li><strong className="text-foreground">Resultado operacional:</strong> margem de contribuição menos depreciação gerencial.</li>
        </ul>
      </details>

      {/* Fleet KPIs */}
      {(totals.hours > 0 || totals.revenue > 0) && (
        <div>
          <h2 className="typo-section-label mb-3">Frota tratores — indicadores</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <AppStatCard title="Receita bruta"    value={<AppMoney value={totals.revenue} />} icon={DollarSign} />
            <AppStatCard title="Custos totais"    value={<AppMoney value={totals.depreciation + totals.operational + totals.operatorCost} />} icon={TrendingDown} description="Máquina + operacional + mão de obra" />
            <AppStatCard title="Mão de obra"      value={<AppMoney value={totals.operatorCost} />} icon={Tractor} />
            <AppStatCard title="Margem líquida"   value={<AppMoney value={totals.margin} colored />} icon={TrendingUp} />
            <AppStatCard title="Horas totais"     value={`${totals.hours.toFixed(1)}h`} icon={Clock} />
            <AppStatCard
              title="Custo por hora"
              value={<AppMoney value={fleetCph} />}
              icon={Tractor}
              description={`Receita/h: ${fmt(fleetRevPerHour)}`}
            />
          </div>
        </div>
      )}

      {/* DRE da frota de tratores */}
      {totals.revenue > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h2 className="typo-section-label">DRE — frota tratores</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-4 space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Receita Bruta</p>
              <p className="text-xl font-bold tabular-nums"><AppMoney value={fleetDRE.grossRevenue} /></p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Margem de Contribuição</p>
              <p className="text-xl font-bold tabular-nums">
                <span className={fleetDRE.contributionMargin >= 0 ? 'text-green-700 dark:text-green-400' : 'text-destructive'}>
                  <AppMoney value={fleetDRE.contributionMargin} />
                </span>
              </p>
              <p className="text-xs text-muted-foreground">{fleetDRE.contributionMarginPct.toFixed(1)}% da receita</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Depr. Gerencial</p>
              <p className="text-xl font-bold tabular-nums text-muted-foreground">
                <AppMoney value={fleetDRE.capitalCost} />
              </p>
            </div>
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-1">
              <p className="text-xs text-primary uppercase tracking-wide font-semibold">Resultado Operacional</p>
              <p className="text-xl font-bold tabular-nums">
                <span className={fleetDRE.operatingResult >= 0 ? 'text-green-700 dark:text-green-400' : 'text-destructive'}>
                  <AppMoney value={fleetDRE.operatingResult} />
                </span>
              </p>
              <p className="text-xs text-muted-foreground">{fleetDRE.operatingResultPct.toFixed(1)}% da receita</p>
            </div>
          </div>
        </section>
      )}

      {/* Utilização */}
      {availableHours !== null && tractors.some((t) => Number(t.total_hours) > 0) && (
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Gauge className="h-4 w-4 text-primary" />
            <h2 className="typo-section-label">Utilização no período</h2>
          </div>
          <p className="typo-caption text-muted-foreground mb-3">
            Base: {availableHours.toLocaleString('pt-BR')} h disponíveis por máquina (dias corridos × 8 h).
          </p>
          <div className="space-y-2">
            {tractors
              .filter((t) => Number(t.total_hours) > 0)
              .map((t) => {
                const util = calcUtilization(Number(t.total_hours), availableHours)
                if (!util) return null
                return (
                  <div key={t.tractor_id ?? ''} className={cn('rounded-lg border p-3', utilizationBgClass(util.status))}>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-medium text-sm">{t.tractor_name}</span>
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
                      {util.worked.toFixed(1)} h / {util.available.toLocaleString('pt-BR')} h
                      {util.status === 'critical' && (
                        <span className="ml-2 font-medium text-red-700 dark:text-red-400">
                          — Ocioso: {(util.available - util.worked).toFixed(1)} h
                          (oportunidade: {fmt((util.available - util.worked) * Number(t.revenue_per_hour))})
                        </span>
                      )}
                    </p>
                  </div>
                )
              })}
          </div>
        </section>
      )}

      {/* Semáforo de tarifas */}
      {rateItems.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className={cn('h-4 w-4', rateItems.some((r) => r.mvr.status !== 'ok') ? 'text-amber-500' : 'text-green-500')} />
            <h2 className="typo-section-label">Ponto de equilíbrio por máquina</h2>
          </div>
          <p className="typo-caption text-muted-foreground mb-3">
            A tarifa cobrada precisa superar o custo/h em pelo menos 15% para ter margem de segurança.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rateItems.map(({ id, name, mvr }) => (
              <div key={id} className={cn('rounded-lg border p-3', minViableRateBgClass(mvr.status))}>
                <p className="font-medium text-sm mb-2 truncate">{name}</p>
                <div className="grid grid-cols-2 gap-x-3 text-xs mb-2">
                  <div>
                    <p className="text-muted-foreground">Mínima (custo/h)</p>
                    <p className="font-bold tabular-nums">{fmt(mvr.minRate)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cobrado (receita/h)</p>
                    <p className="font-bold tabular-nums">{fmt(mvr.currentRate)}</p>
                  </div>
                </div>
                <div className={cn('text-xs font-semibold', minViableRateTextColor(mvr.status))}>
                  {mvr.status === 'ok'     && `✓ Margem: ${mvr.safetyPct.toFixed(1)}%`}
                  {mvr.status === 'warning' && `⚠ Margem baixa: ${mvr.safetyPct.toFixed(1)}%`}
                  {mvr.status === 'critical' && `✗ Abaixo do custo`}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Export + table */}
      <div>
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
                  <th className="p-3 font-medium text-right whitespace-nowrap hidden lg:table-cell">Marg. Contr.</th>
                  <th className="p-3 font-medium text-right whitespace-nowrap">Resultado</th>
                  <th className="p-3 font-medium whitespace-nowrap hidden md:table-cell">%</th>
                  <th className="p-3 font-medium text-right whitespace-nowrap hidden xl:table-cell">Receita/h</th>
                  <th className="p-3 font-medium text-right whitespace-nowrap hidden xl:table-cell">Custo/h</th>
                  <th className="p-3 font-medium text-right whitespace-nowrap hidden xl:table-cell">Spread/h</th>
                </tr>
              </thead>
              <tbody>
                {tractors.map((t) => {
                  const revenue  = Number(t.gross_revenue)
                  const margin   = Number(t.net_margin)
                  const hours    = Number(t.total_hours)
                  const dre      = calcDRE(revenue, Number(t.operational_cost), Number(t.operator_cost), Number(t.depreciation_cost))
                  const pct      = revenue > 0 ? (margin / revenue) * 100 : 0
                  const revPerH  = Number(t.revenue_per_hour)
                  const cph      = Number(t.cost_per_hour)
                  const spread   = revPerH - cph
                  return (
                    <tr key={t.tractor_id ?? ''} className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="p-3 min-w-0">
                        <div className="font-medium text-foreground truncate">{t.tractor_name || '—'}</div>
                        <div className="text-xs text-muted-foreground lg:hidden truncate">
                          MC: {fmt(dre.contributionMargin)}
                        </div>
                      </td>
                      <td className="p-3 tabular-nums whitespace-nowrap">{hours.toFixed(1)}h</td>
                      <td className="p-3 text-right tabular-nums whitespace-nowrap"><AppMoney value={revenue} size="sm" /></td>
                      <td className="p-3 text-right tabular-nums whitespace-nowrap hidden lg:table-cell">
                        <span className={dre.contributionMargin >= 0 ? 'text-green-700 dark:text-green-400' : 'text-destructive'}>
                          <AppMoney value={dre.contributionMargin} size="sm" />
                        </span>
                        <span className="ml-1 text-xs text-muted-foreground">({dre.contributionMarginPct.toFixed(0)}%)</span>
                      </td>
                      <td className="p-3 text-right tabular-nums whitespace-nowrap"><AppMoney value={margin} size="sm" colored /></td>
                      <td className="p-3 tabular-nums whitespace-nowrap hidden md:table-cell">{pct.toFixed(1)}%</td>
                      <td className="p-3 text-right tabular-nums whitespace-nowrap hidden xl:table-cell"><AppMoney value={revPerH} size="sm" /></td>
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

      {/* Detail cards */}
      {tractors.length > 0 && (
        <div>
          <h2 className="typo-section-label mb-3">Detalhe por trator</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {tractors.map((t) => (
              <ProfitabilityTractorProCard key={t.tractor_id ?? ''} t={t} availableHours={availableHours} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Aba "Guinchos" — análise por máquina (km / CPK)
   ═══════════════════════════════════════════════════════════════════ */

interface TruckProps {
  trucks: TruckProfitabilityRow[]
  exportSlug: string
  range: ProfitabilityDateRange
}

export const ProfitabilityTruckPanel = ({ trucks, exportSlug, range }: TruckProps) => {
  const truckTotals = trucks.reduce(
    (acc, t) => ({
      revenue: acc.revenue + Number(t.gross_revenue),
      margin:  acc.margin  + Number(t.net_margin),
      km:      acc.km      + Number(t.total_km),
      dep:     acc.dep     + Number(t.depreciation_cost),
      op:      acc.op      + Number(t.operational_cost),
      mo:      acc.mo      + Number(t.operator_cost),
    }),
    { revenue: 0, margin: 0, km: 0, dep: 0, op: 0, mo: 0 },
  )
  const fleetCpk       = truckTotals.km > 0 ? (truckTotals.dep + truckTotals.op + truckTotals.mo) / truckTotals.km : 0
  const fleetRevPerKm  = truckTotals.km > 0 ? truckTotals.revenue / truckTotals.km : 0
  const fleetDRE       = calcDRE(truckTotals.revenue, truckTotals.op, truckTotals.mo, truckTotals.dep)
  const availableHours = calcAvailableHours(range.from, range.to)

  const rateItems = trucks
    .filter((t) => Number(t.total_km) > 0)
    .map((t) => ({
      id:   t.truck_id ?? '',
      name: t.truck_name,
      mvr:  calcMinViableRate(Number(t.revenue_per_km), Number(t.cost_per_km)),
    }))
    .sort((a, b) => a.mvr.safetyPct - b.mvr.safetyPct)

  return (
    <div className="space-y-8">
      {/* Legenda */}
      <details className="rounded-xl border border-border bg-card p-4 group">
        <summary className="cursor-pointer text-sm font-semibold text-foreground list-none flex items-center justify-between">
          Como ler estes números — guinchos
          <span className="text-muted-foreground text-xs font-normal group-open:hidden">Abrir</span>
          <span className="text-muted-foreground text-xs font-normal hidden group-open:inline">Fechar</span>
        </summary>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc pl-5">
          <li><strong className="text-foreground">Período:</strong> data do serviço (receita e km); data do lançamento (custos).</li>
          <li><strong className="text-foreground">Margem de contribuição:</strong> receita menos custos variáveis (combustível + mão de obra).</li>
          <li><strong className="text-foreground">Depreciação gerencial:</strong> rateio do ativo pela vida útil em km.</li>
          <li><strong className="text-foreground">Resultado operacional:</strong> margem de contribuição menos depreciação.</li>
        </ul>
      </details>

      {/* Fleet KPIs */}
      {trucks.length > 0 && (truckTotals.km > 0 || truckTotals.revenue > 0) && (
        <div>
          <h2 className="typo-section-label mb-3">Frota guinchos — indicadores</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <AppStatCard title="Receita bruta"  value={<AppMoney value={truckTotals.revenue} />} icon={DollarSign} />
            <AppStatCard title="Margem líquida" value={<AppMoney value={truckTotals.margin} colored />} icon={TrendingUp} />
            <AppStatCard title="KM no período"  value={`${truckTotals.km.toFixed(1)} km`} icon={Truck} />
            <AppStatCard
              title="Custo/km médio"
              value={<AppMoney value={fleetCpk} />}
              icon={Truck}
              description={`Receita/km: ${fmt(fleetRevPerKm)}`}
            />
          </div>
        </div>
      )}

      {/* DRE da frota de guinchos */}
      {truckTotals.revenue > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h2 className="typo-section-label">DRE — frota guinchos</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-4 space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Receita Bruta</p>
              <p className="text-xl font-bold tabular-nums"><AppMoney value={fleetDRE.grossRevenue} /></p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Margem de Contribuição</p>
              <p className="text-xl font-bold tabular-nums">
                <span className={fleetDRE.contributionMargin >= 0 ? 'text-green-700 dark:text-green-400' : 'text-destructive'}>
                  <AppMoney value={fleetDRE.contributionMargin} />
                </span>
              </p>
              <p className="text-xs text-muted-foreground">{fleetDRE.contributionMarginPct.toFixed(1)}% da receita</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Depr. Gerencial</p>
              <p className="text-xl font-bold tabular-nums text-muted-foreground">
                <AppMoney value={fleetDRE.capitalCost} />
              </p>
            </div>
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-1">
              <p className="text-xs text-primary uppercase tracking-wide font-semibold">Resultado Operacional</p>
              <p className="text-xl font-bold tabular-nums">
                <span className={fleetDRE.operatingResult >= 0 ? 'text-green-700 dark:text-green-400' : 'text-destructive'}>
                  <AppMoney value={fleetDRE.operatingResult} />
                </span>
              </p>
              <p className="text-xs text-muted-foreground">{fleetDRE.operatingResultPct.toFixed(1)}% da receita</p>
            </div>
          </div>
        </section>
      )}

      {/* Ponto de equilíbrio por guincho */}
      {rateItems.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className={cn('h-4 w-4', rateItems.some((r) => r.mvr.status !== 'ok') ? 'text-amber-500' : 'text-green-500')} />
            <h2 className="typo-section-label">Ponto de equilíbrio por guincho</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rateItems.map(({ id, name, mvr }) => (
              <div key={id} className={cn('rounded-lg border p-3', minViableRateBgClass(mvr.status))}>
                <p className="font-medium text-sm mb-2 truncate">{name}</p>
                <div className="grid grid-cols-2 gap-x-3 text-xs mb-2">
                  <div>
                    <p className="text-muted-foreground">Mínima (custo/km)</p>
                    <p className="font-bold tabular-nums">{fmt(mvr.minRate)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cobrado (receita/km)</p>
                    <p className="font-bold tabular-nums">{fmt(mvr.currentRate)}</p>
                  </div>
                </div>
                <div className={cn('text-xs font-semibold', minViableRateTextColor(mvr.status))}>
                  {mvr.status === 'ok'      && `✓ Margem: ${mvr.safetyPct.toFixed(1)}%`}
                  {mvr.status === 'warning'  && `⚠ Margem baixa: ${mvr.safetyPct.toFixed(1)}%`}
                  {mvr.status === 'critical' && `✗ Abaixo do custo`}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Export + table */}
      <div>
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
                  <th className="p-3 font-medium text-right whitespace-nowrap hidden lg:table-cell">Marg. Contr.</th>
                  <th className="p-3 font-medium text-right whitespace-nowrap">Resultado</th>
                  <th className="p-3 font-medium whitespace-nowrap hidden md:table-cell">%</th>
                  <th className="p-3 font-medium text-right whitespace-nowrap hidden xl:table-cell">Receita/km</th>
                  <th className="p-3 font-medium text-right whitespace-nowrap hidden xl:table-cell">Custo/km</th>
                  <th className="p-3 font-medium text-right whitespace-nowrap hidden xl:table-cell">Spread/km</th>
                </tr>
              </thead>
              <tbody>
                {trucks.map((t) => {
                  const revenue  = Number(t.gross_revenue)
                  const margin   = Number(t.net_margin)
                  const km       = Number(t.total_km)
                  const dre      = calcDRE(revenue, Number(t.operational_cost), Number(t.operator_cost), Number(t.depreciation_cost))
                  const pct      = revenue > 0 ? (margin / revenue) * 100 : 0
                  const revPerKm = Number(t.revenue_per_km)
                  const cpk      = Number(t.cost_per_km)
                  const spread   = revPerKm - cpk
                  return (
                    <tr key={t.truck_id ?? ''} className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="p-3 min-w-0">
                        <div className="font-medium text-foreground truncate">{t.truck_name || '—'}</div>
                        <div className="text-xs text-muted-foreground lg:hidden truncate">
                          MC: {fmt(dre.contributionMargin)}
                        </div>
                      </td>
                      <td className="p-3 tabular-nums whitespace-nowrap">{km.toFixed(1)} km</td>
                      <td className="p-3 text-right tabular-nums whitespace-nowrap"><AppMoney value={revenue} size="sm" /></td>
                      <td className="p-3 text-right tabular-nums whitespace-nowrap hidden lg:table-cell">
                        <span className={dre.contributionMargin >= 0 ? 'text-green-700 dark:text-green-400' : 'text-destructive'}>
                          <AppMoney value={dre.contributionMargin} size="sm" />
                        </span>
                        <span className="ml-1 text-xs text-muted-foreground">({dre.contributionMarginPct.toFixed(0)}%)</span>
                      </td>
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

      {/* Detail cards */}
      {trucks.length > 0 && (
        <div>
          <h2 className="typo-section-label mb-3">Detalhe por guincho</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {trucks.map((t) => (
              <ProfitabilityTruckProCard key={t.truck_id ?? ''} t={t} availableHours={availableHours} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
