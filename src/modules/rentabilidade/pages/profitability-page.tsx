import { useMemo, useState } from 'react'
import {
  useTractorProfitability,
  useTruckProfitability,
  useClientRevenue,
  useFleetSpendByCategory,
  useResourceProfitability,
} from '../hooks/use-profitability-queries'
import { ProfitabilityToolbar, type ProfitabilityTab } from '../components/profitability-toolbar'
import { ProfitabilityOverviewPanel } from '../components/profitability-owner-panel'
import { ProfitabilityTractorPanel, ProfitabilityTruckPanel } from '../components/profitability-equipment-panel'
import { ProfitabilityResourcesPanel } from '../components/profitability-resources-panel'
import { AppPageHeader } from '@/shared/components/app/app-page-header'
import { AppLoadingState } from '@/shared/components/app/app-loading-state'
import { AppErrorState } from '@/shared/components/app/app-error-state'
import { ROUTES } from '@/shared/constants/routes'
import type { PeriodPreset } from '../lib/profitability-period'
import { rangeFromPreset } from '../lib/profitability-period'
import dayjs from '@/shared/lib/dayjs'

function formatPeriodSummary(preset: PeriodPreset, range: { from: string | null; to: string | null }): string {
  if (preset === 'all') return 'Todo o histórico registado'
  if (preset === 'custom' && (!range.from || !range.to)) {
    return 'Todo o histórico (preencha início e fim para filtrar)'
  }
  if (range.from && range.to) {
    return `${dayjs(range.from).format('DD/MM/YYYY')} — ${dayjs(range.to).format('DD/MM/YYYY')}`
  }
  return '—'
}

function exportFilenameSlug(range: { from: string | null; to: string | null }, preset: PeriodPreset): string {
  if (preset === 'all') return 'todos'
  if (range.from && range.to) return `${range.from}_${range.to}`
  return 'periodo'
}

export function ProfitabilityPage() {
  const [tab, setTab] = useState<ProfitabilityTab>('overview')
  const [preset, setPreset] = useState<PeriodPreset>('all')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  const range = useMemo(
    () => rangeFromPreset(preset, customFrom, customTo),
    [preset, customFrom, customTo],
  )

  const tractorQ = useTractorProfitability(range)
  const truckQ = useTruckProfitability(range)
  const clientQ = useClientRevenue(range)
  const fleetQ = useFleetSpendByCategory(range)
  const resourceQ = useResourceProfitability(range)

  const isLoading = tractorQ.isLoading || truckQ.isLoading || clientQ.isLoading
  const blockingError = tractorQ.error ?? truckQ.error ?? clientQ.error

  const periodSummary = formatPeriodSummary(preset, range)
  const exportSlug = exportFilenameSlug(range, preset)

  const refetchAll = () => {
    void tractorQ.refetch()
    void truckQ.refetch()
    void clientQ.refetch()
    void fleetQ.refetch()
    void resourceQ.refetch()
  }

  return (
    <div>
      <AppPageHeader
        backTo={ROUTES.DASHBOARD}
        backLabel="Voltar ao início"
        title="Rentabilidade"
        description="Visão de gestão financeira para decisões no dia a dia."
      />

      <ProfitabilityToolbar
        tab={tab}
        onTab={setTab}
        preset={preset}
        onPreset={setPreset}
        customFrom={customFrom}
        customTo={customTo}
        onCustomFrom={setCustomFrom}
        onCustomTo={setCustomTo}
        periodSummary={periodSummary}
      />

      {isLoading && <AppLoadingState />}
      {blockingError && !isLoading && (
        <AppErrorState message={blockingError.message} onRetry={refetchAll} />
      )}

      {!isLoading && !blockingError && (
        <>
          {tab === 'overview' && (
            <ProfitabilityOverviewPanel
              tractors={tractorQ.data ?? []}
              trucks={truckQ.data ?? []}
              clients={clientQ.data ?? []}
              resources={resourceQ.data ?? []}
              fleetSpend={fleetQ.data}
              fleetSpendLoading={fleetQ.isLoading}
              fleetSpendError={fleetQ.isError}
              exportSlug={exportSlug}
              range={range}
            />
          )}
          {tab === 'tractors' && (
            <ProfitabilityTractorPanel
              tractors={tractorQ.data ?? []}
              exportSlug={exportSlug}
              range={range}
            />
          )}
          {tab === 'trucks' && (
            <ProfitabilityTruckPanel
              trucks={truckQ.data ?? []}
              exportSlug={exportSlug}
              range={range}
            />
          )}
          {tab === 'equipment' && (
            <ProfitabilityResourcesPanel
              resources={resourceQ.data ?? []}
              isLoading={resourceQ.isLoading}
              isError={resourceQ.isError}
              range={range}
              exportSlug={exportSlug}
            />
          )}
        </>
      )}
    </div>
  )
}
