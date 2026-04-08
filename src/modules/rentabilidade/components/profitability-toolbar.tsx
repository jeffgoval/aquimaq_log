import { AppButton } from '@/shared/components/app/app-button'
import { cn } from '@/shared/lib/cn'
import type { PeriodPreset } from '../lib/profitability-period'
import { PERIOD_PRESET_LABELS } from '../lib/profitability-period'

const PERIOD_PRESET_ORDER = Object.keys(PERIOD_PRESET_LABELS) as PeriodPreset[]

export type ProfitabilityTab = 'owner' | 'pro'

/** Qual frota está em análise (tratores vs guinchos). */
export type ProfitabilityFleetTab = 'tractor' | 'truck'

interface Props {
  fleetTab: ProfitabilityFleetTab
  onFleetTab: (t: ProfitabilityFleetTab) => void
  tab: ProfitabilityTab
  onTab: (t: ProfitabilityTab) => void
  preset: PeriodPreset
  onPreset: (p: PeriodPreset) => void
  customFrom: string
  customTo: string
  onCustomFrom: (v: string) => void
  onCustomTo: (v: string) => void
  periodSummary: string
}

export const ProfitabilityToolbar = ({
  fleetTab,
  onFleetTab,
  tab,
  onTab,
  preset,
  onPreset,
  customFrom,
  customTo,
  onCustomFrom,
  onCustomTo,
  periodSummary,
}: Props) => {
  return (
    <div className="mb-6 space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between lg:justify-start lg:gap-3">
          <div className="flex w-full max-w-full rounded-lg border border-border bg-muted/30 p-0.5 sm:w-auto">
            <button
              type="button"
              onClick={() => onFleetTab('tractor')}
              className={cn(
                'flex-1 sm:flex-none rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                fleetTab === 'tractor' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Tratores
            </button>
            <button
              type="button"
              onClick={() => onFleetTab('truck')}
              className={cn(
                'flex-1 sm:flex-none rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                fleetTab === 'truck' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Guinchos
            </button>
          </div>

          <div className="flex w-full max-w-full rounded-lg border border-border bg-muted/30 p-0.5 sm:w-auto">
            <button
              type="button"
              onClick={() => onTab('owner')}
              className={cn(
                'flex-1 sm:flex-none rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                tab === 'owner' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Resumo
            </button>
            <button
              type="button"
              onClick={() => onTab('pro')}
              className={cn(
                'flex-1 sm:flex-none rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                tab === 'pro' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Detalhes
            </button>
          </div>
        </div>

        <p className="max-w-full min-w-0 wrap-break-word text-sm text-muted-foreground lg:text-right">
          Período:{' '}
          <span className="font-medium text-foreground">{periodSummary}</span>
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:gap-4">
        <div className="min-w-0 w-full lg:w-auto">
          <div className="space-y-1.5 lg:hidden">
            <label htmlFor="profitability-period-preset" className="field-label">
              Período
            </label>
            <select
              id="profitability-period-preset"
              className="field w-full"
              value={preset}
              onChange={(e) => onPreset(e.target.value as PeriodPreset)}
            >
              {PERIOD_PRESET_ORDER.map((p) => (
                <option key={p} value={p}>
                  {PERIOD_PRESET_LABELS[p]}
                </option>
              ))}
            </select>
          </div>
          <div className="hidden flex-wrap gap-2 lg:flex">
            {PERIOD_PRESET_ORDER.map((p) => (
              <AppButton
                key={p}
                type="button"
                size="sm"
                variant={preset === p ? 'primary' : 'secondary'}
                onClick={() => onPreset(p)}
              >
                {PERIOD_PRESET_LABELS[p]}
              </AppButton>
            ))}
          </div>
        </div>
        {preset === 'custom' && (
          <div className="flex flex-wrap items-center gap-2">
            <label className="typo-caption text-muted-foreground flex items-center gap-2">
              De
              <input
                type="date"
                value={customFrom}
                onChange={(e) => onCustomFrom(e.target.value)}
                className="rounded-md border border-input bg-background px-2 py-1 text-sm"
              />
            </label>
            <label className="typo-caption text-muted-foreground flex items-center gap-2">
              Até
              <input
                type="date"
                value={customTo}
                onChange={(e) => onCustomTo(e.target.value)}
                className="rounded-md border border-input bg-background px-2 py-1 text-sm"
              />
            </label>
          </div>
        )}
      </div>
    </div>
  )
}
