import { describe, it, expect } from 'vitest'
import { buildInstallmentsPreview } from './create-installments'

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
})
