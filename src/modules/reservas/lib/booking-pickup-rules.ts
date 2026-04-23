import dayjs from '@/shared/lib/dayjs'

/** Alinhado ao arquivamento automático: `end_date` já passou em relação ao relógio do cliente. */
export function isBookingPickupWindowExpired(endDateIso: string): boolean {
  return dayjs().isAfter(dayjs(endDateIso))
}
