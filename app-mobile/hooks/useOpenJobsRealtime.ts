import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, getAccessToken } from '@/lib/supabase';
import { useSession } from '@/providers/SessionProvider';
import { Endpoints } from '@/lib/endpoints';
import type { Appointment } from '@/types';

/**
 * Live feed of new open jobs for an on-duty nurse.
 *
 * Subscribes to INSERTs on `appointments`. Realtime applies RLS per subscriber
 * and `appt_open_pool_read` only exposes unassigned pending rows to nurses, so
 * the server never sends us anyone else's appointment. We re-check the shape
 * client-side anyway, since that policy could change under us.
 *
 * The realtime payload is the raw table row — no service or patient join — so
 * we refetch the enriched row over HTTP before showing it. That also means a
 * job the nurse already passed on never surfaces: the server filters it out.
 */
export function useOpenJobsRealtime(
  enabled: boolean,
  onJob: (job: Appointment) => void,
) {
  const { me } = useSession();
  // The callback changes identity every render; keep the subscription stable.
  const onJobRef = useRef(onJob);
  onJobRef.current = onJob;

  useEffect(() => {
    if (!enabled || me?.role !== 'nurse') return;

    let channel: RealtimeChannel | null = null;
    let cancelled = false;

    const handleInsert = (row: unknown) => {
      const appt = row as Partial<Appointment>;
      if (!appt?.id || appt.nurse_id) return;
      // Fetch the joined row; skip silently if it's gone or not ours to see.
      Endpoints.appointment(appt.id)
        .then((full) => {
          if (!cancelled && !full.nurse_id && full.status === 'pending') {
            onJobRef.current(full);
          }
        })
        .catch(() => undefined);
    };

    void (async () => {
      // supabase-js pushes the JWT to the socket on SIGNED_IN / TOKEN_REFRESHED
      // but NOT on INITIAL_SESSION — which is what fires when a persisted
      // session is restored on cold start. Without this the socket authenticates
      // as `anon`, RLS matches nothing, and the subscription goes quiet with no
      // error at all. Set it explicitly before subscribing.
      const token = await getAccessToken();
      if (!token || cancelled) return;
      await supabase.realtime.setAuth(token);
      if (cancelled) return;

      channel = supabase
        .channel('open-jobs')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'appointments',
            filter: 'status=eq.pending',
          },
          ({ new: row }) => handleInsert(row),
        )
        .subscribe();
    })();

    // The socket drops while backgrounded; reconnecting on resume avoids a
    // silently dead channel after the phone has been asleep.
    const appSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') supabase.realtime.connect();
    });

    return () => {
      cancelled = true;
      appSub.remove();
      if (channel) void supabase.removeChannel(channel);
    };
  }, [enabled, me?.role]);
}
