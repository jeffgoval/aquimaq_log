// Centralized status labels, colors, and badge variants
// for service and receivable statuses across the app.

// ─── Service ─────────────────────────────────────────────────────────────────

export const SERVICE_STATUS_LABELS: Record<string, string> = {
  draft: 'Em aberto',
  in_progress: 'Em andamento',
  completed: 'Concluído',
  cancelled: 'Cancelado',
}

/** Tailwind classes for inline styled status spans (with border support). */
export const SERVICE_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-400/10 text-slate-400 border-slate-400/20',
  in_progress: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  completed: 'bg-green-400/10 text-green-400 border-green-400/20',
  cancelled: 'bg-red-400/10 text-red-400 border-red-400/20',
}

export const SERVICE_STATUS_BADGE_VARIANTS: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'info' | 'outline'> = {
  draft: 'default',
  in_progress: 'warning',
  completed: 'success',
  cancelled: 'destructive',
}

// ─── Receivable ───────────────────────────────────────────────────────────────

export const RECEIVABLE_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  partially_paid: 'Parcial',
  paid: 'Pago',
  overdue: 'Vencido',
  cancelled: 'Cancelado',
}

/** Tailwind classes for inline styled status spans. */
export const RECEIVABLE_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-400/10 text-amber-400',
  partially_paid: 'bg-blue-400/10 text-blue-400',
  paid: 'bg-green-400/10 text-green-400',
  overdue: 'bg-red-400/10 text-red-400',
  cancelled: 'bg-muted text-muted-foreground',
}

export const RECEIVABLE_STATUS_BADGE_VARIANTS: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'info' | 'outline'> = {
  pending: 'warning',
  partially_paid: 'info',
  paid: 'success',
  overdue: 'destructive',
  cancelled: 'default',
}
