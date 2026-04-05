import { describe, it, expect } from 'vitest'
import {
  computeServiceFinancialSummary,
  computeWorklogLineAmounts,
  getLaborOperatorAttributionFromWorklogs,
} from './service-financial-summary'

describe('computeServiceFinancialSummary', () => {
  it('retorna zeros sem apontamentos', () => {
    const r = computeServiceFinancialSummary(100, [])
    expect(r.totalQuantity).toBe(0)
    expect(r.billingGross).toBe(0)
    expect(r.billingNet).toBe(0)
    expect(r.ownerDiscountApplied).toBe(0)
    expect(r.operatorCostTotal).toBe(0)
    expect(r.marginTotal).toBe(0)
  })

  it('soma horas e faturação com taxa única do serviço', () => {
    const logs = [
      { worked_hours: 2.5, worked_km: null, operators: { default_hour_rate: 40 } },
      { worked_hours: 1, worked_km: null, operators: { default_hour_rate: 40 } },
    ]
    const r = computeServiceFinancialSummary(120, logs)
    expect(r.totalQuantity).toBe(3.5)
    expect(r.totalHours).toBe(3.5)
    expect(r.billingGross).toBe(420)
    expect(r.billingNet).toBe(420)
    expect(r.ownerDiscountApplied).toBe(0)
    expect(r.operatorCostTotal).toBe(2.5 * 40 + 1 * 40)
    expect(r.marginTotal).toBe(420 - r.operatorCostTotal)
  })

  it('sem operador custo da linha é zero', () => {
    const logs = [{ worked_hours: 4, worked_km: null, operators: null }]
    const r = computeServiceFinancialSummary(50, logs)
    expect(r.totalQuantity).toBe(4)
    expect(r.billingGross).toBe(200)
    expect(r.billingNet).toBe(200)
    expect(r.operatorCostTotal).toBe(0)
    expect(r.marginTotal).toBe(200)
  })

  it('aplica desconto do dono até ao teto da faturação bruta', () => {
    const logs = [{ worked_hours: 2, worked_km: null, operators: { default_hour_rate: 10 } }]
    const r = computeServiceFinancialSummary(100, logs, 30)
    expect(r.billingGross).toBe(200)
    expect(r.ownerDiscountApplied).toBe(30)
    expect(r.billingNet).toBe(170)
    expect(r.marginTotal).toBe(170 - 20)
  })

  it('limita desconto que excede faturação bruta', () => {
    const logs = [{ worked_hours: 1, worked_km: null, operators: null }]
    const r = computeServiceFinancialSummary(50, logs, 999)
    expect(r.billingGross).toBe(50)
    expect(r.ownerDiscountApplied).toBe(50)
    expect(r.billingNet).toBe(0)
    expect(r.marginTotal).toBe(0)
  })

  it('por_km usa worked_km na faturação', () => {
    const logs = [
      { worked_hours: null, worked_km: 150, operators: { default_hour_rate: 0 } },
      { worked_hours: null, worked_km: 80, operators: null },
    ]
    const r = computeServiceFinancialSummary(5, logs, 0, 'por_km')
    expect(r.totalQuantity).toBe(230)
    expect(r.quantityUnit).toBe('km')
    expect(r.billingGross).toBe(1150)
    expect(r.billingNet).toBe(1150)
  })

  it('valor_fixo usa taxa contratada como total independente de horas', () => {
    const logs = [{ worked_hours: 3, worked_km: null, operators: null }]
    const r = computeServiceFinancialSummary(500, logs, 0, 'valor_fixo')
    expect(r.billingGross).toBe(500)
    expect(r.billingNet).toBe(500)
  })
})

describe('getLaborOperatorAttributionFromWorklogs', () => {
  it('none sem horas ou sem operador', () => {
    expect(getLaborOperatorAttributionFromWorklogs([])).toEqual({ kind: 'none' })
    expect(
      getLaborOperatorAttributionFromWorklogs([
        { worked_hours: 0, operator_id: 'a', operators: { name: 'A' } },
        { worked_hours: 2, operator_id: null, operators: null },
      ]),
    ).toEqual({ kind: 'none' })
  })

  it('single quando só um operador tem horas', () => {
    const r = getLaborOperatorAttributionFromWorklogs([
      { worked_hours: 2, operator_id: 'uuid-b', operators: { name: 'Bruno' } },
      { worked_hours: 1, operator_id: 'uuid-b', operators: { name: 'Bruno' } },
    ])
    expect(r).toEqual({ kind: 'single', operatorId: 'uuid-b', operatorName: 'Bruno' })
  })

  it('multiple com dois operadores distintos', () => {
    const r = getLaborOperatorAttributionFromWorklogs([
      { worked_hours: 1, operator_id: 'a', operators: { name: 'Ana' } },
      { worked_hours: 2, operator_id: 'b', operators: { name: 'Beto' } },
    ])
    expect(r.kind).toBe('multiple')
    if (r.kind === 'multiple') {
      expect(r.operators).toHaveLength(2)
      expect(r.operators.map((o) => o.operatorName).sort()).toEqual(['Ana', 'Beto'])
    }
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
