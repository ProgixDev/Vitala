import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { getCurrentCoords } from '@/lib/location';
import type { GeoPoint } from '@/types';

/** How long a fix stays good enough to rank jobs by. */
const MAX_AGE_MS = 2 * 60 * 1000;

/**
 * The nurse's current position, for ranking and filtering the open job pool.
 *
 * Foreground only and read on demand — nothing is tracked in the background and
 * the position never leaves the device, since filtering happens client-side.
 * Refreshes when the app returns to the foreground, so a nurse who drove across
 * town doesn't keep seeing distances from where they started.
 *
 * `denied` distinguishes "we don't know yet" from "the nurse said no" — the
 * caller shows distances as unknown rather than pretending everything is far.
 */
export function useNurseLocation(enabled: boolean) {
  const [point, setPoint] = useState<GeoPoint | null>(null);
  const [denied, setDenied] = useState(false);
  const fetchedAt = useRef(0);
  const inFlight = useRef(false);

  const refresh = useCallback(
    async (force = false) => {
      if (!enabled || inFlight.current) return;
      if (!force && Date.now() - fetchedAt.current < MAX_AGE_MS) return;
      inFlight.current = true;
      try {
        const p = await getCurrentCoords();
        if (p) {
          setPoint(p);
          setDenied(false);
          fetchedAt.current = Date.now();
        } else {
          setDenied(true);
        }
      } catch {
        // A failed fix just means distances stay unknown — never block the list.
      } finally {
        inFlight.current = false;
      }
    },
    [enabled],
  );

  useEffect(() => {
    if (!enabled) return;
    void refresh(true);

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh();
    });
    return () => sub.remove();
  }, [enabled, refresh]);

  return { point, denied, refresh };
}
