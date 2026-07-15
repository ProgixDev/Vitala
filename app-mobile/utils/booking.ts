/**
 * Booking constraints. These mirror the server's CreateAppointmentDto
 * (MIN_DURATION_MIN / MAX_DURATION_MIN) — if you change one, change both, or
 * the picker will happily offer a duration the API rejects.
 */
export const MIN_DURATION = 15;
export const MAX_DURATION = 480;
export const DURATION_STEP = 15;
export const DURATION_PRESETS = [30, 60, 90, 120] as const;

/**
 * What the visit will cost, scaled from the service's base rate.
 *
 * Must match proRataPrice() in the server's appointments.service.ts. This is
 * only an estimate for display — the server recomputes it and that figure wins.
 */
export function estimatePrice(
  basePrice: number,
  baseMinutes: number | null | undefined,
  minutes: number,
): number {
  if (!baseMinutes || baseMinutes <= 0) return basePrice;
  return Math.round(basePrice * (minutes / baseMinutes) * 100) / 100;
}
