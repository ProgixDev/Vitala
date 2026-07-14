import { ScrollView, View, RefreshControl } from 'react-native';
import { Screen, Header, Text, Card, Badge, EmptyState, SkeletonList, Icon } from '@/components/ui';
import { useAsync } from '@/hooks/useAsync';
import { Endpoints } from '@/lib/endpoints';
import { useTranslation } from '@/utils/i18n';
import { useThemeColors } from '@/constants/theme';
import { paymentStatusMeta } from '@/utils/status';
import { formatPrice, formatDate } from '@/utils/format';
import type { Payment } from '@/types';

export default function Transactions() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { data, loading, refetch } = useAsync<Payment[]>(() => Endpoints.transactions(), []);
  const list = data ?? [];

  return (
    <Screen edges={['top']}>
      <Header title={t('profile.transactions')} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-8 gap-3 px-1 pt-2"
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor={colors.primary} />}
      >
        {loading && !data ? (
          <SkeletonList count={4} />
        ) : list.length === 0 ? (
          <EmptyState icon="receipt-outline" title={t('pay.noHistory')} description={t('pay.noHistoryDesc')} />
        ) : (
          list.map((p) => {
            const meta = paymentStatusMeta(p.status);
            return (
              <Card key={p.id} elevation="e1" className="flex-row items-center gap-3.5">
                <Icon name={meta.icon} size={26} color={colors.primary} />
                <View className="flex-1">
                  <Text variant="bodyMedium" numberOfLines={1}>
                    {p.appointment?.service?.name ?? 'Home visit'}
                  </Text>
                  <Text variant="caption">{formatDate(p.created_at.slice(0, 10))}</Text>
                </View>
                <View className="items-end gap-1">
                  <Text variant="bodyMedium">{formatPrice(p.amount, p.currency)}</Text>
                  <Badge label={meta.label} tone={meta.tone} />
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
    </Screen>
  );
}
