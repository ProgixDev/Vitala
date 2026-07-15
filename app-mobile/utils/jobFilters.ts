import type { Appointment, GeoPoint } from '@/types';
import { distanceToJob } from '@/utils/geo';

/**
 * Service category slugs a nurse can ask for. Mirrors SERVICE_CATEGORIES on the
 * server (services/dto/service.dto.ts) minus 'other', which isn't a thing a
 * nurse would opt into.
 *
 * These are the canonical slugs — never free text. nurse_profiles.specializations
 * is free-text and already holds a mix of 'Wound Care' and 'wound-care', which
 * is exactly why job filtering uses its own field.
 */
export const JOB_CATEGORIES = [
  'general-care',
  'wound-care',
  'elderly-care',
  'post-surgery',
  'medication-administration',
  'vital-monitoring',
  'emergency',
] as const;

/** Radius choices, km. The last one is effectively "anywhere". */
export const RADIUS_OPTIONS = [5, 10, 25, 50, 100, 200] as const;

export const DEFAULT_RADIUS_KM = 25;

export interface RankedJob {
  appointment: Appointment;
  /** Straight-line km, or null when it can't be determined. */
  km: number | null;
}

/**
 * Rank and filter the open pool for one nurse.
 *
 * Rules worth stating plainly:
 * - A job whose distance is unknown (no coordinates on the appointment, or the
 *   nurse declined location) is NEVER hidden by the radius — it just sorts last
 *   and shows no distance. Roughly half of appointments are address-only, and a
 *   real patient request should not vanish because geocoding didn't happen.
 * - Emergencies ignore both filters. Someone is in trouble; a category
 *   preference shouldn't bury it.
 * - An empty category list means "no preference", not "nothing".
 */
export function rankJobs(
  jobs: Appointment[],
  from: GeoPoint | null,
  opts: { radiusKm: number; categories: string[] },
): RankedJob[] {
  const ranked = jobs.map((appointment) => ({
    appointment,
    km: distanceToJob(from, appointment),
  }));

  const kept = ranked.filter(({ appointment, km }) => {
    if (appointment.appointment_type === 'emergency') return true;

    const category = appointment.service?.category;
    if (opts.categories.length && category && !opts.categories.includes(category)) {
      return false;
    }
    // Unknown distance survives the radius on purpose — see above.
    if (km != null && km > opts.radiusKm) return false;
    return true;
  });

  return kept.sort((a, b) => {
    const ea = a.appointment.appointment_type === 'emergency' ? 0 : 1;
    const eb = b.appointment.appointment_type === 'emergency' ? 0 : 1;
    if (ea !== eb) return ea - eb;

    // Unknown distance sorts after everything with a known one.
    if (a.km == null && b.km == null) {
      return `${a.appointment.scheduled_date}${a.appointment.scheduled_start}`.localeCompare(
        `${b.appointment.scheduled_date}${b.appointment.scheduled_start}`,
      );
    }
    if (a.km == null) return 1;
    if (b.km == null) return -1;
    return a.km - b.km;
  });
}
