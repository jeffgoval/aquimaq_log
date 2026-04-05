/** Linha mínima para apurar faturação, custo de operador e margem (por serviço). */
export interface WorklogFinancialLine {
  worked_hours: number | null
  operators: { default_hour_rate: number | null } | null
}

/** Linha com operador do apontamento (para texto/link no painel de pagamento). */
export interface WorklogOperatorAttributionLine {
  worked_hours: number | null
  operator_id: string | null
  operators: { name: string } | null
}

export type LaborOperatorAttribution =
  | { kind: 'none' }
  | { kind: 'single'; operatorId: string; operatorName: string }
  | { kind: 'multiple'; operators: { operatorId: string; operatorName: string }[] }

/** Operadores que de facto entraram no custo (horímetro com horas > 0 e operador). */
export function getLaborOperatorAttributionFromWorklogs(
  worklogs: WorklogOperatorAttributionLine[],
): LaborOperatorAttribution {
  const byId = new Map<string, string>()
  for (const w of worklogs) {
    const h = Number(w.worked_hours ?? 0)
    if (!Number.isFinite(h) || h <= 0) continue
    const id = w.operator_id
    if (!id) continue
    const name = w.operators?.name?.trim() || 'Operador'
    if (!byId.has(id)) byId.set(id, name)
  }
  if (byId.size === 0) return { kind: 'none' }
  if (byId.size === 1) {
    const [operatorId, operatorName] = [...byId.entries()][0]!
    return { kind: 'single', operatorId, operatorName }
  }
  return {
    kind: 'multiple',
    operators: [...byId.entries()].map(([operatorId, operatorName]) => ({ operatorId, operatorName })),
  }
}

export interface ServiceFinancialSummary {
  totalHours: number
  /** Horas × taxa contratada (antes do desconto). */
  billingGross: number
  /** Valor guardado no serviço, limitado a não exceder a faturação bruta. */
  ownerDiscountApplied: number
  /** Faturação líquida para o cliente / contas a receber. */
  billingNet: number
  operatorCostTotal: number
  /** Lucro bruto após desconto: faturação líquida − mão de obra apontada. */
  marginTotal: number
}

/**
 * - Faturação bruta: cada hora × taxa contratada do serviço.
 * - Desconto do dono: valor fixo em R$ (limitado à faturação bruta).
 * - Custo operador: por linha, horas × taxa padrão do operador (0 se sem operador).
 */
export function computeServiceFinancialSummary(
  contractedHourRate: number,
  worklogs: WorklogFinancialLine[],
  ownerDiscountAmount: number = 0,
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

  const billingGross = totalHours * safeClientRate
  const discountRaw = Number(ownerDiscountAmount)
  const safeDiscountRequest = Number.isFinite(discountRaw) && discountRaw > 0 ? discountRaw : 0
  const ownerDiscountApplied = Math.min(safeDiscountRequest, billingGross)
  const billingNet = Math.max(0, billingGross - ownerDiscountApplied)
  const marginTotal = billingNet - operatorCostTotal

  return {
    totalHours,
    billingGross,
    ownerDiscountApplied,
    billingNet,
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
