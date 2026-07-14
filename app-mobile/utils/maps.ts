import { Linking, Platform } from 'react-native';

interface Destination {
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
}

/**
 * Open turn-by-turn directions to a visit in the device's native maps app,
 * preferring exact coordinates and falling back to the address. Returns false
 * when there's nothing to route to. Falls back to a universal Google Maps URL
 * if the native scheme can't be opened.
 */
export function openDirections({ latitude, longitude, address }: Destination): boolean {
  const hasCoords = latitude != null && longitude != null;
  if (!hasCoords && !address) return false;

  const dest = hasCoords ? `${latitude},${longitude}` : encodeURIComponent(address ?? '');
  const universal = `https://www.google.com/maps/dir/?api=1&destination=${dest}`;

  const native = hasCoords
    ? Platform.select({
        ios: `maps://?daddr=${dest}`,
        android: `google.navigation:q=${dest}`,
        default: universal,
      })
    : Platform.select({
        ios: `maps://?daddr=${dest}`,
        android: `geo:0,0?q=${dest}`,
        default: universal,
      });

  Linking.openURL(native ?? universal).catch(() => {
    void Linking.openURL(universal);
  });
  return true;
}
