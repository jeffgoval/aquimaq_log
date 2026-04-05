import { Link } from 'react-router-dom'
import { AlertTriangle, Droplets } from 'lucide-react'
import { ROUTES } from '@/shared/constants/routes'
import { usePreventiveOilAlerts } from '@/modules/tratores/hooks/use-preventive-oil-alerts'
import type { OilChangeAlertItem, OilChangeAlertSeverity } from '@/modules/tratores/lib/oil-change-alerts'
import { cn } from '@/shared/lib/cn'

function alertStyles(severity: OilChangeAlertSeverity): string {
  switch (severity) {
    case 'overdue':
    case 'critical':
      return 'border-destructive/40 bg-destructive/10'
    case 'warning':
      return 'border-amber-500/40 bg-amber-500/5 dark:bg-amber-500/10'
    default:
      return 'border-border bg-card'
  }
}

function AlertRow({ alert }: { alert: OilChangeAlertItem }) {
  return (
    <div
      className={cn(
        'rounded-lg border px-3 py-2.5 typo-body text-foreground',
        alertStyles(alert.severity),
      )}
    >
      <p className="font-medium leading-snug">{alert.message}</p>
      <Link
        to={ROUTES.TRACTOR_DETAIL(alert.tractorId)}
        className="typo-caption text-primary hover:underline mt-1 inline-block font-medium"
      >
        Ver trator
      </Link>
    </div>
  )
}

export const PreventiveOilAlertsCard = () => {
  const { alerts, isLoading } = usePreventiveOilAlerts()

  if (isLoading || alerts.length === 0) return null

  const hasUrgent = alerts.some((a) => a.severity === 'overdue' || a.severity === 'critical')

  return (
    <div
      className={cn(
        'rounded-xl border p-4 mb-6',
        hasUrgent ? 'border-destructive/30 bg-destructive/5' : 'border-amber-500/25 bg-amber-500/[0.03]',
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        {hasUrgent ? (
          <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
        ) : (
          <Droplets className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        )}
        <p
          className={cn(
            'typo-section-title',
            hasUrgent ? 'text-destructive' : 'text-amber-800 dark:text-amber-200',
          )}
        >
          Manutenção preventiva (óleo)
        </p>
      </div>
      <div className="space-y-2">
        {alerts.map((a) => (
          <AlertRow key={a.tractorId} alert={a} />
        ))}
      </div>
    </div>
  )
}
