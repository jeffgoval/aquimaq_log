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
  draft:
    'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-500/15 dark:text-slate-400 dark:border-slate-500/25',
  in_progress: 'bg-primary/10 text-primary border-primary/20',
  completed:
    'bg-green-100 text-green-900 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/30',
  cancelled:
    'bg-red-100 text-red-800 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30',
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
  pending: 'bg-primary/10 text-primary',
  partially_paid:
    'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-400',
  paid: 'bg-green-100 text-green-900 dark:bg-green-500/15 dark:text-green-400',
  overdue: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400',
  cancelled: 'bg-muted text-muted-foreground',
}

export const RECEIVABLE_STATUS_BADGE_VARIANTS: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'info' | 'outline'> = {
  pending: 'warning',
  partially_paid: 'info',
  paid: 'success',
  overdue: 'destructive',
  cancelled: 'default',
}
