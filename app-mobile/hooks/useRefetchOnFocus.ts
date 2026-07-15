import { useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';

/**
 * Re-runs a fetch each time the screen comes back into focus.
 *
 * Screens stay mounted while you navigate away, and there's no shared cache, so
 * a list fetched on mount goes stale the moment another screen changes the same
 * data — complete a visit on the detail screen and the nurse's "next visit"
 * would still be showing it.
 *
 * Skips the first focus: useAsync already fetches on mount, and firing here too
 * would double every screen's initial request.
 */
export function useRefetchOnFocus(revalidate: () => Promise<unknown> | void) {
  const mounted = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!mounted.current) {
        mounted.current = true;
        return;
      }
      void revalidate();
    }, [revalidate]),
  );
}
