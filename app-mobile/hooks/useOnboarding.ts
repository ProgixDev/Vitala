import { useCallback, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

const KEY = 'vitala.onboarding.completed';

/** Persisted "has seen onboarding" flag (SecureStore). */
export function useOnboarding() {
  const [completed, setCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    SecureStore.getItemAsync(KEY)
      .then((v) => setCompleted(v === 'true'))
      .catch(() => setCompleted(false));
  }, []);

  const complete = useCallback(async () => {
    setCompleted(true);
    try {
      await SecureStore.setItemAsync(KEY, 'true');
    } catch {
      // non-fatal
    }
  }, []);

  return { completed, complete };
}
