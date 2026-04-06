import { AppButton } from '@/shared/components/app/app-button'
import { cn } from '@/shared/lib/cn'
import type { PeriodPreset } from '../lib/profitability-period'
import { PERIOD_PRESET_LABELS } from '../lib/profitability-period'

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
      <div className="flex flex-col gap-3">
        <div className="flex w-full max-w-full flex-wrap rounded-lg border border-border bg-muted/30 p-0.5 sm:inline-flex sm:w-fit">
          <button
            type="button"
            onClick={() => onFleetTab('tractor')}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              fleetTab === 'tractor' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Tratores
          </button>
          <button
            type="button"
            onClick={() => onFleetTab('truck')}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              fleetTab === 'truck' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Guinchos
          </button>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex w-full max-w-full flex-wrap rounded-lg border border-border bg-muted/30 p-0.5 sm:inline-flex sm:w-auto">
            <button
              type="button"
              onClick={() => onTab('owner')}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                tab === 'owner' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Resumo (dono)
            </button>
            <button
              type="button"
              onClick={() => onTab('pro')}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                tab === 'pro' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Profissional
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            Período:
            {' '}
            <span className="font-medium text-foreground">{periodSummary}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:gap-4">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(PERIOD_PRESET_LABELS) as PeriodPreset[]).map((p) => (
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
