import { useMemo, useState } from 'react'
import {
  useTractorProfitability,
  useTruckProfitability,
  useClientRevenue,
  useFleetSpendByCategory,
} from '../hooks/use-profitability-queries'
import { ProfitabilityToolbar, type ProfitabilityTab } from '../components/profitability-toolbar'
import { ProfitabilityOwnerPanel } from '../components/profitability-owner-panel'
import { ProfitabilityProPanel } from '../components/profitability-pro-panel'
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
  const [tab, setTab] = useState<ProfitabilityTab>('owner')
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

  const isLoading = tractorQ.isLoading || truckQ.isLoading || clientQ.isLoading
  const blockingError = tractorQ.error ?? truckQ.error ?? clientQ.error

  const periodSummary = formatPeriodSummary(preset, range)
  const exportSlug = exportFilenameSlug(range, preset)

  const refetchAll = () => {
    void tractorQ.refetch()
    void truckQ.refetch()
    void clientQ.refetch()
    void fleetQ.refetch()
  }

  return (
    <div>
      <AppPageHeader
        backTo={ROUTES.DASHBOARD}
        backLabel="Voltar ao início"
        title="Rentabilidade"
        description="Resumo simples para decisão do dia a dia; detalhes e exportação na aba Profissional. Não substitui a contabilidade fiscal."
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
          {tab === 'owner' ? (
            <ProfitabilityOwnerPanel
              tractors={tractorQ.data ?? []}
              trucks={truckQ.data ?? []}
              clients={clientQ.data ?? []}
              fleetSpend={fleetQ.data}
              fleetSpendLoading={fleetQ.isLoading}
              fleetSpendError={fleetQ.isError}
            />
          ) : (
            <ProfitabilityProPanel
              tractors={tractorQ.data ?? []}
              trucks={truckQ.data ?? []}
              clients={clientQ.data ?? []}
              fleetSpend={fleetQ.data}
              fleetSpendLoading={fleetQ.isLoading}
              fleetSpendError={fleetQ.isError}
              exportSlug={exportSlug}
            />
          )}
        </>
      )}
    </div>
  )
}
