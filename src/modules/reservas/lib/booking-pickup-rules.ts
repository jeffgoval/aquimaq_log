import dayjs from '@/shared/lib/dayjs'
import { TZ_APP } from '@/app/config/constants'

/**
 * Minutos após `start_date` para ainda permitir "Iniciar retirada".
 * Manter alinhado com a migração mais recente (INTERVAL na função `log_archive_expired_pending_bookings`).
 */
export const BOOKING_PICKUP_GRACE_MINUTES_AFTER_START = 1

/** ISO do "agora" no fuso da operação, para filtros na API (Supabase). */
export function getBookingRulesNowIso(): string {
  return dayjs().tz(TZ_APP).toISOString()
}

function startInAppTz(startDateIso: string) {
  return dayjs(startDateIso).tz(TZ_APP)
}

function endInAppTz(endDateIso: string) {
  return dayjs(endDateIso).tz(TZ_APP)
}

/** `end_date` já passou (vista no mesmo fuso em que a tabela mostra o período). */
export function isBookingPickupWindowExpired(endDateIso: string): boolean {
  const end = endInAppTz(endDateIso)
  if (!end.isValid()) return false
  return dayjs().tz(TZ_APP).isAfter(end)
}

/** Ainda não chegou o início da reserva. */
export function isBookingPickupBeforeWindow(startDateIso: string): boolean {
  const start = startInAppTz(startDateIso)
  if (!start.isValid()) return true
  return dayjs().tz(TZ_APP).isBefore(start)
}

/** Passou o prazo início + tolerância — caduca para efeito de agenda. */
export function isBookingPickupMissedGraceWindow(startDateIso: string): boolean {
  const start = startInAppTz(startDateIso)
  if (!start.isValid()) return false
  const deadline = start.add(BOOKING_PICKUP_GRACE_MINUTES_AFTER_START, 'minute')
  return dayjs().tz(TZ_APP).isAfter(deadline)
}
