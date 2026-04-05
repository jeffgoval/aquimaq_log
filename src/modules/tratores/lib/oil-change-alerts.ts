import type { Tables } from '@/integrations/supabase/db-types'

/** Vermelho: ≤ este valor de horas restantes (ou atraso). */
export const OIL_CHANGE_CRITICAL_HOURS = 10
/** Destaque laranja: até este limite (acima do crítico). */
export const OIL_CHANGE_WARNING_HOURS = 50

export type OilChangeAlertSeverity = 'overdue' | 'critical' | 'warning'

export interface OilChangeAlertItem {
  tractorId: string
  tractorName: string
  severity: OilChangeAlertSeverity
  /** Negativo = horas em atraso. */
  hoursRemaining: number
  message: string
  nextDueHourmeter: number
  currentHourmeter: number
}

function formatHours(n: number): string {
  return Math.abs(n).toLocaleString('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 0 })
}

/**
 * Alertas de troca de óleo com base no horímetro atual (max dos apontamentos),
 * intervalo configurado no trator e horímetro da última troca.
 */
export function computeOilChangeAlerts(
  tractors: Tables<'tractors'>[],
  latestHourmeterByTractorId: Map<string, number>,
): OilChangeAlertItem[] {
  const items: OilChangeAlertItem[] = []

  for (const t of tractors) {
    if (!t.is_active) continue
    const interval = t.oil_change_interval_hours
    const lastDone = t.oil_change_last_done_hourmeter
    if (interval == null || lastDone == null) continue

    const current = latestHourmeterByTractorId.get(t.id)
    if (current == null) continue

    const nextDue = lastDone + interval
    const remaining = nextDue - current

    let severity: OilChangeAlertSeverity
    if (remaining <= 0) {
      severity = 'overdue'
    } else if (remaining <= OIL_CHANGE_CRITICAL_HOURS) {
      severity = 'critical'
    } else if (remaining <= OIL_CHANGE_WARNING_HOURS) {
      severity = 'warning'
    } else {
      continue
    }

    const message =
      remaining <= 0
        ? `Troca de óleo em atraso: ${t.name} está ${formatHours(remaining)} h além do previsto (horímetro ${formatHours(current)} h; meta ${formatHours(nextDue)} h).`
        : `Faltam ${formatHours(remaining)} h para a troca de óleo do ${t.name}.`

    items.push({
      tractorId: t.id,
      tractorName: t.name,
      severity,
      hoursRemaining: remaining,
      message,
      nextDueHourmeter: nextDue,
      currentHourmeter: current,
    })
  }

  return items.sort((a, b) => a.hoursRemaining - b.hoursRemaining)
}

/** Resumo para a ficha do trator (sem filtro de severidade). */
export function getOilChangeStatus(
  tractor: Tables<'tractors'>,
  latestHourmeter: number | null,
): {
  configured: boolean
  hasReading: boolean
  hoursRemaining: number | null
  nextDueHourmeter: number | null
} {
  const interval = tractor.oil_change_interval_hours
  const lastDone = tractor.oil_change_last_done_hourmeter
  if (interval == null || lastDone == null) {
    return { configured: false, hasReading: latestHourmeter != null, hoursRemaining: null, nextDueHourmeter: null }
  }
  if (latestHourmeter == null) {
    return {
      configured: true,
      hasReading: false,
      hoursRemaining: null,
      nextDueHourmeter: lastDone + interval,
    }
  }
  const nextDue = lastDone + interval
  return {
    configured: true,
    hasReading: true,
    hoursRemaining: nextDue - latestHourmeter,
    nextDueHourmeter: nextDue,
  }
}
