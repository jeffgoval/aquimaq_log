const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
})

const NUMBER = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const currency = {
  format: (value: number) => BRL.format(value),
  formatNumber: (value: number) => NUMBER.format(value),
  parse: (value: string) =>
    Number(value.replace(/[R$\s.]/g, '').replace(',', '.')),
}
