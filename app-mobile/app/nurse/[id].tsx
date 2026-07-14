import { View, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Screen, Header, Text, Card, Badge, Avatar, EmptyState, SkeletonList, Icon } from '@/components/ui';
import { useAsync } from '@/hooks/useAsync';
import { Endpoints } from '@/lib/endpoints';
import { useTranslation } from '@/utils/i18n';
import { useThemeColors } from '@/constants/theme';
import { timeAgo } from '@/utils/format';
import type { Review } from '@/types';

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  const colors = useThemeColors();
  return (
    <View className="flex-row">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(rating);
        return (
          <Icon
            key={n}
            name="star"
            size={size}
            weight={filled ? 'fill' : 'regular'}
            color={filled ? colors.warning : colors.mutedForeground}
          />
        );
      })}
    </View>
  );
}

export default function NurseProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();

  const nurses = useAsync(() => Endpoints.nurses().catch(() => []), []);
  const reviews = useAsync<Review[]>(() => Endpoints.nurseReviews(id).catch(() => []), [id]);

  const nurse = (nurses.data ?? []).find((n) => n.id === id);
  const list = reviews.data ?? [];
  const avg = list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : nurse?.nurseProfile?.rating ?? 0;

  return (
    <Screen edges={['top']}>
      <Header title={t('profile.roleNurse')} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-4 px-1 pb-8 pt-2">
        <Card elevation="e2" className="items-center gap-2 py-6">
          <Avatar name={nurse?.full_name} uri={nurse?.avatar_url} size={84} />
          <Text variant="heading">{nurse?.full_name ?? 'Nurse'}</Text>
          <View className="flex-row items-center gap-2">
            <Stars rating={avg} />
            <Text variant="caption">
              {avg.toFixed(1)} ({nurse?.nurseProfile?.total_reviews ?? list.length})
            </Text>
          </View>
          {nurse?.nurseProfile?.experience_years ? (
            <Badge label={`${nurse.nurseProfile.experience_years} yrs experience`} tone="info" />
          ) : null}
          {nurse?.nurseProfile?.specializations?.length ? (
            <View className="mt-2 flex-row flex-wrap justify-center gap-2">
              {nurse.nurseProfile.specializations.map((s) => (
                <View key={s} className="rounded-full bg-surface-alt px-3 py-1">
                  <Text variant="caption" className="text-foreground">
                    {s}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </Card>

        <Text variant="heading" className="px-1">
          Reviews
        </Text>
        {reviews.loading && !reviews.data ? (
          <SkeletonList count={3} />
        ) : list.length === 0 ? (
          <EmptyState icon="star-outline" title="No reviews yet" />
        ) : (
          list.map((r) => (
            <Card key={r.id} elevation="e1" className="gap-2">
              <View className="flex-row items-center gap-3">
                <Avatar name={r.patient?.full_name} uri={r.patient?.avatar_url} size={36} />
                <View className="flex-1">
                  <Text variant="bodyMedium">{r.patient?.full_name ?? 'Patient'}</Text>
                  <Text variant="caption">{timeAgo(r.created_at)}</Text>
                </View>
                <Stars rating={r.rating} size={14} />
              </View>
              {r.comment ? <Text variant="body">{r.comment}</Text> : null}
              {r.nurse_response ? (
                <View className="ml-3 border-l-2 border-border pl-3">
                  <Text variant="caption" className="text-muted-foreground">
                    Nurse response
                  </Text>
                  <Text variant="caption">{r.nurse_response}</Text>
                </View>
              ) : null}
            </Card>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}
