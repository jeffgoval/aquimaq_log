import { describe, it, expect } from 'vitest'
import { buildInstallmentsPreview, buildFinancedInstallmentsPreview } from './create-installments'

describe('buildInstallmentsPreview', () => {
  it('gera o número correto de parcelas', () => {
    const result = buildInstallmentsPreview({
      totalAmount: 1000,
      installmentCount: 3,
      feePercent: 0,
      firstDueDate: '2025-01-15',
    })
    expect(result).toHaveLength(3)
  })

  it('aplica juros corretamente', () => {
    const result = buildInstallmentsPreview({
      totalAmount: 1000,
      installmentCount: 1,
      feePercent: 10,
      firstDueDate: '2025-01-15',
    })
    expect(result[0].amount).toBe(1100)
  })

  it('incrementa vencimentos mensalmente', () => {
    const result = buildInstallmentsPreview({
      totalAmount: 600,
      installmentCount: 3,
      feePercent: 0,
      firstDueDate: '2025-01-15',
    })
    expect(result[1].dueDate).toBe('2025-02-15')
    expect(result[2].dueDate).toBe('2025-03-15')
  })

  it('retorna array vazio para inputs inválidos', () => {
    expect(buildInstallmentsPreview({ totalAmount: 0, installmentCount: 3, feePercent: 0, firstDueDate: '2025-01-01' })).toHaveLength(0)
    expect(buildInstallmentsPreview({ totalAmount: 1000, installmentCount: 0, feePercent: 0, firstDueDate: '2025-01-01' })).toHaveLength(0)
  })

  it('numera parcelas corretamente', () => {
    const result = buildInstallmentsPreview({
      totalAmount: 900,
      installmentCount: 3,
      feePercent: 0,
      firstDueDate: '2025-06-01',
    })
    expect(result.map(r => r.installmentNumber)).toEqual([1, 2, 3])
  })

  it('soma das parcelas é exatamente igual ao total (sem centavos perdidos) — 100 em 3x', () => {
    const result = buildInstallmentsPreview({
      totalAmount: 100,
      installmentCount: 3,
      feePercent: 0,
      firstDueDate: '2025-01-01',
    })
    const total = result.reduce((acc, p) => acc + p.amount, 0)
    expect(total).toBeCloseTo(100, 10)
    // As duas primeiras parcelas valem R$ 33,33 e a última absorve o centavo
    expect(result[0].amount).toBe(33.33)
    expect(result[1].amount).toBe(33.33)
    expect(result[2].amount).toBe(33.34)
  })

  it('soma das parcelas é exatamente igual ao total com juros (R$ 100 + 10% em 3x)', () => {
    const result = buildInstallmentsPreview({
      totalAmount: 100,
      installmentCount: 3,
      feePercent: 10,
      firstDueDate: '2025-01-01',
    })
    const total = result.reduce((acc, p) => acc + p.amount, 0)
    // Total com juros: 110,00 / 3 = 36,6666... → 36,67 + 36,67 + 36,66
    expect(total).toBeCloseTo(110, 10)
  })

  it('parcela única sem juros retorna exatamente o valor total', () => {
    const result = buildInstallmentsPreview({
      totalAmount: 250.99,
      installmentCount: 1,
      feePercent: 0,
      firstDueDate: '2025-03-01',
    })
    expect(result[0].amount).toBe(250.99)
  })
})

describe('buildFinancedInstallmentsPreview', () => {
  it('soma das parcelas do saldo é exatamente o saldo financiado com juros', () => {
    const result = buildFinancedInstallmentsPreview({
      financedAmount: 200,
      installmentCount: 3,
      feePercent: 0,
      firstDueDate: '2025-01-01',
    })
    const total = result.reduce((acc, p) => acc + p.amount, 0)
    expect(total).toBeCloseTo(200, 10)
  })
})
