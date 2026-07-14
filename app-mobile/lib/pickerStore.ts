import { useSyncExternalStore } from 'react';
import type { GeoPoint } from '@/types';

// Tiny ephemeral store to hand a map-picked location back to the booking screen.
let picked: GeoPoint | null = null;
const listeners = new Set<() => void>();

export function setPickedLocation(point: GeoPoint): void {
  picked = point;
  listeners.forEach((l) => l());
}

/** Read-and-clear the pending pick (call after consuming it). */
export function consumePickedLocation(): GeoPoint | null {
  const value = picked;
  picked = null;
  listeners.forEach((l) => l());
  return value;
}

export function usePickedLocation(): GeoPoint | null {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => picked,
    () => picked,
  );
}
