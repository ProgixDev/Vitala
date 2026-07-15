import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import Toast from 'react-native-toast-message';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { IncomingJobSheet } from '@/components/nurse/IncomingJobSheet';
import { useOpenJobsRealtime } from '@/hooks/useOpenJobsRealtime';
import { useSession } from '@/providers/SessionProvider';
import { Endpoints } from '@/lib/endpoints';
import { useTranslation } from '@/utils/i18n';
import type { Appointment } from '@/types';

interface IncomingJobValue {
  /** Present a job in the sheet — used by the realtime feed and by the list. */
  present: (job: Appointment) => void;
}

const IncomingJobContext = createContext<IncomingJobValue>({ present: () => {} });

export const useIncomingJob = () => useContext(IncomingJobContext);

const msg = (e: unknown) => (e instanceof Error ? e.message : undefined);

/**
 * Hosts the app-wide incoming-request sheet for nurses and feeds it from
 * Supabase Realtime. Only subscribes while the nurse is on duty — off duty, no
 * socket, no interruptions.
 *
 * Jobs queue rather than clobber: if two land at once the nurse decides on one
 * at a time instead of the second silently replacing the first.
 */
export function IncomingJobProvider({ children }: { children: ReactNode }) {
  const { me } = useSession();
  const { t } = useTranslation();
  const [queue, setQueue] = useState<Appointment[]>([]);

  const onDuty = me?.role === 'nurse' && (me?.nurseProfile?.is_online ?? false);
  const current = queue[0] ?? null;

  const present = useCallback((job: Appointment) => {
    setQueue((q) => (q.some((j) => j.id === job.id) ? q : [...q, job]));
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  useOpenJobsRealtime(onDuty, present);

  const drop = useCallback(
    (id: string) => setQueue((q) => q.filter((j) => j.id !== id)),
    [],
  );

  const accept = useCallback(async () => {
    if (!current) return;
    try {
      await Endpoints.assignSelf(current.id);
      drop(current.id);
      Toast.show({ type: 'success', text1: t('nurse.jobs.accepted') });
      router.push(`/appointment/${current.id}`);
    } catch (e) {
      // Most likely another nurse got there first — drop it either way, since
      // the job is no longer the nurse's to take.
      drop(current.id);
      Toast.show({
        type: 'error',
        text1: t('nurse.incoming.tooLate'),
        text2: msg(e),
      });
    }
  }, [current, drop, t]);

  const pass = useCallback(async () => {
    if (!current) return;
    const id = current.id;
    drop(id); // optimistic — the decision is the nurse's, don't make them wait
    try {
      await Endpoints.passJob(id);
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: t('common.somethingWrong'),
        text2: msg(e),
      });
    }
  }, [current, drop, t]);

  const value = useMemo<IncomingJobValue>(() => ({ present }), [present]);

  return (
    <IncomingJobContext.Provider value={value}>
      {children}
      <IncomingJobSheet
        job={current}
        onAccept={accept}
        onPass={pass}
        onDismiss={() => current && drop(current.id)}
      />
    </IncomingJobContext.Provider>
  );
}
