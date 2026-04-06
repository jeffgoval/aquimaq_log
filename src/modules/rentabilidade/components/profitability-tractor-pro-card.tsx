import { AppDataCard } from '@/shared/components/app/app-data-card'
import { AppMoney } from '@/shared/components/app/app-money'
import { AppBadge } from '@/shared/components/app/app-badge'
import { Tractor, Target, Info } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import type { TractorProfitabilityRow } from '../services/profitability.repository'

interface Props {
  t: TractorProfitabilityRow
}

export const ProfitabilityTractorProCard = ({ t }: Props) => {
  const margin = Number(t.net_margin)
  const revenue = Number(t.gross_revenue)
  const cph = Number(t.cost_per_hour)
  const revPerHour = Number(t.revenue_per_hour)
  const marginPercent = revenue > 0 ? (margin / revenue) * 100 : 0
  const isCphOk = revPerHour >= cph

  const purchaseValue = Number(t.purchase_value ?? 0)
  const residualValue = Number(t.residual_value ?? 0)
  const depreciableBase = Math.max(0, purchaseValue - residualValue)
  const recovered = Math.max(0, margin)
  const recoveryPct = depreciableBase > 0 ? Math.min((recovered / depreciableBase) * 100, 100) : 0
  const remaining = Math.max(0, depreciableBase - recovered)
  const spreadPerHour = revPerHour - cph
  const hoursToPayback = spreadPerHour > 0 && remaining > 0 ? Math.ceil(remaining / spreadPerHour) : null

  return (
    <AppDataCard
      title={t.tractor_name || 'Desconhecido'}
      subtitle="Detalhe gerencial (trator)"
      icon={Tractor}
      iconVariant={margin >= 0 ? 'success' : 'destructive'}
      badge={
        <AppBadge variant={margin >= 0 ? 'success' : 'destructive'}>
          {marginPercent.toFixed(1)}
          %
        </AppBadge>
      }
      items={[
        {
          label: 'Horas trabalhadas',
          value: `${Number(t.total_hours).toFixed(1)}h`,
        },
        {
          label: 'Receita bruta (faturado)',
          value: <AppMoney value={revenue} size="sm" />,
        },
        {
          label: 'Custo máquina / horas (repartição)',
          value: <AppMoney value={Number(t.depreciation_cost)} size="sm" />,
        },
        {
          label: 'Custo operacional',
          value: <AppMoney value={Number(t.operational_cost)} size="sm" />,
        },
        {
          label: 'Mão de obra',
          value: <AppMoney value={Number(t.operator_cost)} size="sm" />,
        },
      ]}
      footer={(
        <div className="space-y-3 pt-2 border-t border-border/50">
          {Number(t.total_hours) > 0 && (
            <div
              className={cn(
                'rounded-lg p-3 space-y-2',
                isCphOk
                  ? 'bg-green-100 border border-green-200 dark:bg-green-500/10 dark:border-green-500/25'
                  : 'bg-destructive/8 border border-destructive/20',
              )}
            >
              <p className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-900 dark:text-zinc-100">
                <span>Análise por hora trabalhada</span>
                <span
                  className="inline-flex shrink-0"
                  title="Receita/h, CPH (custo por hora) e spread/h. Ver glossário na aba Detalhes."
                >
                  <Info className="h-3.5 w-3.5 text-slate-700 dark:text-zinc-300" aria-hidden />
                </span>
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div
                  className="min-w-0 rounded-md px-0.5 py-0.5"
                  title="Receita por hora: faturamento do trator ÷ horas no período."
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-800 dark:text-zinc-200">
                    Receita/h
                  </p>
                  <p className="text-sm font-bold tabular-nums">
                    <AppMoney
                      value={revPerHour}
                      size="sm"
                      className={cn(
                        'font-semibold',
                        isCphOk ? 'text-emerald-950 dark:text-green-300' : 'text-red-800 dark:text-red-400',
                      )}
                    />
                  </p>
                </div>
                <div
                  className="min-w-0 rounded-md px-0.5 py-0.5"
                  title="CPH: depreciação gerencial + operacional + mão de obra, por hora."
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-800 dark:text-zinc-200">
                    CPH
                  </p>
                  <p className="text-sm font-bold tabular-nums">
                    <AppMoney
                      value={cph}
                      size="sm"
                      className="font-semibold text-slate-950 dark:text-zinc-50"
                    />
                  </p>
                </div>
                <div
                  className="min-w-0 rounded-md px-0.5 py-0.5"
                  title="Spread/h: receita/h − CPH."
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-800 dark:text-zinc-200">
                    Spread/h
                  </p>
                  <p className="text-sm font-bold tabular-nums">
                    <AppMoney
                      value={revPerHour - cph}
                      size="sm"
                      className={cn(
                        'font-semibold',
                        isCphOk ? 'text-emerald-950 dark:text-green-300' : 'text-red-800 dark:text-red-400',
                      )}
                    />
                  </p>
                </div>
              </div>
              <p
                className={cn(
                  'text-xs font-semibold leading-snug',
                  isCphOk
                    ? 'text-emerald-950 dark:text-green-100'
                    : 'text-destructive',
                )}
              >
                {isCphOk
                  ? `Cada hora trabalhada gera ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(revPerHour - cph)} de lucro gerencial.`
                  : 'Atenção: a receita por hora está abaixo do custo gerencial — reavalie o preço cobrado.'}
              </p>
            </div>
          )}

          <div className="flex justify-between items-center bg-muted/20 p-2 rounded-lg">
            <div>
              <span className="typo-section-label">Margem líquida gerencial</span>
              <span className="text-xs text-muted-foreground ml-1">
                (
                {marginPercent.toFixed(1)}
                % da receita)
              </span>
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

          {purchaseValue > 0 && (
            <div className="rounded-lg border border-border/60 bg-muted/10 p-3 space-y-2">
              <div className="flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Recuperação do investimento (base depreciável)
                </p>
                {depreciableBase <= 0 && (
                  <span className="ml-auto text-[10px] text-muted-foreground">Sem base (compra = residual)</span>
                )}
                {depreciableBase > 0 && recoveryPct >= 100 && (
                  <span className="ml-auto text-[10px] font-bold text-green-800 dark:text-green-400 uppercase tracking-wide">
                    Meta atingida
                  </span>
                )}
              </div>

              <p className="text-[10px] text-muted-foreground leading-snug">
                Base: compra menos valor residual (
                <AppMoney value={depreciableBase} size="sm" />
                ). Lucro acumulado no período não é o mesmo que dinheiro já recebido.
              </p>

              {depreciableBase > 0 && (
                <>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>
                        Recuperado:
                        {' '}
                        <span className="font-semibold text-foreground">{recoveryPct.toFixed(1)}%</span>
                      </span>
                      <span>
                        <AppMoney value={recovered} size="sm" />
                        {' '}
                        /
                        {' '}
                        <AppMoney value={depreciableBase} size="sm" />
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-700',
                          recoveryPct >= 100
                            ? 'bg-green-600 dark:bg-green-500'
                            : recoveryPct >= 50
                              ? 'bg-blue-600 dark:bg-blue-500'
                              : 'bg-amber-600 dark:bg-amber-500',
                        )}
                        style={{ width: `${recoveryPct}%` }}
                      />
                    </div>
                  </div>

                  {recoveryPct < 100 ? (
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] text-muted-foreground">Falta cobrir (via lucro gerencial)</p>
                        <p className="text-sm font-bold tabular-nums text-amber-800 dark:text-amber-400">
                          <AppMoney value={remaining} size="sm" />
                        </p>
                      </div>
                      {hoursToPayback !== null ? (
                        <div className="text-right">
                          <p className="text-[10px] text-muted-foreground">Projeção (se mantiver spread)</p>
                          <p className="text-xs font-semibold text-muted-foreground">
                            ~
                            {hoursToPayback.toLocaleString('pt-BR')}
                            h
                          </p>
                        </div>
                      ) : (
                        <p className="text-[10px] text-destructive font-medium max-w-[140px] text-right leading-tight">
                          Melhore receita/h vs CPH para viabilizar a recuperação
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-green-800 dark:text-green-400 font-medium">
                      A base depreciável foi coberta pelo lucro gerencial acumulado no período selecionado.
                    </p>
                  )}
                </>
              )}

              {residualValue > 0 && (
                <p className="text-[10px] text-muted-foreground/70 leading-tight border-t border-border/40 pt-1.5">
                  Na revenda, espera-se recuperar mais
                  {' '}
                  <span className="font-semibold text-muted-foreground">
                    <AppMoney value={residualValue} size="sm" />
                  </span>
                  {' '}
                  pelo valor residual cadastrado.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    />
  )
}
