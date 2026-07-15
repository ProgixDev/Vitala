import type { GeoPoint } from '@/types';

type Coords = { latitude: number; longitude: number };

const EARTH_RADIUS_KM = 6371;
const toRad = (deg: number) => (deg * Math.PI) / 180;

/**
 * Great-circle distance in km between two points (haversine).
 *
 * Straight-line, not driving distance — good enough to rank and filter jobs,
 * but it will read shorter than the actual trip. Don't present it as an ETA.
 */
export function distanceKm(a: Coords, b: Coords): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/**
 * Distance from `from` to an appointment, or null when either side lacks
 * coordinates. Roughly half of appointments are address-only today, so null is
 * an ordinary case — not an error.
 */
export function distanceToJob(
  from: GeoPoint | null,
  job: { latitude?: number | null; longitude?: number | null },
): number | null {
  if (!from) return null;
  if (job.latitude == null || job.longitude == null) return null;
  return distanceKm(from, { latitude: job.latitude, longitude: job.longitude });
}

/** "800 m" / "2.4 km" / "12 km" — tighter precision when it's close. */
export function formatKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}
