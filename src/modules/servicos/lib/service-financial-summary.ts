/** Linha mínima para apurar faturação, custo de operador e margem (por serviço). */
export interface WorklogFinancialLine {
  worked_hours: number | null
  operators: { default_hour_rate: number | null } | null
}

export interface ServiceFinancialSummary {
  totalHours: number
  billingTotal: number
  operatorCostTotal: number
  marginTotal: number
}

/**
 * - Faturação: cada hora trabalhada faturada à taxa contratada do serviço.
 * - Custo operador: por linha, horas × taxa padrão do operador (0 se sem operador).
 */
export function computeServiceFinancialSummary(
  contractedHourRate: number,
  worklogs: WorklogFinancialLine[],
): ServiceFinancialSummary {
  let totalHours = 0
  let operatorCostTotal = 0

  const clientRate = Number(contractedHourRate)
  const safeClientRate = Number.isFinite(clientRate) ? clientRate : 0

  for (const w of worklogs) {
    const h = Number(w.worked_hours ?? 0)
    if (!Number.isFinite(h) || h <= 0) continue
    totalHours += h
    const rate = w.operators?.default_hour_rate
    const opRate = Number(rate)
    const safeOp = Number.isFinite(opRate) ? opRate : 0
    operatorCostTotal += h * safeOp
  }

  const billingTotal = totalHours * safeClientRate
  const marginTotal = billingTotal - operatorCostTotal

  return {
    totalHours,
    billingTotal,
    operatorCostTotal,
    marginTotal,
  }
}

/** Valores por linha (para cards de apontamento). */
export function computeWorklogLineAmounts(
  workedHours: number,
  contractedHourRate: number,
  operatorDefaultHourRate: number | null | undefined,
): { billingLine: number; operatorCostLine: number; marginLine: number } {
  const h = Number(workedHours)
  if (!Number.isFinite(h) || h <= 0) {
    return { billingLine: 0, operatorCostLine: 0, marginLine: 0 }
  }
  const cr = Number(contractedHourRate)
  const safeCr = Number.isFinite(cr) ? cr : 0
  const billingLine = h * safeCr
  const op = Number(operatorDefaultHourRate)
  const safeOp = Number.isFinite(op) ? op : 0
  const operatorCostLine = h * safeOp
  return {
    billingLine,
    operatorCostLine,
    marginLine: billingLine - operatorCostLine,
  }
}
