import { useCallback, useEffect, useRef, useState } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  /**
   * Refetch without flipping `loading` — keeps showing what we have while the
   * new data lands. For background revalidation (e.g. on screen focus), where
   * a spinner would be noise.
   */
  revalidate: () => Promise<void>;
  setData: (updater: (prev: T | null) => T | null) => void;
}

/**
 * Runs an async fetcher on mount (and when `deps` change), exposing
 * loading/error/refetch. Ignores results from stale runs.
 */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []): AsyncState<T> {
  const [data, setDataState] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const runId = useRef(0);

  const run = useCallback(async (quiet = false) => {
    const id = ++runId.current;
    if (!quiet) setLoading(true);
    setError(null);
    try {
      const result = await fn();
      if (id === runId.current) setDataState(result);
    } catch (e) {
      if (id === runId.current) {
        setError(e instanceof Error ? e.message : 'Something went wrong');
      }
    } finally {
      if (id === runId.current && !quiet) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    void run();
  }, [run]);

  // Wrapped so callers can pass these straight to onRefresh / useFocusEffect
  // without leaking the `quiet` arg (RefreshControl would pass its own args).
  const refetch = useCallback(() => run(false), [run]);
  const revalidate = useCallback(() => run(true), [run]);

  const setData = useCallback((updater: (prev: T | null) => T | null) => {
    setDataState((prev) => updater(prev));
  }, []);

  return { data, loading, error, refetch, revalidate, setData };
}
