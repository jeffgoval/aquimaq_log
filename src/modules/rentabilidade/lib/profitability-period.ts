import dayjs from '@/shared/lib/dayjs'
import type { ProfitabilityDateRange } from '../services/profitability.repository'

export type PeriodPreset = 'all' | 'this_month' | 'last_month' | 'this_year' | 'custom'

export function rangeFromPreset(
  preset: PeriodPreset,
  customFrom: string,
  customTo: string,
): ProfitabilityDateRange {
  if (preset === 'all') {
    return { from: null, to: null }
  }
  if (preset === 'this_month') {
    const start = dayjs().startOf('month')
    const end = dayjs().endOf('month')
    return { from: start.format('YYYY-MM-DD'), to: end.format('YYYY-MM-DD') }
  }
  if (preset === 'last_month') {
    const start = dayjs().subtract(1, 'month').startOf('month')
    const end = dayjs().subtract(1, 'month').endOf('month')
    return { from: start.format('YYYY-MM-DD'), to: end.format('YYYY-MM-DD') }
  }
  if (preset === 'this_year') {
    const start = dayjs().startOf('year')
    const end = dayjs().endOf('year')
    return { from: start.format('YYYY-MM-DD'), to: end.format('YYYY-MM-DD') }
  }
  const f = customFrom.trim() || null
  const t = customTo.trim() || null
  if (!f || !t) {
    return { from: null, to: null }
  }
  return { from: f, to: t }
}

export const PERIOD_PRESET_LABELS: Record<PeriodPreset, string> = {
  all: 'Todo o período',
  this_month: 'Este mês',
  last_month: 'Mês passado',
  this_year: 'Este ano',
  custom: 'Datas personalizadas',
}
