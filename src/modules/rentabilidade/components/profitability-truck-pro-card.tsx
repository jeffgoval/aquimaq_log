import { AppDataCard } from '@/shared/components/app/app-data-card'
import { AppMoney } from '@/shared/components/app/app-money'
import { AppBadge } from '@/shared/components/app/app-badge'
import { Truck, Target, Info, Gauge } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import type { TruckProfitabilityRow } from '@/integrations/supabase/db-types'
import {
  calcDRE,
  calcMinViableRate,
  minViableRateBgClass,
  minViableRateTextColor,
} from '../lib/profitability-calc'

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

interface Props {
  t: TruckProfitabilityRow
  availableHours: number | null
}

export const ProfitabilityTruckProCard = ({ t }: Props) => {
  const margin        = Number(t.net_margin)
  const revenue       = Number(t.gross_revenue)
  const cpk           = Number(t.cost_per_km)
  const revPerKm      = Number(t.revenue_per_km)
  const totalKm       = Number(t.total_km)
  const marginPercent = revenue > 0 ? (margin / revenue) * 100 : 0

  /* DRE */
  const dre = calcDRE(revenue, Number(t.operational_cost), Number(t.operator_cost), Number(t.depreciation_cost))

  /* Tarifa mínima viável por km */
  const mvr = totalKm > 0 ? calcMinViableRate(revPerKm, cpk) : null

  /* Payback */
  const purchaseValue   = Number(t.purchase_value)
  const residualValue   = Number(t.residual_value)
  const depreciableBase = Math.max(0, purchaseValue - residualValue)
  const recovered       = Math.max(0, margin)
  const recoveryPct     = depreciableBase > 0 ? Math.min((recovered / depreciableBase) * 100, 100) : 0
  const remaining       = Math.max(0, depreciableBase - recovered)
  const spreadPerKm     = revPerKm - cpk
  const kmToPayback     = spreadPerKm > 0 && remaining > 0 ? Math.ceil(remaining / spreadPerKm) : null

  return (
    <AppDataCard
      title={t.truck_name || 'Guincho'}
      subtitle="Detalhe gerencial (guincho)"
      icon={Truck}
      iconVariant={margin >= 0 ? 'success' : 'destructive'}
      badge={
        <AppBadge variant={margin >= 0 ? 'success' : 'destructive'}>
          {marginPercent.toFixed(1)}%
        </AppBadge>
      }
      items={[
        { label: 'KM registados (período)',    value: `${totalKm.toFixed(1)} km` },
        { label: 'Receita bruta (faturado)',   value: <AppMoney value={revenue} size="sm" /> },
        { label: 'Depreciação gerencial (km)', value: <AppMoney value={Number(t.depreciation_cost)} size="sm" /> },
        { label: 'Custo operacional',          value: <AppMoney value={Number(t.operational_cost)} size="sm" /> },
        { label: 'Mão de obra',                value: <AppMoney value={Number(t.operator_cost)} size="sm" /> },
      ]}
      footer={(
        <div className="space-y-3 pt-2 border-t border-border/50">

          {/* DRE section */}
          {revenue > 0 && (
            <div className="rounded-lg border border-border/60 bg-muted/10 p-3 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">DRE por máquina</p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Receita Bruta</span>
                  <span className="font-semibold tabular-nums"><AppMoney value={dre.grossRevenue} size="sm" /></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">(-) Custos Variáveis</span>
                  <span className="tabular-nums text-muted-foreground"><AppMoney value={dre.variableCost} size="sm" /></span>
                </div>
                <div className="flex justify-between border-t border-border/40 pt-1.5">
                  <span className="font-semibold text-foreground">= Marg. Contribuição</span>
                  <span className={cn('font-bold tabular-nums', dre.contributionMargin >= 0 ? 'text-green-700 dark:text-green-400' : 'text-destructive')}>
                    <AppMoney value={dre.contributionMargin} size="sm" />
                    <span className="ml-1 text-[10px] font-normal text-muted-foreground">
                      ({dre.contributionMarginPct.toFixed(1)}%)
                    </span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">(-) Depr. Gerencial</span>
                  <span className="tabular-nums text-muted-foreground"><AppMoney value={dre.capitalCost} size="sm" /></span>
                </div>
                <div className="flex justify-between border-t border-border/40 pt-1.5">
                  <span className="font-bold text-foreground">= Resultado Op.</span>
                  <span className={cn('font-bold tabular-nums', dre.operatingResult >= 0 ? 'text-green-700 dark:text-green-400' : 'text-destructive')}>
                    <AppMoney value={dre.operatingResult} size="sm" />
                    <span className="ml-1 text-[10px] font-normal text-muted-foreground">
                      ({dre.operatingResultPct.toFixed(1)}%)
                    </span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Análise por km + tarifa mínima viável */}
          {totalKm > 0 && mvr !== null && (
            <div className={cn('rounded-lg p-3 space-y-2', minViableRateBgClass(mvr.status))}>
              <p className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <span>Análise por km rodado</span>
                <Info className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" aria-hidden />
              </p>
              <div className="grid grid-cols-1 gap-2 text-center sm:grid-cols-3">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Receita/km</p>
                  <p className={cn('text-sm font-bold tabular-nums', minViableRateTextColor(mvr.status))}>
                    <AppMoney value={revPerKm} size="sm" />
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-800 dark:text-zinc-200">Custo/km</p>
                  <p className="text-sm font-bold tabular-nums">
                    <AppMoney value={cpk} size="sm" className="font-semibold text-slate-950 dark:text-zinc-50" />
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Spread/km</p>
                  <p className={cn('text-sm font-bold tabular-nums', minViableRateTextColor(mvr.status))}>
                    <AppMoney value={spreadPerKm} size="sm" />
                  </p>
                </div>
              </div>
              <p className={cn('text-xs font-medium', minViableRateTextColor(mvr.status))}>
                {mvr.status === 'ok'
                  ? `Cada km gera ${fmt(spreadPerKm)} de lucro. Margem: ${mvr.safetyPct.toFixed(1)}%.`
                  : mvr.status === 'warning'
                    ? `⚠ Margem baixa (${mvr.safetyPct.toFixed(1)}%) — reavalie preços ou reduza custos.`
                    : '✗ Receita/km abaixo do custo — prejuízo gerencial por km rodado.'}
              </p>
            </div>
          )}

          <div className="flex justify-between items-center bg-muted/20 p-2 rounded-lg">
            <div>
              <span className="typo-section-label">Margem líquida gerencial</span>
              <span className="text-xs text-muted-foreground ml-1">({marginPercent.toFixed(1)}% da receita)</span>
            </div>
            <AppMoney value={margin} colored size="sm" />
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                margin >= 0 ? 'bg-green-600 dark:bg-green-500' : 'bg-red-600 dark:bg-red-500',
              )}
              style={{ width: `${Math.min(Math.abs(marginPercent), 100)}%` }}
            />
          </div>

          {/* Payback */}
          {purchaseValue > 0 && (
            <div className="rounded-lg border border-border/60 bg-muted/10 p-3 space-y-2">
              <div className="flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Recuperação do investimento
                </p>
                {depreciableBase > 0 && recoveryPct >= 100 && (
                  <span className="ml-auto text-[10px] font-bold text-green-800 dark:text-green-400 uppercase tracking-wide">Meta</span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground leading-snug">
                Base: <AppMoney value={depreciableBase} size="sm" /> (compra − residual).
              </p>
              {depreciableBase > 0 && (
                <>
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Recuperado: {recoveryPct.toFixed(1)}%</span>
                    <span><AppMoney value={recovered} size="sm" /> / <AppMoney value={depreciableBase} size="sm" /></span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        recoveryPct >= 100 ? 'bg-green-600' : recoveryPct >= 50 ? 'bg-blue-600' : 'bg-amber-600',
                      )}
                      style={{ width: `${recoveryPct}%` }}
                    />
                  </div>
                  {recoveryPct < 100 && kmToPayback !== null && (
                    <p className="text-[10px] text-muted-foreground">
                      Projeção: ~{kmToPayback.toLocaleString('pt-BR')} km adicionais (se mantiver spread/km).
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    />
  )
}
