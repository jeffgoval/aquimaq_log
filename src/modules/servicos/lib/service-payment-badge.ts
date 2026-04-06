export type ServicePaymentBadgeKind = 'paid' | 'pending' | 'none'

export type ServicePaymentBadgeVariant =
  | 'default'
  | 'success'
  | 'destructive'
  | 'warning'
  | 'info'
  | 'outline'

/** Resumo do financeiro do cliente (parcelas do serviço), ignorando canceladas. */
export function getServicePaymentBadgeKind(
  receivables: { status: string }[] | null | undefined,
): ServicePaymentBadgeKind {
  const rows = (receivables ?? []).filter((r) => r.status !== 'cancelled')
  if (rows.length === 0) return 'none'
  if (rows.every((r) => r.status === 'paid')) return 'paid'
  return 'pending'
}

export function getServicePaymentBadgeProps(kind: ServicePaymentBadgeKind): {
  label: string
  variant: ServicePaymentBadgeVariant
} {
  switch (kind) {
    case 'paid':
      return { label: 'Pago', variant: 'success' }
    case 'pending':
      return { label: 'Pendente', variant: 'warning' }
    default:
      return { label: 'Sem cobrança', variant: 'outline' }
  }
}
