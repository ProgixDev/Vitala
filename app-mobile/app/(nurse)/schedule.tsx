import { useState } from 'react';
import { View, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text, EmptyState, SkeletonList, Icon } from '@/components/ui';
import { AppointmentCard } from '@/components/AppointmentCard';
import { useAsync } from '@/hooks/useAsync';
import { useRefetchOnFocus } from '@/hooks/useRefetchOnFocus';
import { Endpoints } from '@/lib/endpoints';
import { useSession } from '@/providers/SessionProvider';
import { useTranslation } from '@/utils/i18n';
import { useThemeColors } from '@/constants/theme';
import { UPCOMING_STATUSES, HISTORY_STATUSES } from '@/utils/status';
import { cn } from '@/utils/cn';
import type { Appointment } from '@/types';

type Tab = 'upcoming' | 'history';

export default function NurseSchedule() {
  const { t } = useTranslation();
  const { me } = useSession();
  const colors = useThemeColors();
  const [tab, setTab] = useState<Tab>('upcoming');

  const appts = useAsync<Appointment[]>(() => Endpoints.appointments(), []);
  // A visit completed elsewhere should move to History without a manual pull.
  useRefetchOnFocus(appts.revalidate);

  const mine = (appts.data ?? [])
    .filter((a) => a.nurse_id === me?.id)
    .sort((a, b) =>
      `${a.scheduled_date}${a.scheduled_start}`.localeCompare(`${b.scheduled_date}${b.scheduled_start}`),
    );
  const upcoming = mine.filter((a) => UPCOMING_STATUSES.includes(a.status));
  const history = mine
    .filter((a) => HISTORY_STATUSES.includes(a.status))
    .reverse(); // most recent first

  const list = tab === 'upcoming' ? upcoming : history;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-5 pt-2">
        <Text variant="title">{t('nurse.schedule.title')}</Text>
        <Pressable
          onPress={() => router.push('/availability')}
          className="flex-row items-center gap-1.5 rounded-full bg-surface-alt px-3 py-2 active:opacity-80"
        >
          <Icon name="time-outline" size={16} color={colors.primary} />
          <Text variant="caption" className="font-semibold text-primary">
            {t('nurse.availability.title')}
          </Text>
        </Pressable>
      </View>

      {/* Segmented control */}
      <View className="mx-5 mt-4 flex-row rounded-full bg-surface-alt p-1">
        {(['upcoming', 'history'] as Tab[]).map((seg) => {
          const active = tab === seg;
          const count = seg === 'upcoming' ? upcoming.length : history.length;
          return (
            <Pressable
              key={seg}
              onPress={() => setTab(seg)}
              className={cn(
                'flex-1 flex-row items-center justify-center gap-1.5 rounded-full py-2.5',
                active && 'bg-surface',
              )}
            >
              <Text variant="bodyMedium" className={active ? 'text-foreground' : 'text-muted-foreground'}>
                {t(`schedule.${seg}`)}
              </Text>
              <View className={cn('rounded-full px-1.5', active ? 'bg-primary' : 'bg-border')}>
                <Text variant="caption" className={active ? 'font-semibold text-on-primary' : 'text-muted-foreground'}>
                  {count}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28, paddingTop: 16 }}
        contentContainerClassName="px-5 gap-3"
        refreshControl={
          <RefreshControl refreshing={appts.loading} onRefresh={appts.refetch} tintColor={colors.primary} />
        }
      >
        {appts.loading && !appts.data ? (
          <SkeletonList count={4} />
        ) : list.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title={tab === 'upcoming' ? t('nurse.schedule.noUpcoming') : t('nurse.schedule.noHistory')}
            description={
              tab === 'upcoming' ? t('nurse.schedule.noUpcomingDesc') : t('nurse.schedule.noHistoryDesc')
            }
          />
        ) : (
          list.map((a) => (
            <AppointmentCard
              key={a.id}
              appointment={a}
              counterpart="patient"
              onPress={() => router.push(`/appointment/${a.id}`)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
