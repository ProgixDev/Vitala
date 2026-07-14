import { useMemo } from 'react';
import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Text, Icon, Well, Skeleton } from '@/components/ui';
import { useAsync } from '@/hooks/useAsync';
import { Endpoints } from '@/lib/endpoints';
import { useTranslation } from '@/utils/i18n';
import { useThemeColors, shadow } from '@/constants/theme';
import { UPCOMING_STATUSES, categoryImage } from '@/utils/status';
import { formatDate, formatTime } from '@/utils/format';
import type { Appointment } from '@/types';

/**
 * The concierge card — the home screen's functional anchor. Surfaces your next
 * upcoming visit; when you have none it renders nothing (booking lives in the
 * hero carousel). The appointment photo sits in the page's signature Well frame.
 */
export function ConciergeCard() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { data, loading } = useAsync<Appointment[]>(() => Endpoints.appointments(), []);

  const next = useMemo(() => {
    const upcoming = (data ?? [])
      .filter((a) => UPCOMING_STATUSES.includes(a.status))
      .sort((a, b) =>
        `${a.scheduled_date} ${a.scheduled_start}`.localeCompare(
          `${b.scheduled_date} ${b.scheduled_start}`,
        ),
      );
    return upcoming[0];
  }, [data]);

  if (loading && !data) {
    return (
      <View className="px-5">
        <Skeleton width="100%" height={132} radius={28} />
      </View>
    );
  }

  // No upcoming visit — nothing to anchor; the carousel handles booking.
  if (!next) return null;

  return (
    <View className="px-5">
      <Pressable
        onPress={() => router.push(`/appointment/${next.id}`)}
        style={shadow.e2}
        className="flex-row items-center gap-4 overflow-hidden rounded-card border border-border bg-surface p-5 active:opacity-90"
      >
        <View className="flex-1">
          <Text
            variant="label"
            className="uppercase text-primary"
            style={{ letterSpacing: 1.5, fontSize: 11 }}
          >
            {t('home.nextVisit')}
          </Text>
          <Text variant="heading" numberOfLines={1} className="mt-1.5">
            {`${formatDate(next.scheduled_date)} · ${formatTime(next.scheduled_start)}`}
          </Text>
          <Text variant="caption" numberOfLines={1} className="mt-1">
            {next.location_label || next.address}
          </Text>

          <View className="mt-4 flex-row items-center gap-1.5 self-start rounded-full bg-primary px-3.5 py-2">
            <Text variant="caption" className="font-semibold text-on-primary">
              {t('home.viewDetails')}
            </Text>
            <Icon name="arrow-forward" size={14} color={colors.onPrimary} weight="bold" />
          </View>
        </View>

        <Well size={92} radius={24} photoUri={categoryImage('elderly-care')} />
      </Pressable>
    </View>
  );
}
