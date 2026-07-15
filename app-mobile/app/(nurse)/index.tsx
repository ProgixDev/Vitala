import { useCallback, useState } from 'react';
import { View, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import {
  Text,
  Card,
  Badge,
  Avatar,
  Icon,
  EmptyState,
  SkeletonList,
  FadeInView,
} from '@/components/ui';
import { AppointmentCard } from '@/components/AppointmentCard';
import { DutyBanner } from '@/components/nurse/DutyBanner';
import { RequestCard } from '@/components/nurse/RequestCard';
import { useAsync } from '@/hooks/useAsync';
import { useDutyStatus } from '@/hooks/useDutyStatus';
import { Endpoints } from '@/lib/endpoints';
import { useSession } from '@/providers/SessionProvider';
import { useTranslation } from '@/utils/i18n';
import { useThemeColors } from '@/constants/theme';
import { UPCOMING_STATUSES, appointmentStatusMeta } from '@/utils/status';
import { useRefetchOnFocus } from '@/hooks/useRefetchOnFocus';
import { nurseEarnings } from '@/utils/earnings';
import { formatDate, formatTime, formatPrice } from '@/utils/format';
import type { Appointment } from '@/types';

export default function NurseToday() {
  const { t } = useTranslation();
  const { me } = useSession();
  const colors = useThemeColors();
  const { online, setDuty } = useDutyStatus();
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const requests = useAsync<Appointment[]>(() => Endpoints.unassignedAppointments(), []);
  const mine = useAsync<Appointment[]>(() => Endpoints.appointments(), []);

  const loading = requests.loading || mine.loading;
  const refetch = async () => {
    await Promise.all([requests.refetch(), mine.refetch()]);
  };

  // Coming back from the visit screen (where a visit may have just been
  // completed) must not leave a stale "next visit" on screen.
  const revalidate = useCallback(async () => {
    await Promise.all([requests.revalidate(), mine.revalidate()]);
  }, [requests.revalidate, mine.revalidate]);
  useRefetchOnFocus(revalidate);

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const hour = now.getHours();
  const greetKey = hour < 12 ? 'nurse.today.morning' : hour < 18 ? 'nurse.today.afternoon' : 'nurse.today.evening';
  const firstName = me?.full_name?.split(' ')[0] ?? '';

  const assigned = (mine.data ?? []).filter((a) => a.nurse_id === me?.id);
  const upcoming = assigned
    .filter((a) => UPCOMING_STATUSES.includes(a.status))
    .sort((a, b) =>
      `${a.scheduled_date}${a.scheduled_start}`.localeCompare(`${b.scheduled_date}${b.scheduled_start}`),
    );
  const next = upcoming[0];
  const todays = upcoming.filter((a) => a.scheduled_date === todayStr);
  const pending = (requests.data ?? []).filter((a) => !dismissed.includes(a.id));
  const preview = pending.slice(0, 2);
  const earn = nurseEarnings(mine.data, me?.id, now);

  const accept = async (id: string) => {
    setBusyId(id);
    try {
      await Endpoints.assignSelf(id);
      Toast.show({ type: 'success', text1: t('nurse.jobs.accepted') });
      await refetch();
    } catch (e) {
      Toast.show({ type: 'error', text1: t('common.somethingWrong'), text2: msg(e) });
    } finally {
      setBusyId(null);
    }
  };
  // Optimistic pass — see the note in (nurse)/jobs.tsx.
  const decline = async (id: string) => {
    setDismissed((d) => [...d, id]);
    Toast.show({ type: 'info', text1: t('nurse.jobs.declined') });
    try {
      await Endpoints.passJob(id);
    } catch (e) {
      setDismissed((d) => d.filter((x) => x !== id));
      Toast.show({ type: 'error', text1: t('common.somethingWrong'), text2: msg(e) });
    }
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} tintColor={colors.primary} />
        }
      >
        {/* Greeting */}
        <FadeInView index={0} className="px-5 pb-4 pt-2">
          <Text variant="title">{t(greetKey, { name: firstName })}</Text>
          <Text variant="subtitle" className="mt-1">
            {formatDate(todayStr)}
          </Text>
        </FadeInView>

        {/* Signature: duty status */}
        <FadeInView index={1}>
          <DutyBanner online={online} waiting={pending.length} onToggle={setDuty} />
        </FadeInView>

        {/* Next visit */}
        <FadeInView index={2} className="mb-3 mt-8 px-5">
          <Text variant="heading">{t('nurse.today.nextVisit')}</Text>
        </FadeInView>
        <View className="px-5">
          {loading && !mine.data ? (
            <SkeletonList count={1} />
          ) : next ? (
            <NextVisit appointment={next} />
          ) : (
            <Card elevation="e1">
              <EmptyState
                icon="calendar-outline"
                title={t('nurse.today.noNext')}
                description={online ? t('nurse.today.noNextDesc') : t('nurse.today.offHint')}
              />
            </Card>
          )}
        </View>

        {/* Today's visits — only when there's more than the "next" one */}
        {todays.length > 1 ? (
          <>
            <View className="mb-3 mt-8 px-5">
              <Text variant="heading">{t('nurse.today.today')}</Text>
            </View>
            <View className="gap-3 px-5">
              {todays.map((a) => (
                <AppointmentCard
                  key={a.id}
                  appointment={a}
                  counterpart="patient"
                  onPress={() => router.push(`/appointment/${a.id}`)}
                />
              ))}
            </View>
          </>
        ) : null}

        {/* Waiting requests preview */}
        <View className="mb-3 mt-8 flex-row items-center justify-between px-5">
          <Text variant="heading">{t('nurse.today.requests')}</Text>
          {pending.length > 0 ? (
            <Pressable onPress={() => router.navigate('/(nurse)/jobs')} hitSlop={8}>
              <Text variant="label" className="text-primary">
                {t('common.seeAll')}
              </Text>
            </Pressable>
          ) : null}
        </View>
        <View className="gap-3 px-5">
          {loading && !requests.data ? (
            <SkeletonList count={2} />
          ) : preview.length === 0 ? (
            <Card elevation="e1">
              <EmptyState
                icon="checkmark-done-outline"
                title={t('nurse.today.noRequests')}
                description={t('nurse.today.noRequestsDesc')}
              />
            </Card>
          ) : (
            preview.map((a) => (
              <RequestCard
                key={a.id}
                appointment={a}
                accepting={busyId === a.id}
                onAccept={() => accept(a.id)}
                onDecline={() => decline(a.id)}
              />
            ))
          )}
        </View>

        {/* Earnings snapshot */}
        <View className="mt-8 px-5">
          <Pressable onPress={() => router.navigate('/(nurse)/earnings')}>
            <Card elevation="e1" className="flex-row items-center gap-4">
              <View className="h-11 w-11 items-center justify-center rounded-full bg-primary-soft">
                <Icon name="pulse-outline" size={22} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text variant="caption">{t('nurse.today.thisWeek')}</Text>
                <Text variant="heading">{formatPrice(earn.weekTotal)}</Text>
              </View>
              <View className="items-end">
                <Text variant="caption">{t('common.today')}</Text>
                <Text variant="bodyMedium">{formatPrice(earn.todayTotal)}</Text>
              </View>
              <Icon name="chevron-forward" size={18} color={colors.mutedForeground} />
            </Card>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** The soonest assigned visit — the nurse's next commitment, tap to run it. */
function NextVisit({ appointment: a }: { appointment: Appointment }) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const status = appointmentStatusMeta(a.status);
  return (
    <Pressable onPress={() => router.push(`/appointment/${a.id}`)}>
      <Card elevation="e2" className="gap-3.5">
        <View className="flex-row items-center justify-between">
          <Text variant="heading">
            {formatDate(a.scheduled_date)} · {formatTime(a.scheduled_start)}
          </Text>
          <Badge label={status.label} tone={status.tone} dot />
        </View>
        <View className="flex-row items-center gap-3">
          <Avatar
            name={a.patient?.full_name}
            uri={a.patient?.avatar_url}
            size={44}
            fallback="icon"
          />
          <View className="flex-1">
            <Text variant="bodyMedium" numberOfLines={1}>
              {a.patient?.full_name ?? t('nurse.jobs.patient')}
            </Text>
            <View className="mt-0.5 flex-row items-center gap-1.5">
              <Icon name="location-outline" size={13} color={colors.mutedForeground} />
              <Text variant="caption" numberOfLines={1} className="flex-1">
                {a.location_label || a.address}
              </Text>
            </View>
          </View>
          <Icon name="chevron-forward" size={18} color={colors.mutedForeground} />
        </View>
      </Card>
    </Pressable>
  );
}

function msg(e: unknown): string {
  return e instanceof Error ? e.message : '';
}
