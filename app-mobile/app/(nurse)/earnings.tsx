import { useCallback, useMemo, useState } from 'react';
import { View, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, Badge, Icon, EmptyState, SkeletonList } from '@/components/ui';
import { useAsync } from '@/hooks/useAsync';
import { useRefetchOnFocus } from '@/hooks/useRefetchOnFocus';
import { Endpoints } from '@/lib/endpoints';
import { useSession } from '@/providers/SessionProvider';
import { useTranslation } from '@/utils/i18n';
import { useThemeColors } from '@/constants/theme';
import { nurseEarnings, periodBoundary, type EarningsPeriod } from '@/utils/earnings';
import { paymentStatusMeta } from '@/utils/status';
import { formatDate, formatPrice } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { Appointment, Payment, PaymentStatus } from '@/types';

const PERIODS: EarningsPeriod[] = ['week', 'month', 'all'];

export default function NurseEarnings() {
  const { t } = useTranslation();
  const { me } = useSession();
  const colors = useThemeColors();
  const [period, setPeriod] = useState<EarningsPeriod>('week');

  const appts = useAsync<Appointment[]>(() => Endpoints.appointments(), []);
  const txns = useAsync<Payment[]>(() => Endpoints.transactions().catch(() => []), []);

  // A visit completed elsewhere should show up in earnings straight away.
  const revalidate = useCallback(async () => {
    await Promise.all([appts.revalidate(), txns.revalidate()]);
  }, [appts.revalidate, txns.revalidate]);
  useRefetchOnFocus(revalidate);

  const earn = useMemo(() => nurseEarnings(appts.data, me?.id), [appts.data, me?.id]);
  const payMap = useMemo(() => {
    const m = new Map<string, PaymentStatus>();
    (txns.data ?? []).forEach((p) => m.set(p.appointment_id, p.status));
    return m;
  }, [txns.data]);

  const payStatusOf = (a: Appointment): PaymentStatus | undefined =>
    payMap.get(a.id) ?? a.payment?.status ?? undefined;

  // Filter to the selected period and roll up totals.
  const boundary = periodBoundary(period);
  const visits = earn.completed.filter((a) => a.scheduled_date >= boundary);
  const total = visits.reduce((s, a) => s + (a.price || 0), 0);
  const paid = visits
    .filter((a) => payStatusOf(a) === 'completed')
    .reduce((s, a) => s + (a.price || 0), 0);
  const pending = total - paid;
  const avg = visits.length ? total / visits.length : 0;

  const refetch = async () => {
    await Promise.all([appts.refetch(), txns.refetch()]);
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
        refreshControl={
          <RefreshControl refreshing={appts.loading} onRefresh={refetch} tintColor={colors.primary} />
        }
      >
        <View className="px-5 pt-2">
          <Text variant="title">{t('nurse.earnings.title')}</Text>
        </View>

        {/* Period selector */}
        <View className="mx-5 mt-4 flex-row rounded-full bg-surface-alt p-1">
          {PERIODS.map((p) => {
            const active = period === p;
            return (
              <Pressable
                key={p}
                onPress={() => setPeriod(p)}
                className={cn('flex-1 items-center justify-center rounded-full py-2.5', active && 'bg-surface')}
              >
                <Text variant="bodyMedium" className={active ? 'text-foreground' : 'text-muted-foreground'}>
                  {t(`nurse.earnings.period.${p}`)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {appts.loading && !appts.data ? (
          <View className="mt-4 px-5">
            <SkeletonList count={3} />
          </View>
        ) : (
          <>
            {/* Headline */}
            <View className="mt-4 px-5">
              <Card elevation="e2" className="gap-1">
                <Text variant="caption" className="uppercase" style={{ letterSpacing: 1.2, fontSize: 11 }}>
                  {t(`nurse.earnings.period.${period}`)}
                </Text>
                <Text variant="display">{formatPrice(total)}</Text>
                <Text variant="caption">
                  {t('nurse.earnings.visitsAvg', {
                    count: visits.length,
                    avg: formatPrice(avg),
                  })}
                </Text>
              </Card>
            </View>

            {/* Paid / awaiting split */}
            <View className="mt-3 flex-row gap-3 px-5">
              <StatTile label={t('nurse.earnings.paid')} value={formatPrice(paid)} tone="success" />
              <StatTile label={t('nurse.earnings.awaiting')} value={formatPrice(pending)} tone="warning" />
            </View>

            {/* Visits in period */}
            <View className="mb-3 mt-8 px-5">
              <Text variant="heading">{t('nurse.earnings.completed')}</Text>
            </View>
            <View className="gap-3 px-5">
              {visits.length === 0 ? (
                <Card elevation="e1">
                  <EmptyState
                    icon="pulse-outline"
                    title={t('nurse.earnings.none')}
                    description={t('nurse.earnings.noneDesc')}
                  />
                </Card>
              ) : (
                visits.map((a) => <EarningRow key={a.id} appointment={a} payStatus={payStatusOf(a)} />)
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatTile({ label, value, tone }: { label: string; value: string; tone: 'success' | 'warning' }) {
  const colors = useThemeColors();
  const dot = tone === 'success' ? colors.success : colors.warning;
  return (
    <Card elevation="e1" className="flex-1 gap-1">
      <View className="flex-row items-center gap-1.5">
        <View className="h-2 w-2 rounded-full" style={{ backgroundColor: dot }} />
        <Text variant="caption">{label}</Text>
      </View>
      <Text variant="heading">{value}</Text>
    </Card>
  );
}

function EarningRow({
  appointment: a,
  payStatus,
}: {
  appointment: Appointment;
  payStatus?: PaymentStatus | null;
}) {
  const colors = useThemeColors();
  return (
    <Card elevation="e1" className="flex-row items-center gap-3">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-soft">
        <Icon name="checkmark-circle-outline" size={20} color={colors.primary} />
      </View>
      <View className="flex-1">
        <Text variant="bodyMedium" numberOfLines={1}>
          {a.service?.name ?? 'Home visit'}
        </Text>
        <Text variant="caption">{formatDate(a.scheduled_date)}</Text>
      </View>
      <View className="items-end gap-1">
        <Text variant="bodyMedium">{formatPrice(a.price)}</Text>
        {payStatus ? (
          <Badge label={paymentStatusMeta(payStatus).label} tone={paymentStatusMeta(payStatus).tone} />
        ) : null}
      </View>
    </Card>
  );
}
