const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
})

const NUMBER = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/**
 * Lê texto de campo monetário (AppCurrencyInput, colar valores, total sugerido).
 * - pt-BR: `1.500,25` (ponto = milhar, vírgula = decimal)
 * - Número JS em string: `1500.25` (ponto = decimal) — não confundir com milhar
 */
export function parseMoneyInput(raw: unknown): number {
  if (raw == null || raw === '') return 0
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0
  const trimmed = String(raw).replace(/\s/g, '').replace(/R\$\s*/i, '').trim()
  if (!trimmed) return 0
  if (/^\d+\.\d+$/.test(trimmed) || (/^\d+$/.test(trimmed) && !trimmed.includes(','))) {
    const n = Number(trimmed)
    return Number.isFinite(n) ? n : 0
  }
  const normalized = trimmed.replace(/\./g, '').replace(',', '.')
  const n = Number(normalized)
  return Number.isFinite(n) ? n : 0
}

/** Valor para preencher AppCurrencyInput a partir de um número (ex. total apurado). */
export function formatMoneyInputValue(value: number): string {
  if (!Number.isFinite(value) || value < 0) return ''
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export const currency = {
  format: (value: number) => BRL.format(value),
  formatNumber: (value: number) => NUMBER.format(value),
  parse: (value: string) => parseMoneyInput(value),
}
