import { AppMoney } from '@/shared/components/app/app-money'
import { AppEmptyState } from '@/shared/components/app/app-empty-state'
import { cn } from '@/shared/lib/cn'
import { Fuel, Wrench, Users } from 'lucide-react'
import type { Views } from '@/integrations/supabase/db-types'

type FleetSpendRow = Views<'v_fleet_spend_by_category'>

const SEGMENTS: Array<{
  key: keyof Pick<FleetSpendRow, 'spend_diesel' | 'spend_maintenance' | 'spend_operator'>
  label: string
  hint: string
  barClass: string
  icon: typeof Fuel
}> = [
  {
    key: 'spend_diesel',
    label: 'Diesel (combustível)',
    hint: 'Custos tipo combustível na frota',
    barClass: 'bg-amber-500 dark:bg-amber-600',
    icon: Fuel,
  },
  {
    key: 'spend_maintenance',
    label: 'Manutenção e máquina',
    hint: 'Óleo, peças, manutenção e outros custos de equipamento',
    barClass: 'bg-slate-500 dark:bg-slate-400',
    icon: Wrench,
  },
  {
    key: 'spend_operator',
    label: 'Operador',
    hint: 'Horas apontadas × taxa do operador (como na rentabilidade)',
    barClass: 'bg-violet-600 dark:bg-violet-500',
    icon: Users,
  },
]

export interface FleetSpendCategoryChartProps {
  row: FleetSpendRow | null | undefined
  isLoading?: boolean
}

export const FleetSpendCategoryChart = ({ row, isLoading }: FleetSpendCategoryChartProps) => {
  const diesel = Number(row?.spend_diesel ?? 0)
  const maintenance = Number(row?.spend_maintenance ?? 0)
  const operator = Number(row?.spend_operator ?? 0)
  const total = diesel + maintenance + operator

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 mb-6 animate-pulse">
        <div className="h-4 w-48 bg-muted rounded mb-4" />
        <div className="h-3 w-full bg-muted rounded-full mb-6" />
        <div className="space-y-2">
          <div className="h-10 bg-muted/80 rounded-lg" />
          <div className="h-10 bg-muted/80 rounded-lg" />
          <div className="h-10 bg-muted/80 rounded-lg" />
        </div>
      </div>
    )
  }

  if (total <= 0) {
    return (
      <div className="mb-6">
        <h2 className="typo-section-label mb-3">Gastos por categoria</h2>
        <AppEmptyState
          title="Sem gastos registados"
          description="Lance custos de máquina (diesel, peças, etc.) e apontamentos com operador para ver a distribuição."
        />
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 mb-6">
      <h2 className="typo-section-label mb-1">Gastos por categoria</h2>
      <p className="typo-caption text-muted-foreground mb-4">
        Onde o dinheiro da frota está a ir: combustível, manutenção da máquina e mão de obra (mesma base da análise de rentabilidade).
      </p>

      <div className="flex h-4 w-full overflow-hidden rounded-full bg-muted mb-6 ring-1 ring-border/60">
        {SEGMENTS.map(({ key, barClass }) => {
          const value = key === 'spend_diesel' ? diesel : key === 'spend_maintenance' ? maintenance : operator
          const pct = total > 0 ? (value / total) * 100 : 0
          if (pct <= 0) return null
          return (
            <div
              key={key}
              className={cn(barClass, 'min-w-0 transition-all duration-500')}
              style={{ width: `${pct}%` }}
              title={`${pct.toFixed(1)}%`}
            />
          )
        })}
      </div>

      <ul className="space-y-3">
        {SEGMENTS.map(({ key, label, hint, barClass, icon: Icon }) => {
          const value = key === 'spend_diesel' ? diesel : key === 'spend_maintenance' ? maintenance : operator
          const pct = total > 0 ? (value / total) * 100 : 0
          return (
            <li
              key={key}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5"
            >
              <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white', barClass)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="typo-body font-semibold text-foreground leading-tight">{label}</p>
                <p className="typo-caption text-muted-foreground leading-snug">{hint}</p>
              </div>
              <div className="text-right tabular-nums">
                <p className="typo-body font-bold">
                  <AppMoney value={value} />
                </p>
                <p className="typo-caption text-muted-foreground">{pct.toFixed(1)}% do total</p>
              </div>
            </li>
          )
        })}
      </ul>

      <p className="typo-caption text-muted-foreground mt-4 pt-3 border-t border-border">
        Total analisado: <span className="font-semibold text-foreground"><AppMoney value={total} /></span>
        {' · '}
        Custos de máquina cancelados não entram no diesel/manutenção.
      </p>
    </div>
  )
}
