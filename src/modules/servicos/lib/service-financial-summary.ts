/** Linha mínima para apurar faturação, custo de operador e margem (por serviço). */
export interface WorklogFinancialLine {
  worked_hours: number | null
  worked_km: number | null
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

export type ChargeType = 'por_hora' | 'por_km' | 'valor_fixo'

export interface ServiceFinancialSummary {
  /** Total de horas (para serviços por hora) ou KM (para serviços por km). */
  totalQuantity: number
  /** Rótulo da unidade: 'h' ou 'km'. */
  quantityUnit: string
  /** Quantidade × taxa contratada (antes do desconto). */
  billingGross: number
  /** Valor guardado no serviço, limitado a não exceder a faturação bruta. */
  ownerDiscountApplied: number
  /** Faturação líquida para o cliente / contas a receber. */
  billingNet: number
  operatorCostTotal: number
  /** Lucro bruto após desconto: faturação líquida − mão de obra apontada. */
  marginTotal: number
  // Backwards-compat alias
  totalHours: number
}

/**
 * - Faturação bruta: cada unidade (hora ou km) × taxa contratada do serviço.
 * - Desconto do dono: valor fixo em R$ (limitado à faturação bruta).
 * - Custo operador: por linha, horas × taxa padrão do operador (0 se sem operador).
 * - Para valor_fixo: taxa contratada é o total, independente de horas/km.
 */
export function computeServiceFinancialSummary(
  contractedRate: number,
  worklogs: WorklogFinancialLine[],
  ownerDiscountAmount: number = 0,
  chargeType: ChargeType = 'por_hora',
): ServiceFinancialSummary {
  let totalHours = 0
  let totalKm = 0
  let operatorCostTotal = 0

  const rate = Number(contractedRate)
  const safeRate = Number.isFinite(rate) ? rate : 0

  for (const w of worklogs) {
    const km = Number(w.worked_km ?? 0)
    const h = Number(w.worked_hours ?? 0)
    if (Number.isFinite(km) && km > 0) totalKm += km
    if (Number.isFinite(h) && h > 0) totalHours += h
    const opRate = Number(w.operators?.default_hour_rate)
    const safeOp = Number.isFinite(opRate) ? opRate : 0
    // Operator cost always in hours when available; fallback to km if no hours
    const opBase = h > 0 ? h : (km > 0 ? km : 0)
    operatorCostTotal += opBase * safeOp
  }

  let billingGross: number
  let totalQuantity: number
  let quantityUnit: string

  if (chargeType === 'por_km') {
    billingGross = totalKm * safeRate
    totalQuantity = totalKm
    quantityUnit = 'km'
  } else if (chargeType === 'valor_fixo') {
    billingGross = safeRate
    totalQuantity = totalHours || totalKm
    quantityUnit = totalKm > 0 ? 'km' : 'h'
  } else {
    billingGross = totalHours * safeRate
    totalQuantity = totalHours
    quantityUnit = 'h'
  }

  const discountRaw = Number(ownerDiscountAmount)
  const safeDiscountRequest = Number.isFinite(discountRaw) && discountRaw > 0 ? discountRaw : 0
  const ownerDiscountApplied = Math.min(safeDiscountRequest, billingGross)
  const billingNet = Math.max(0, billingGross - ownerDiscountApplied)
  const marginTotal = billingNet - operatorCostTotal

  return {
    totalQuantity,
    quantityUnit,
    billingGross,
    ownerDiscountApplied,
    billingNet,
    operatorCostTotal,
    marginTotal,
    totalHours, // backwards-compat
  }
}

/** Valores por linha (para cards de apontamento). */
export function computeWorklogLineAmounts(
  workedQuantity: number,
  contractedRate: number,
  operatorDefaultHourRate: number | null | undefined,
  chargeType: ChargeType = 'por_hora',
): { billingLine: number; operatorCostLine: number; marginLine: number } {
  const q = Number(workedQuantity)
  if (!Number.isFinite(q) || q <= 0) {
    return { billingLine: 0, operatorCostLine: 0, marginLine: 0 }
  }
  const cr = Number(contractedRate)
  const safeCr = Number.isFinite(cr) ? cr : 0
  // valor_fixo: per-line billing is still proportional (same math as por_hora/por_km)
  const billingLine = q * safeCr
  const op = Number(operatorDefaultHourRate)
  const safeOp = Number.isFinite(op) ? op : 0
  const operatorCostLine = q * safeOp
  return {
    billingLine,
    operatorCostLine,
    marginLine: billingLine - operatorCostLine,
  }
}
