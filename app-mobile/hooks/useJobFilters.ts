import { useCallback, useState } from 'react';
import Toast from 'react-native-toast-message';
import { Endpoints } from '@/lib/endpoints';
import { useSession } from '@/providers/SessionProvider';
import { useTranslation } from '@/utils/i18n';

/**
 * The nurse's open-pool filters, persisted on their profile so they survive a
 * reinstall and follow them between devices.
 *
 * The filters are applied client-side (see utils/jobFilters.ts) — the server
 * still offers the whole pool. Worth knowing: push notifications therefore
 * ignore these, so a nurse can be pinged about a job the list would filter out.
 */
export function useJobFilters() {
  const { me, refreshMe } = useSession();
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);

  const np = me?.nurseProfile;
  // No radius set means no distance limit — the nurse has to opt into one.
  const radiusKm = np?.max_radius_km ?? null;
  const categories = np?.job_categories ?? [];

  const save = useCallback(
    async (next: { radiusKm: number | null; categories: string[] }) => {
      setSaving(true);
      try {
        await Endpoints.updateNurse({
          max_radius_km: next.radiusKm,
          job_categories: next.categories,
        });
        await refreshMe();
        return true;
      } catch (e) {
        Toast.show({
          type: 'error',
          text1: t('common.somethingWrong'),
          text2: e instanceof Error ? e.message : undefined,
        });
        return false;
      } finally {
        setSaving(false);
      }
    },
    [refreshMe, t],
  );

  return { radiusKm, categories, saving, save };
}
