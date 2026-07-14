import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { Endpoints } from '@/lib/endpoints';

const PING_INTERVAL_MS = 15000;

/**
 * While a nurse is on the way, push their live location to the visit every few
 * seconds so the patient can watch them approach. Requests foreground permission
 * once when it becomes active; silently no-ops (but reports `denied`) otherwise.
 */
export function useNurseLocationPing(active: boolean, appointmentId?: string) {
  const [sharing, setSharing] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    if (!active || !appointmentId) {
      setSharing(false);
      return;
    }

    const ping = async () => {
      try {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (cancelled) return;
        await Endpoints.updateNurseLocation(appointmentId, {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      } catch {
        // A single failed fix or request shouldn't stop the stream.
      }
    };

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;
      if (status !== 'granted') {
        setDenied(true);
        setSharing(false);
        return;
      }
      setDenied(false);
      await ping();
      if (cancelled) return;
      setSharing(true);
      timer = setInterval(ping, PING_INTERVAL_MS);
    })();

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      setSharing(false);
    };
  }, [active, appointmentId]);

  return { sharing, denied };
}
