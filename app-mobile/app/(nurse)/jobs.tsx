import { useState } from 'react';
import { View, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Text, EmptyState, SkeletonList } from '@/components/ui';
import { AppointmentCard } from '@/components/AppointmentCard';
import { RequestCard } from '@/components/nurse/RequestCard';
import { useAsync } from '@/hooks/useAsync';
import { Endpoints } from '@/lib/endpoints';
import { useSession } from '@/providers/SessionProvider';
import { useTranslation } from '@/utils/i18n';
import { useThemeColors } from '@/constants/theme';
import { cn } from '@/utils/cn';
import type { Appointment, AppointmentStatus } from '@/types';

type Tab = 'requests' | 'active';
const ACTIVE_STATUSES: AppointmentStatus[] = ['confirmed', 'on-the-way', 'in-progress'];

export default function NurseJobs() {
  const { t } = useTranslation();
  const { me } = useSession();
  const colors = useThemeColors();
  const [tab, setTab] = useState<Tab>('requests');
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const requests = useAsync<Appointment[]>(() => Endpoints.unassignedAppointments(), []);
  const mine = useAsync<Appointment[]>(() => Endpoints.appointments(), []);

  const loading = requests.loading || mine.loading;
  const refetch = async () => {
    await Promise.all([requests.refetch(), mine.refetch()]);
  };

  // Open pool — emergencies first, then soonest.
  const pending = (requests.data ?? [])
    .filter((a) => !dismissed.includes(a.id))
    .sort((a, b) => {
      const ea = a.appointment_type === 'emergency' ? 0 : 1;
      const eb = b.appointment_type === 'emergency' ? 0 : 1;
      if (ea !== eb) return ea - eb;
      return `${a.scheduled_date}${a.scheduled_start}`.localeCompare(`${b.scheduled_date}${b.scheduled_start}`);
    });

  const active = (mine.data ?? [])
    .filter((a) => a.nurse_id === me?.id && ACTIVE_STATUSES.includes(a.status))
    .sort((a, b) =>
      `${a.scheduled_date}${a.scheduled_start}`.localeCompare(`${b.scheduled_date}${b.scheduled_start}`),
    );

  const accept = async (id: string) => {
    setBusyId(id);
    try {
      await Endpoints.assignSelf(id);
      Toast.show({ type: 'success', text1: t('nurse.jobs.accepted') });
      await refetch();
      setTab('active');
    } catch (e) {
      Toast.show({ type: 'error', text1: t('common.somethingWrong'), text2: msg(e) });
    } finally {
      setBusyId(null);
    }
  };
  const decline = (id: string) => {
    setDismissed((d) => [...d, id]);
    Toast.show({ type: 'info', text1: t('nurse.jobs.declined') });
  };

  const list = tab === 'requests' ? pending : active;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="px-5 pt-2">
        <Text variant="title">{t('nurse.jobs.title')}</Text>
      </View>

      {/* Segmented control */}
      <View className="mx-5 mt-4 flex-row rounded-full bg-surface-alt p-1">
        {(['requests', 'active'] as Tab[]).map((seg) => {
          const activeTab = tab === seg;
          const count = seg === 'requests' ? pending.length : active.length;
          return (
            <Pressable
              key={seg}
              onPress={() => setTab(seg)}
              className={cn(
                'flex-1 flex-row items-center justify-center gap-1.5 rounded-full py-2.5',
                activeTab && 'bg-surface',
              )}
            >
              <Text variant="bodyMedium" className={activeTab ? 'text-foreground' : 'text-muted-foreground'}>
                {t(`nurse.jobs.${seg}`)}
              </Text>
              <View className={cn('rounded-full px-1.5', activeTab ? 'bg-primary' : 'bg-border')}>
                <Text variant="caption" className={activeTab ? 'font-semibold text-on-primary' : 'text-muted-foreground'}>
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
          <RefreshControl refreshing={loading} onRefresh={refetch} tintColor={colors.primary} />
        }
      >
        {loading && list.length === 0 ? (
          <SkeletonList count={3} />
        ) : list.length === 0 ? (
          <EmptyState
            icon={tab === 'requests' ? 'checkmark-done-outline' : 'briefcase-outline'}
            title={tab === 'requests' ? t('nurse.jobs.noRequests') : t('nurse.jobs.noActive')}
            description={tab === 'requests' ? t('nurse.jobs.noRequestsDesc') : t('nurse.jobs.noActiveDesc')}
          />
        ) : tab === 'requests' ? (
          pending.map((a) => (
            <RequestCard
              key={a.id}
              appointment={a}
              accepting={busyId === a.id}
              onAccept={() => accept(a.id)}
              onDecline={() => decline(a.id)}
            />
          ))
        ) : (
          active.map((a) => (
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

function msg(e: unknown): string {
  return e instanceof Error ? e.message : '';
}
