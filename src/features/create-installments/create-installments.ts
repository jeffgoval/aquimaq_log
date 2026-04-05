function addMonths(dateString: string, months: number): string {
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1 + months, day)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export interface InstallmentPreviewItem {
  installmentNumber: number
  amount: number
  dueDate: string
}

export interface BuildInstallmentsPreviewInput {
  totalAmount: number
  installmentCount: number
  feePercent: number
  firstDueDate: string
}

function previewFromPrincipal(
  principalTotal: number,
  installmentCount: number,
  feePercent: number,
  firstDueDate: string,
): InstallmentPreviewItem[] {
  if (installmentCount <= 0 || principalTotal <= 0) return []

  const totalWithFee = principalTotal * (1 + feePercent / 100)
  const baseInstallment = totalWithFee / installmentCount
  const baseRounded = Number(baseInstallment.toFixed(2))

  return Array.from({ length: installmentCount }, (_, i) => {
    const isLast = i === installmentCount - 1
    // A última parcela absorve a diferença de arredondamento para que
    // a soma exata bata com totalWithFee arredondado a 2 casas.
    const amount = isLast
      ? Number((totalWithFee - baseRounded * (installmentCount - 1)).toFixed(2))
      : baseRounded
    return { installmentNumber: i + 1, amount, dueDate: addMonths(firstDueDate, i) }
  })
}

export function buildInstallmentsPreview({
  totalAmount,
  installmentCount,
  feePercent,
  firstDueDate,
}: BuildInstallmentsPreviewInput): InstallmentPreviewItem[] {
  return previewFromPrincipal(totalAmount, installmentCount, feePercent, firstDueDate)
}

/** Juros aplicam-se só ao saldo financiado (total − entrada); parcelas mensais a partir de `firstDueDate`. */
export function buildFinancedInstallmentsPreview(params: {
  financedAmount: number
  installmentCount: number
  feePercent: number
  firstDueDate: string
}): InstallmentPreviewItem[] {
  return previewFromPrincipal(
    params.financedAmount,
    params.installmentCount,
    params.feePercent,
    params.firstDueDate,
  )
}
