import { useMemo, useState } from 'react';
import { View, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text, Chip, EmptyState, SkeletonList } from '@/components/ui';
import { AppointmentCard } from '@/components/AppointmentCard';
import { useAsync } from '@/hooks/useAsync';
import { Endpoints } from '@/lib/endpoints';
import { useSession } from '@/providers/SessionProvider';
import { useTranslation } from '@/utils/i18n';
import { useThemeColors } from '@/constants/theme';
import { UPCOMING_STATUSES, HISTORY_STATUSES } from '@/utils/status';
import { cn } from '@/utils/cn';
import type { Appointment, Payment, PaymentStatus } from '@/types';

type Tab = 'upcoming' | 'history';
const STATUS_FILTERS = ['all', 'completed', 'cancelled'] as const;
const PAY_FILTERS = ['all', 'completed', 'pending', 'failed'] as const;

export default function Schedule() {
  const { t } = useTranslation();
  const { me } = useSession();
  const colors = useThemeColors();
  const [tab, setTab] = useState<Tab>('upcoming');
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>('all');
  const [payFilter, setPayFilter] = useState<(typeof PAY_FILTERS)[number]>('all');

  const appts = useAsync<Appointment[]>(() => Endpoints.appointments(), []);
  const txns = useAsync<Payment[]>(() => Endpoints.transactions().catch(() => []), []);

  const counterpart = me?.role === 'nurse' ? 'patient' : 'nurse';

  const payMap = useMemo(() => {
    const m = new Map<string, PaymentStatus>();
    (txns.data ?? []).forEach((p) => m.set(p.appointment_id, p.status));
    return m;
  }, [txns.data]);

  const all = appts.data ?? [];
  const upcoming = all.filter((a) => UPCOMING_STATUSES.includes(a.status));
  const history = all.filter((a) => HISTORY_STATUSES.includes(a.status));

  const filteredHistory = history.filter((a) => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (payFilter !== 'all') {
      const p = payMap.get(a.id) ?? a.payment?.status;
      if (p !== payFilter) return false;
    }
    return true;
  });

  const list = tab === 'upcoming' ? upcoming : filteredHistory;
  const loading = appts.loading;

  const refetch = async () => {
    await Promise.all([appts.refetch(), txns.refetch()]);
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="px-5 pt-2">
        <Text variant="title">{t('schedule.title')}</Text>
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

      {/* History filters */}
      {tab === 'history' ? (
        <View className="mt-4 gap-2">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 px-5">
            {STATUS_FILTERS.map((f) => (
              <Chip
                key={f}
                label={f === 'all' ? t('schedule.filterAll') : t(`status.step.${f === 'completed' ? 'completed' : 'cancelled'}`)}
                selected={statusFilter === f}
                onPress={() => setStatusFilter(f)}
              />
            ))}
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 px-5">
            {PAY_FILTERS.map((f) => (
              <Chip
                key={f}
                label={f === 'all' ? t('schedule.filterPayment') : t(`pay.status.${f}`)}
                selected={payFilter === f}
                onPress={() => setPayFilter(f)}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24, paddingTop: 16 }}
        contentContainerClassName="px-5 gap-3"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} tintColor={colors.primary} />
        }
      >
        {loading && !appts.data ? (
          <SkeletonList count={4} />
        ) : list.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title={tab === 'upcoming' ? t('schedule.noUpcoming') : t('schedule.noHistory')}
            description={tab === 'upcoming' ? t('schedule.noUpcomingDesc') : t('schedule.noHistoryDesc')}
            actionLabel={tab === 'upcoming' && me?.role !== 'nurse' ? t('home.services') : undefined}
            onAction={tab === 'upcoming' && me?.role !== 'nurse' ? () => router.navigate('/(tabs)') : undefined}
          />
        ) : (
          list.map((a) => (
            <AppointmentCard
              key={a.id}
              appointment={a}
              counterpart={counterpart}
              paymentStatus={payMap.get(a.id) ?? a.payment?.status}
              onPress={() => router.push(`/appointment/${a.id}`)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
