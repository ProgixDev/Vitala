import { useCallback, useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import { Endpoints } from '@/lib/endpoints';
import { useSession } from '@/providers/SessionProvider';
import { useTranslation } from '@/utils/i18n';

/**
 * The nurse's "on/off duty" switch — whether they're taking new visits right now.
 * Backed by the server (`nurse_profiles.is_online`) so it holds across devices and
 * restarts. Updates optimistically for a snappy toggle and reverts if the save
 * fails.
 */
export function useDutyStatus() {
  const { me, refreshMe } = useSession();
  const { t } = useTranslation();
  const serverOnline = me?.nurseProfile?.is_online ?? false;
  const [online, setOnline] = useState(serverOnline);
  const [saving, setSaving] = useState(false);

  // Keep in sync when the profile refreshes.
  useEffect(() => {
    setOnline(serverOnline);
  }, [serverOnline]);

  const setDuty = useCallback(
    async (next: boolean) => {
      setOnline(next); // optimistic
      setSaving(true);
      try {
        await Endpoints.updateNurse({ is_online: next });
        await refreshMe();
      } catch (e) {
        setOnline(!next); // revert
        Toast.show({
          type: 'error',
          text1: t('common.somethingWrong'),
          text2: e instanceof Error ? e.message : undefined,
        });
      } finally {
        setSaving(false);
      }
    },
    [refreshMe, t],
  );

  return { online, saving, setDuty };
}
