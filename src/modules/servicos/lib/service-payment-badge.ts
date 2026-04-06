export type ServicePaymentBadgeKind = 'paid' | 'pending' | 'none'

export type ServicePaymentBadgeVariant =
  | 'default'
  | 'success'
  | 'destructive'
  | 'warning'
  | 'info'
  | 'outline'

export type ServicePaymentReceivableRow = {
  status: string
  final_amount?: number | null
  paid_amount?: number | null
}

/** Dados mínimos do serviço para o badge (lista/detalhe/dashboard). */
export type ServicePaymentBadgeInput = {
  receivables?: ServicePaymentReceivableRow[] | null
  /** Guincho / à vista: comprovante anexo sem parcelas em `receivables`. */
  receipt_storage_path?: string | null
}

function isReceivableRowPaid(r: ServicePaymentReceivableRow): boolean {
  if (r.status === 'paid') return true
  const fin = Number(r.final_amount)
  const paid = Number(r.paid_amount)
  if (Number.isFinite(fin) && Number.isFinite(paid) && fin > 0 && paid >= fin) return true
  return false
}

/**
 * Resumo do financeiro do cliente: parcelas em `receivables`, senão comprovante no serviço.
 * Ignora parcelas canceladas.
 */
export function getServicePaymentBadgeKind(service: ServicePaymentBadgeInput): ServicePaymentBadgeKind {
  const rows = (service.receivables ?? []).filter((r) => r.status !== 'cancelled')
  if (rows.length > 0) {
    if (rows.every(isReceivableRowPaid)) return 'paid'
    return 'pending'
  }
  if (service.receipt_storage_path) return 'paid'
  return 'none'
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
