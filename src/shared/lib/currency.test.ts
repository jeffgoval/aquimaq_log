import { describe, it, expect } from 'vitest'
import { parseMoneyInput, formatMoneyInputValue, currency } from './currency'

describe('parseMoneyInput', () => {
  it('pt-BR com milhar e centavos', () => {
    expect(parseMoneyInput('1.500,25')).toBe(1500.25)
    expect(parseMoneyInput('R$ 10.000,00')).toBe(10000)
  })

  it('número JS em string (ponto decimal) — não inflacionar', () => {
    expect(parseMoneyInput('1500.25')).toBe(1500.25)
    expect(parseMoneyInput('696.00')).toBe(696)
  })

  it('inteiro sem vírgula', () => {
    expect(parseMoneyInput('696')).toBe(696)
  })

  it('number pass-through', () => {
    expect(parseMoneyInput(42.5)).toBe(42.5)
  })

  it('currency.parse alinhado', () => {
    expect(currency.parse('1500.25')).toBe(1500.25)
    expect(currency.parse('1.500,25')).toBe(1500.25)
  })
})

describe('formatMoneyInputValue', () => {
  it('formata pt-BR com 2 casas', () => {
    expect(formatMoneyInputValue(1500.25)).toMatch(/1\.500,25/)
    expect(formatMoneyInputValue(696)).toMatch(/696,00/)
  })
})
