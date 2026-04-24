import { AppDataCard } from '@/shared/components/app/app-data-card'
import { AppMoney } from '@/shared/components/app/app-money'
import { AppBadge } from '@/shared/components/app/app-badge'
import { Tractor, Target, Info, Gauge } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import type { TractorProfitabilityRow } from '../services/profitability.repository'
import {
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
  t: TractorProfitabilityRow
  availableHours: number | null
}

export const ProfitabilityTractorProCard = ({ t, availableHours }: Props) => {
  const margin        = Number(t.net_margin)
  const revenue       = Number(t.gross_revenue)
  const cph           = Number(t.cost_per_hour)
  const revPerHour    = Number(t.revenue_per_hour)
  const totalHours    = Number(t.total_hours)
  const marginPercent = revenue > 0 ? (margin / revenue) * 100 : 0

  /* DRE */
  const dre = calcDRE(revenue, Number(t.operational_cost), Number(t.operator_cost), Number(t.depreciation_cost))

  /* Utilização */
  const util = calcUtilization(totalHours, availableHours)

  /* Tarifa mínima viável */
  const mvr = totalHours > 0 ? calcMinViableRate(revPerHour, cph) : null

  /* Payback */
  const purchaseValue  = Number(t.purchase_value ?? 0)
  const residualValue  = Number(t.residual_value ?? 0)
  const depreciableBase = Math.max(0, purchaseValue - residualValue)
  const recovered      = Math.max(0, margin)
  const recoveryPct    = depreciableBase > 0 ? Math.min((recovered / depreciableBase) * 100, 100) : 0
  const remaining      = Math.max(0, depreciableBase - recovered)
  const spreadPerHour  = revPerHour - cph
  const hoursToPayback = spreadPerHour > 0 && remaining > 0 ? Math.ceil(remaining / spreadPerHour) : null

  return (
    <AppDataCard
      title={t.tractor_name || 'Desconhecido'}
      subtitle="Detalhe gerencial (trator)"
      icon={Tractor}
      iconVariant={margin >= 0 ? 'success' : 'destructive'}
      badge={
        <AppBadge variant={margin >= 0 ? 'success' : 'destructive'}>
          {marginPercent.toFixed(1)}%
        </AppBadge>
      }
      items={[
        { label: 'Horas trabalhadas', value: `${totalHours.toFixed(1)}h` },
        { label: 'Receita bruta (faturado)', value: <AppMoney value={revenue} size="sm" /> },
        { label: 'Custo máquina (depreciação)', value: <AppMoney value={Number(t.depreciation_cost)} size="sm" /> },
        { label: 'Custo operacional', value: <AppMoney value={Number(t.operational_cost)} size="sm" /> },
        { label: 'Mão de obra', value: <AppMoney value={Number(t.operator_cost)} size="sm" /> },
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

          {/* Utilização */}
          {util !== null && (
            <div className={cn('rounded-lg border p-3 space-y-2', utilizationBgClass(util.status))}>
              <div className="flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  Utilização no período
                </p>
                <span className={cn('ml-auto text-xs font-bold tabular-nums', utilizationTextColor(util.status))}>
                  {util.pct.toFixed(1)}% — {utilizationLabel(util.status)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', utilizationBarColor(util.status))}
                  style={{ width: `${Math.min(util.pct, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                {util.worked.toFixed(1)} h trabalhadas / {util.available.toLocaleString('pt-BR')} h disponíveis
              </p>
              {util.status === 'critical' && revPerHour > 0 && (
                <p className="text-[10px] font-semibold text-red-700 dark:text-red-400">
                  Receita potencial não realizada: {fmt((util.available - util.worked) * revPerHour)}
                </p>
              )}
            </div>
          )}

          {/* Análise por hora + tarifa mínima viável */}
          {totalHours > 0 && mvr !== null && (
            <div
              className={cn(
                'rounded-lg p-3 space-y-2',
                mvr.status === 'ok'
                  ? 'bg-green-100 border border-green-200 dark:bg-green-500/10 dark:border-green-500/25'
                  : mvr.status === 'warning'
                    ? 'bg-amber-50 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20'
                    : 'bg-destructive/8 border border-destructive/20',
              )}
            >
              <p className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-900 dark:text-zinc-100">
                <span>Análise por hora trabalhada</span>
                <Info className="h-3.5 w-3.5 text-slate-700 dark:text-zinc-300 shrink-0" aria-hidden />
              </p>
              <div className="grid grid-cols-1 gap-2 text-center sm:grid-cols-3">
                <div title="Receita por hora: faturamento ÷ horas no período.">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-800 dark:text-zinc-200">Receita/h</p>
                  <p className="text-sm font-bold tabular-nums">
                    <AppMoney
                      value={revPerHour}
                      size="sm"
                      className={cn('font-semibold', mvr.status !== 'critical' ? 'text-emerald-950 dark:text-green-300' : 'text-red-800 dark:text-red-400')}
                    />
                  </p>
                </div>
                <div title="CPH: custo total por hora (depreciação + operacional + mão de obra).">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-800 dark:text-zinc-200">CPH (mínima)</p>
                  <p className="text-sm font-bold tabular-nums">
                    <AppMoney value={cph} size="sm" className="font-semibold text-slate-950 dark:text-zinc-50" />
                  </p>
                </div>
                <div title="Spread/h: receita/h − CPH.">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-800 dark:text-zinc-200">Spread/h</p>
                  <p className="text-sm font-bold tabular-nums">
                    <AppMoney
                      value={spreadPerHour}
                      size="sm"
                      className={cn('font-semibold', mvr.status !== 'critical' ? 'text-emerald-950 dark:text-green-300' : 'text-red-800 dark:text-red-400')}
                    />
                  </p>
                </div>
              </div>
              <p className={cn(
                'text-xs font-semibold leading-snug',
                mvr.status === 'ok'       ? 'text-emerald-950 dark:text-green-100'
                  : mvr.status === 'warning' ? 'text-amber-800 dark:text-amber-200'
                    : 'text-destructive',
              )}>
                {mvr.status === 'ok'
                  ? `Cada hora gera ${fmt(spreadPerHour)} de lucro. Margem: ${mvr.safetyPct.toFixed(1)}% acima do custo.`
                  : mvr.status === 'warning'
                    ? `⚠ Margem de segurança baixa (${mvr.safetyPct.toFixed(1)}%) — reavalie a tarifa.`
                    : '✗ Receita/h abaixo do custo — reavalie o preço cobrado.'}
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
                margin >= 0 ? 'bg-green-600 dark:bg-green-500 shadow-sm' : 'bg-red-600 dark:bg-red-500',
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
                  <span className="ml-auto text-[10px] font-bold text-green-800 dark:text-green-400 uppercase tracking-wide">
                    Meta atingida
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground leading-snug">
                Base depreciável: <AppMoney value={depreciableBase} size="sm" /> (compra − residual).
              </p>
              {depreciableBase > 0 && (
                <>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Recuperado: <span className="font-semibold text-foreground">{recoveryPct.toFixed(1)}%</span></span>
                      <span><AppMoney value={recovered} size="sm" /> / <AppMoney value={depreciableBase} size="sm" /></span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-700',
                          recoveryPct >= 100 ? 'bg-green-600 dark:bg-green-500'
                            : recoveryPct >= 50 ? 'bg-blue-600 dark:bg-blue-500'
                              : 'bg-amber-600 dark:bg-amber-500',
                        )}
                        style={{ width: `${recoveryPct}%` }}
                      />
                    </div>
                  </div>
                  {recoveryPct < 100 ? (
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] text-muted-foreground">Falta cobrir</p>
                        <p className="text-sm font-bold tabular-nums text-amber-800 dark:text-amber-400">
                          <AppMoney value={remaining} size="sm" />
                        </p>
                      </div>
                      {hoursToPayback !== null ? (
                        <div className="text-right">
                          <p className="text-[10px] text-muted-foreground">Projeção (se mantiver spread)</p>
                          <p className="text-xs font-semibold text-muted-foreground">~{hoursToPayback.toLocaleString('pt-BR')}h</p>
                        </div>
                      ) : (
                        <p className="text-[10px] text-destructive font-medium max-w-[140px] text-right leading-tight">
                          Melhore o spread/h para viabilizar a recuperação
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-green-800 dark:text-green-400 font-medium">
                      Base depreciável coberta pelo lucro gerencial acumulado no período.
                    </p>
                  )}
                </>
              )}
              {residualValue > 0 && (
                <p className="text-[10px] text-muted-foreground/70 leading-tight border-t border-border/40 pt-1.5">
                  Na revenda, espera-se recuperar mais{' '}
                  <span className="font-semibold text-muted-foreground"><AppMoney value={residualValue} size="sm" /></span>{' '}
                  pelo valor residual.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    />
  )
}
