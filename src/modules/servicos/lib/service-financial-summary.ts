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
  /** Total de horas (por_hora) ou km (por_km/valor_fixo com guincho). */
  totalQuantity: number
  /** Rótulo da unidade: 'h' ou 'km'. */
  quantityUnit: string
  /** Faturação bruta antes do desconto. */
  billingGross: number
  /** Desconto aplicado (limitado à faturação bruta). */
  ownerDiscountApplied: number
  /** Faturação líquida para o cliente. */
  billingNet: number
  /** Custo total do operador (apenas horas × taxa; 0 para serviços de guincho). */
  operatorCostTotal: number
  /** Lucro bruto: faturação líquida − custo operador. */
  marginTotal: number
  /** Alias retrocompatível. */
  totalHours: number
}

/**
 * Regras de faturação:
 *  - por_hora  → totalHoras × taxa
 *  - por_km    → totalKm × taxa
 *  - valor_fixo → taxa contratada é o total fixo (independente de horas/km)
 *
 * Custo do operador: apenas para apontamentos com worked_hours > 0 (tratores).
 * Serviços de guincho (odômetro) não geram custo de operador automático.
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
    if (Number.isFinite(h) && h > 0) {
      totalHours += h
      // Custo de operador só faz sentido com horas (tractores)
      const opRate = Number(w.operators?.default_hour_rate)
      const safeOp = Number.isFinite(opRate) ? opRate : 0
      operatorCostTotal += h * safeOp
    }
  }

  let billingGross: number
  let totalQuantity: number
  let quantityUnit: string

  if (chargeType === 'por_km') {
    billingGross = totalKm * safeRate
    totalQuantity = totalKm
    quantityUnit = 'km'
  } else if (chargeType === 'valor_fixo') {
    billingGross = safeRate  // valor fixo: taxa = total, independente de km/h
    totalQuantity = totalKm > 0 ? totalKm : totalHours
    quantityUnit = totalKm > 0 ? 'km' : 'h'
  } else {
    // por_hora (default, tratores)
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
    totalHours,
  }
}

/**
 * Valores por linha de apontamento (preview e cards).
 *
 *  - por_hora   → horas × taxa
 *  - por_km     → km × taxa
 *  - valor_fixo → faturação por linha = 0 (billing é flat no serviço, não por linha)
 *
 * Custo do operador: apenas quando worked_hours > 0 (tractores).
 */
export function computeWorklogLineAmounts(
  workedQuantity: number,
  contractedRate: number,
  operatorDefaultHourRate: number | null | undefined,
  chargeType: ChargeType = 'por_hora',
  isHourBased: boolean = chargeType === 'por_hora',
): { billingLine: number; operatorCostLine: number; marginLine: number } {
  const q = Number(workedQuantity)
  if (!Number.isFinite(q) || q <= 0) {
    return { billingLine: 0, operatorCostLine: 0, marginLine: 0 }
  }

  // Faturação por linha
  let billingLine: number
  if (chargeType === 'valor_fixo') {
    billingLine = 0  // valor fixo é total do serviço, não multiplicado por linha
  } else {
    const cr = Number(contractedRate)
    billingLine = (Number.isFinite(cr) ? cr : 0) * q
  }

  // Custo operador: apenas se for base hora (tractores)
  const operatorCostLine = isHourBased
    ? (() => {
        const op = Number(operatorDefaultHourRate)
        return (Number.isFinite(op) ? op : 0) * q
      })()
    : 0

  return {
    billingLine,
    operatorCostLine,
    marginLine: billingLine - operatorCostLine,
  }
}
