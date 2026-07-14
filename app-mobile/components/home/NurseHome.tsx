import { useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Text, Card, Button, Badge, Avatar, EmptyState, SkeletonList, Icon, FadeInView } from '@/components/ui';
import { AppointmentCard } from '@/components/AppointmentCard';
import { useAsync } from '@/hooks/useAsync';
import { Endpoints } from '@/lib/endpoints';
import { useSession } from '@/providers/SessionProvider';
import { useTranslation } from '@/utils/i18n';
import { useThemeColors } from '@/constants/theme';
import { formatDate, formatTime } from '@/utils/format';
import { UPCOMING_STATUSES } from '@/utils/status';
import type { Appointment } from '@/types';

export function NurseHome() {
  const { t } = useTranslation();
  const { me } = useSession();
  const colors = useThemeColors();
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const requests = useAsync<Appointment[]>(() => Endpoints.unassignedAppointments(), []);
  const mine = useAsync<Appointment[]>(() => Endpoints.appointments(), []);

  const loading = requests.loading || mine.loading;
  const refetch = async () => {
    await Promise.all([requests.refetch(), mine.refetch()]);
  };

  const pending = (requests.data ?? []).filter((a) => !dismissed.includes(a.id));
  const upcoming = (mine.data ?? [])
    .filter((a) => UPCOMING_STATUSES.includes(a.status) && a.nurse_id === me?.id)
    .sort((a, b) =>
      `${a.scheduled_date}${a.scheduled_start}`.localeCompare(`${b.scheduled_date}${b.scheduled_start}`),
    );

  const accept = async (id: string) => {
    setBusyId(id);
    try {
      await Endpoints.assignSelf(id);
      Toast.show({ type: 'success', text1: t('nurseHome.accepted') });
      await refetch();
    } catch (e) {
      Toast.show({ type: 'error', text1: t('common.somethingWrong'), text2: msg(e) });
    } finally {
      setBusyId(null);
    }
  };

  const decline = (id: string) => {
    setDismissed((d) => [...d, id]);
    Toast.show({ type: 'info', text1: t('nurseHome.declined') });
  };

  const firstName = me?.full_name?.split(' ')[0] ?? '';

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} tintColor={colors.primary} />
        }
      >
        <FadeInView index={0} className="px-5 pt-2">
          <Text variant="title">{t('nurseHome.greeting', { name: firstName })}</Text>
          <Text variant="subtitle" className="mt-1">
            {t('nurseHome.subtitle')}
          </Text>
        </FadeInView>

        {/* Requests */}
        <FadeInView index={1} className="mb-3 mt-6 px-5">
          <Text variant="heading">{t('nurseHome.requests')}</Text>
        </FadeInView>
        <View className="gap-3 px-5">
          {loading && !requests.data ? (
            <SkeletonList count={2} />
          ) : pending.length === 0 ? (
            <EmptyState
              icon="checkmark-done-outline"
              title={t('nurseHome.noRequests')}
              description={t('nurseHome.noRequestsDesc')}
            />
          ) : (
            pending.map((a, i) => (
              <FadeInView key={a.id} index={i + 2}>
              <Card className="gap-3">
                <View className="flex-row items-center justify-between">
                  <Text variant="bodyMedium" numberOfLines={1} className="flex-1">
                    {a.service?.name ?? 'Home visit'}
                  </Text>
                  {a.appointment_type === 'emergency' ? <Badge label="SOS" tone="danger" /> : null}
                </View>
                <View className="flex-row items-center gap-3">
                  <Avatar name={a.patient?.full_name} uri={a.patient?.avatar_url} size={40} />
                  <View className="flex-1">
                    <View className="flex-row items-center gap-1.5">
                      <Icon name="calendar-outline" size={13} color={colors.mutedForeground} />
                      <Text variant="caption">
                        {formatDate(a.scheduled_date)} · {formatTime(a.scheduled_start)}
                      </Text>
                    </View>
                    <View className="mt-1 flex-row items-center gap-1.5">
                      <Icon name="location-outline" size={13} color={colors.mutedForeground} />
                      <Text variant="caption" numberOfLines={1}>
                        {a.address}
                      </Text>
                    </View>
                  </View>
                </View>
                <View className="flex-row gap-3">
                  <Button
                    label={t('nurseHome.decline')}
                    variant="secondary"
                    onPress={() => decline(a.id)}
                    fullWidth={false}
                    className="flex-1"
                  />
                  <Button
                    label={t('nurseHome.accept')}
                    loading={busyId === a.id}
                    onPress={() => accept(a.id)}
                    fullWidth={false}
                    className="flex-1"
                  />
                </View>
              </Card>
              </FadeInView>
            ))
          )}
        </View>

        {/* Upcoming */}
        <FadeInView className="mb-3 mt-8 px-5">
          <Text variant="heading">{t('nurseHome.upcoming')}</Text>
        </FadeInView>
        <View className="gap-3 px-5">
          {loading && !mine.data ? (
            <SkeletonList count={2} />
          ) : upcoming.length === 0 ? (
            <EmptyState
              icon="calendar-outline"
              title={t('nurseHome.noUpcoming')}
              description={t('nurseHome.noUpcomingDesc')}
            />
          ) : (
            upcoming.map((a, i) => (
              <FadeInView key={a.id} index={i}>
                <AppointmentCard
                  appointment={a}
                  counterpart="patient"
                  onPress={() => router.push(`/appointment/${a.id}`)}
                />
              </FadeInView>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function msg(e: unknown): string {
  return e instanceof Error ? e.message : '';
}
