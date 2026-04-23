import dayjs from '@/shared/lib/dayjs'

/** Horas disponíveis no período (dias corridos × 8h). Null se datas não definidas. */
export function calcAvailableHours(from: string | null, to: string | null): number | null {
  if (!from || !to) return null
  const days = dayjs(to).diff(dayjs(from), 'day') + 1
  return days <= 0 ? null : days * 8
}

/** Dias disponíveis no período. Null se datas não definidas. */
export function calcAvailableDays(from: string | null, to: string | null): number | null {
  if (!from || !to) return null
  const days = dayjs(to).diff(dayjs(from), 'day') + 1
  return days <= 0 ? null : days
}

// ─────────────────────────────────────────────────────────────────────────────
// DRE (Demonstração do Resultado Operacional)
// Modelo: Receita − Custos Variáveis = Margem de Contribuição − Custos de Capital = Resultado
// ─────────────────────────────────────────────────────────────────────────────

export type DRE = {
  grossRevenue: number
  variableCost: number          // operational + operator
  contributionMargin: number    // grossRevenue − variableCost
  contributionMarginPct: number
  capitalCost: number           // depreciation (amortização gerencial)
  operatingResult: number       // contributionMargin − capitalCost  = net_margin
  operatingResultPct: number
}

export function calcDRE(
  grossRevenue: number,
  operationalCost: number,
  operatorCost: number,
  depreciationCost: number,
): DRE {
  const variableCost = operationalCost + operatorCost
  const contributionMargin = grossRevenue - variableCost
  const capitalCost = depreciationCost
  const operatingResult = contributionMargin - capitalCost
  return {
    grossRevenue,
    variableCost,
    contributionMargin,
    contributionMarginPct: grossRevenue > 0 ? (contributionMargin / grossRevenue) * 100 : 0,
    capitalCost,
    operatingResult,
    operatingResultPct: grossRevenue > 0 ? (operatingResult / grossRevenue) * 100 : 0,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilização
// ─────────────────────────────────────────────────────────────────────────────

export type UtilizationStatus = 'ok' | 'warning' | 'critical' | 'overload'

export type UtilizationData = {
  worked: number
  available: number
  pct: number
  status: UtilizationStatus
}

export function calcUtilization(worked: number, available: number | null): UtilizationData | null {
  if (!available || available <= 0) return null
  const pct = (worked / available) * 100
  const status: UtilizationStatus =
    pct > 100 ? 'overload' : pct >= 70 ? 'ok' : pct >= 50 ? 'warning' : 'critical'
  return { worked, available, pct, status }
}

export function utilizationBarColor(status: UtilizationStatus): string {
  switch (status) {
    case 'ok':       return 'bg-green-500'
    case 'warning':  return 'bg-amber-500'
    case 'critical': return 'bg-red-500'
    case 'overload': return 'bg-blue-500'
  }
}

export function utilizationTextColor(status: UtilizationStatus): string {
  switch (status) {
    case 'ok':       return 'text-green-700 dark:text-green-400'
    case 'warning':  return 'text-amber-700 dark:text-amber-400'
    case 'critical': return 'text-red-700 dark:text-red-400'
    case 'overload': return 'text-blue-700 dark:text-blue-400'
  }
}

export function utilizationBgClass(status: UtilizationStatus): string {
  switch (status) {
    case 'ok':       return 'bg-green-50 border-green-200 dark:bg-green-500/10 dark:border-green-500/20'
    case 'warning':  return 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20'
    case 'critical': return 'bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/20'
    case 'overload': return 'bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20'
  }
}

export function utilizationLabel(status: UtilizationStatus): string {
  switch (status) {
    case 'ok':       return 'Boa'
    case 'warning':  return 'Atenção'
    case 'critical': return 'Baixa'
    case 'overload': return 'Acima do limite'
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Tarifa Mínima Viável (ponto de equilíbrio por unidade)
// ─────────────────────────────────────────────────────────────────────────────

export type MinViableRateStatus = 'ok' | 'warning' | 'critical'

export type MinViableRate = {
  minRate: number           // custo por unidade (break-even = zero lucro)
  currentRate: number       // receita por unidade
  safetyPct: number         // (currentRate − minRate) / currentRate × 100
  status: MinViableRateStatus
}

export function calcMinViableRate(revenuePerUnit: number, costPerUnit: number): MinViableRate {
  if (revenuePerUnit <= 0) {
    return { minRate: costPerUnit, currentRate: revenuePerUnit, safetyPct: -100, status: 'critical' }
  }
  const safetyPct = ((revenuePerUnit - costPerUnit) / revenuePerUnit) * 100
  const status: MinViableRateStatus =
    costPerUnit > revenuePerUnit ? 'critical' : safetyPct < 15 ? 'warning' : 'ok'
  return { minRate: costPerUnit, currentRate: revenuePerUnit, safetyPct, status }
}

export function minViableRateBgClass(status: MinViableRateStatus): string {
  switch (status) {
    case 'ok':       return 'bg-green-50 border-green-200 dark:bg-green-500/10 dark:border-green-500/20'
    case 'warning':  return 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20'
    case 'critical': return 'bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/20'
  }
}

export function minViableRateTextColor(status: MinViableRateStatus): string {
  switch (status) {
    case 'ok':       return 'text-green-700 dark:text-green-400'
    case 'warning':  return 'text-amber-700 dark:text-amber-400'
    case 'critical': return 'text-red-700 dark:text-red-400'
  }
}
