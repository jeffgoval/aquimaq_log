import { describe, it, expect } from 'vitest'
import { computeServiceFinancialSummary, computeWorklogLineAmounts } from './service-financial-summary'

describe('computeServiceFinancialSummary', () => {
  it('retorna zeros sem apontamentos', () => {
    expect(computeServiceFinancialSummary(100, [])).toEqual({
      totalHours: 0,
      billingTotal: 0,
      operatorCostTotal: 0,
      marginTotal: 0,
    })
  })

  it('soma horas e faturação com taxa única do serviço', () => {
    const logs = [
      { worked_hours: 2.5, operators: { default_hour_rate: 40 } },
      { worked_hours: 1, operators: { default_hour_rate: 40 } },
    ]
    const r = computeServiceFinancialSummary(120, logs)
    expect(r.totalHours).toBe(3.5)
    expect(r.billingTotal).toBe(420)
    expect(r.operatorCostTotal).toBe(2.5 * 40 + 1 * 40)
    expect(r.marginTotal).toBe(420 - r.operatorCostTotal)
  })

  it('sem operador custo da linha é zero', () => {
    const logs = [{ worked_hours: 4, operators: null }]
    const r = computeServiceFinancialSummary(50, logs)
    expect(r.totalHours).toBe(4)
    expect(r.billingTotal).toBe(200)
    expect(r.operatorCostTotal).toBe(0)
    expect(r.marginTotal).toBe(200)
  })
})

describe('computeWorklogLineAmounts', () => {
  it('calcula linha com operador', () => {
    const r = computeWorklogLineAmounts(2, 100, 35)
    expect(r.billingLine).toBe(200)
    expect(r.operatorCostLine).toBe(70)
    expect(r.marginLine).toBe(130)
  })
})
