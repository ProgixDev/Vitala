import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_QUICK_ACTIONS,
  QUICK_ACTION_MAP,
  QUICK_ACTION_SLOTS,
  type QuickActionId,
} from '@/constants/quickActions';

const KEY = 'vitala.quickActions';

function sanitize(ids: unknown): QuickActionId[] | null {
  if (!Array.isArray(ids)) return null;
  const valid = ids.filter(
    (id): id is QuickActionId => typeof id === 'string' && id in QUICK_ACTION_MAP,
  );
  const unique = Array.from(new Set(valid)).slice(0, QUICK_ACTION_SLOTS);
  return unique.length === QUICK_ACTION_SLOTS ? unique : null;
}

/** Patient home shortcuts — the 4 pinned quick actions, persisted locally. */
export function useQuickActions() {
  const [favorites, setFavorites] = useState<QuickActionId[]>(DEFAULT_QUICK_ACTIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        const parsed = raw ? sanitize(JSON.parse(raw)) : null;
        if (parsed) setFavorites(parsed);
      })
      .catch(() => {
        // fall back to defaults
      })
      .finally(() => setLoading(false));
  }, []);

  const save = useCallback(async (ids: QuickActionId[]) => {
    const next = sanitize(ids) ?? DEFAULT_QUICK_ACTIONS;
    setFavorites(next);
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // non-fatal — selection still applies for the session
    }
  }, []);

  return { favorites, save, loading };
}
