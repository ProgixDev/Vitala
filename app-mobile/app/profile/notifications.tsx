import { View, ScrollView, RefreshControl, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Screen, Header, Text, Card, EmptyState, SkeletonList, Icon, type IconName } from '@/components/ui';
import { useAsync } from '@/hooks/useAsync';
import { Endpoints } from '@/lib/endpoints';
import { useTranslation } from '@/utils/i18n';
import { useThemeColors } from '@/constants/theme';
import { timeAgo } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { AppNotification, NotificationType } from '@/types';

const typeIcon: Record<NotificationType, IconName> = {
  appointment: 'calendar-outline',
  payment: 'card-outline',
  message: 'chatbubble-outline',
  emergency: 'alert-circle-outline',
  system: 'information-circle-outline',
  promotion: 'pricetag-outline',
  verification: 'shield-checkmark-outline',
};

export default function Notifications() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { data, loading, refetch, setData } = useAsync<AppNotification[]>(
    () => Endpoints.notifications(),
    [],
  );

  const list = data ?? [];
  const hasUnread = list.some((n) => !n.is_read);

  const markAll = async () => {
    setData((prev) => (prev ? prev.map((n) => ({ ...n, is_read: true })) : prev));
    await Endpoints.markAllRead().catch(() => undefined);
  };

  const open = async (n: AppNotification) => {
    if (!n.is_read) {
      setData((prev) => (prev ? prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)) : prev));
      await Endpoints.markRead(n.id).catch(() => undefined);
    }
    if (n.related_appointment) router.push(`/appointment/${n.related_appointment}`);
  };

  return (
    <Screen edges={['top']}>
      <Header
        title={t('notif.title')}
        right={
          hasUnread ? (
            <Pressable hitSlop={8} onPress={markAll}>
              <Text variant="caption" className="font-semibold text-primary">
                {t('notif.markAll')}
              </Text>
            </Pressable>
          ) : undefined
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-8 gap-3 px-1 pt-2"
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor={colors.primary} />}
      >
        {loading && !data ? (
          <SkeletonList count={4} />
        ) : list.length === 0 ? (
          <EmptyState icon="notifications-outline" title={t('notif.empty')} description={t('notif.emptyDesc')} />
        ) : (
          list.map((n) => (
            <Pressable key={n.id} onPress={() => open(n)}>
              <Card elevation="e1" className={cn('flex-row items-start gap-3.5', !n.is_read && 'bg-surface-alt')}>
                <Icon name={typeIcon[n.type] ?? 'notifications-outline'} size={24} color={colors.primary} />
                <View className="flex-1">
                  <Text variant="bodyMedium" numberOfLines={1}>
                    {n.title}
                  </Text>
                  <Text variant="caption" numberOfLines={2}>
                    {n.message}
                  </Text>
                  <Text variant="caption" className="mt-1 text-muted-foreground">
                    {timeAgo(n.created_at)}
                  </Text>
                </View>
                {!n.is_read ? <View className="mt-1 h-2 w-2 rounded-full bg-primary" /> : null}
              </Card>
            </Pressable>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}
