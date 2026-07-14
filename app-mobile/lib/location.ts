import * as Location from 'expo-location';
import type { GeoPoint } from '@/types';

/** Request permission + resolve the device's current point with a best-effort address. */
export async function getCurrentPoint(): Promise<GeoPoint | null> {
  const perm = await Location.requestForegroundPermissionsAsync();
  if (!perm.granted) return null;

  const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  const { latitude, longitude } = pos.coords;

  let address = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
  try {
    const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (place) {
      const parts = [place.name, place.street, place.city, place.region].filter(Boolean);
      if (parts.length) address = parts.join(', ');
    }
  } catch {
    // keep coordinate fallback
  }

  return { latitude, longitude, address };
}
