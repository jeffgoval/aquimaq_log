import { describe, expect, it } from 'vitest'
import {
  computeOilChangeAlerts,
  OIL_CHANGE_CRITICAL_HOURS,
  OIL_CHANGE_WARNING_HOURS,
} from './oil-change-alerts'
import type { Tables } from '@/integrations/supabase/db-types'

const baseTractor = (over: Partial<Tables<'tractors'>>): Tables<'tractors'> => ({
  id: 't1',
  name: 'Trator Alfa',
  plate: null,
  brand: null,
  model: null,
  purchase_value: 0,
  residual_value: 0,
  useful_life_hours: 5000,
  standard_hour_cost: null,
  is_active: true,
  notes: null,
  oil_change_interval_hours: 100,
  oil_change_last_done_hourmeter: 1000,
  created_at: '',
  updated_at: '',
  ...over,
})

describe('computeOilChangeAlerts', () => {
  it('não alerta quando fora da janela de aviso', () => {
    const t = baseTractor({})
    const map = new Map([['t1', 1000 + 100 - OIL_CHANGE_WARNING_HOURS - 1]])
    expect(computeOilChangeAlerts([t], map)).toHaveLength(0)
  })

  it('alerta crítico quando faltam poucas horas', () => {
    const t = baseTractor({})
    const current = 1000 + 100 - OIL_CHANGE_CRITICAL_HOURS
    const alerts = computeOilChangeAlerts([t], new Map([['t1', current]]))
    expect(alerts).toHaveLength(1)
    expect(alerts[0].severity).toBe('critical')
    expect(alerts[0].hoursRemaining).toBe(OIL_CHANGE_CRITICAL_HOURS)
    expect(alerts[0].message).toContain('Faltam')
    expect(alerts[0].message).toContain('Trator Alfa')
  })

  it('alerta em atraso quando horímetro passou da meta', () => {
    const t = baseTractor({})
    const alerts = computeOilChangeAlerts([t], new Map([['t1', 1101]]))
    expect(alerts[0].severity).toBe('overdue')
    expect(alerts[0].hoursRemaining).toBeLessThan(0)
  })

  it('ignora trator inativo ou sem configuração completa', () => {
    const inactive = baseTractor({ is_active: false })
    const noInterval = baseTractor({ oil_change_interval_hours: null })
    const map = new Map([['t1', 2000]])
    expect(computeOilChangeAlerts([inactive], map)).toHaveLength(0)
    expect(computeOilChangeAlerts([noInterval], map)).toHaveLength(0)
  })
})
