import { View, ScrollView, RefreshControl, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text, Card, Badge, EmptyState, SkeletonList, Divider, Icon } from '@/components/ui';
import { useCards, type StoredCard } from '@/hooks/useCards';
import { useAsync } from '@/hooks/useAsync';
import { Endpoints } from '@/lib/endpoints';
import { useTranslation } from '@/utils/i18n';
import { useThemeColors } from '@/constants/theme';
import { paymentStatusMeta } from '@/utils/status';
import { formatPrice, maskCard, formatDate } from '@/utils/format';
import type { Payment } from '@/types';

export default function PaymentTab() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { cards, loading: cardsLoading, removeCard, setDefault } = useCards();
  const txns = useAsync<Payment[]>(() => Endpoints.transactions(), []);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="px-5 pt-2">
        <Text variant="title">{t('pay.title')}</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24, paddingTop: 16 }}
        contentContainerClassName="px-5 gap-3"
        refreshControl={
          <RefreshControl refreshing={txns.loading} onRefresh={txns.refetch} tintColor={colors.primary} />
        }
      >
        {/* Saved cards */}
        <Text variant="heading">{t('pay.cards')}</Text>

        {cardsLoading ? (
          <SkeletonList count={1} />
        ) : cards.length === 0 ? (
          <EmptyState
            icon="card-outline"
            title={t('pay.noCards')}
            description={t('pay.noCardsDesc')}
            actionLabel={t('pay.addCard')}
            onAction={() => router.push('/cards/add')}
          />
        ) : (
          <>
            {cards.map((c) => (
              <CardRow
                key={c.id}
                card={c}
                onSetDefault={() => setDefault(c.id)}
                onDelete={() =>
                  Alert.alert(t('common.delete'), maskCard(c.last4), [
                    { text: t('common.cancel'), style: 'cancel' },
                    { text: t('common.delete'), style: 'destructive', onPress: () => removeCard(c.id) },
                  ])
                }
              />
            ))}
            <Pressable
              onPress={() => router.push('/cards/add')}
              className="mt-1 flex-row items-center justify-center gap-2 self-center rounded-full border border-primary px-5 py-3 active:opacity-70"
            >
              <Icon name="add" size={18} color={colors.primary} weight="bold" />
              <Text variant="button" className="text-primary">
                {t('pay.addCard')}
              </Text>
            </Pressable>
          </>
        )}

        <Divider className="my-3" />

        {/* Payment history */}
        <Text variant="heading">{t('pay.history')}</Text>
        {txns.loading && !txns.data ? (
          <SkeletonList count={3} />
        ) : (txns.data ?? []).length === 0 ? (
          <EmptyState icon="receipt-outline" title={t('pay.noHistory')} description={t('pay.noHistoryDesc')} />
        ) : (
          (txns.data ?? []).map((p) => {
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
    </SafeAreaView>
  );
}

function CardRow({
  card,
  onSetDefault,
  onDelete,
}: {
  card: StoredCard;
  onSetDefault: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  return (
    <Card elevation="e1" className="gap-3">
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-14 items-center justify-center rounded-lg bg-primary">
          <Icon name="card" size={20} color="#FFFFFF" weight="fill" />
        </View>
        <View className="flex-1">
          <Text variant="bodyMedium">
            {card.brand} · {card.last4}
          </Text>
          <Text variant="caption">{card.exp}</Text>
        </View>
        {card.isDefault ? <Badge label={t('pay.default')} tone="success" /> : null}
      </View>
      <View className="flex-row items-center gap-4">
        {!card.isDefault ? (
          <Pressable hitSlop={6} onPress={onSetDefault} className="flex-row items-center gap-1.5">
            <Icon name="star-outline" size={16} color={colors.primary} />
            <Text variant="caption" className="text-primary">
              {t('pay.setDefault')}
            </Text>
          </Pressable>
        ) : null}
        <Pressable hitSlop={6} onPress={onDelete} className="flex-row items-center gap-1.5">
          <Icon name="trash-outline" size={16} color={colors.emergency} />
          <Text variant="caption" className="text-emergency">
            {t('common.delete')}
          </Text>
        </Pressable>
      </View>
    </Card>
  );
}
