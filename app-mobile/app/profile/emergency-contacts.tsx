import { ScrollView, View, RefreshControl, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Screen, Header, Text, Card, Badge, Button, EmptyState, SkeletonList, IconButton, Icon } from '@/components/ui';
import { useAsync } from '@/hooks/useAsync';
import { Endpoints } from '@/lib/endpoints';
import { useTranslation } from '@/utils/i18n';
import { useThemeColors } from '@/constants/theme';
import type { EmergencyContact } from '@/types';

export default function EmergencyContacts() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { data, loading, refetch } = useAsync<EmergencyContact[]>(() => Endpoints.contacts(), []);
  const list = data ?? [];

  const remove = (c: EmergencyContact) => {
    Alert.alert(t('common.delete'), c.name, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await Endpoints.deleteContact(c.id);
            Toast.show({ type: 'success', text1: t('contacts.deleted') });
            await refetch();
          } catch {
            Toast.show({ type: 'error', text1: t('common.somethingWrong') });
          }
        },
      },
    ]);
  };

  return (
    <Screen edges={['top']}>
      <Header
        title={t('contacts.title')}
        right={
          <IconButton
            icon="add"
            variant="soft"
            accessibilityLabel={t('contacts.add')}
            onPress={() => router.push('/profile/contact-form')}
          />
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-8 gap-3 px-1 pt-2"
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor={colors.primary} />}
      >
        {loading && !data ? (
          <SkeletonList count={3} />
        ) : list.length === 0 ? (
          <EmptyState
            icon="people-outline"
            title={t('contacts.none')}
            description={t('contacts.noneDesc')}
            actionLabel={t('contacts.add')}
            onAction={() => router.push('/profile/contact-form')}
          />
        ) : (
          list.map((c) => (
            <Card key={c.id} elevation="e1" className="flex-row items-center gap-3.5">
              <Icon name="person" size={26} color={colors.primary} />
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text variant="bodyMedium">{c.name}</Text>
                  {c.is_primary ? <Badge label={t('contacts.primary')} tone="success" /> : null}
                </View>
                <Text variant="caption">
                  {c.relationship} · {c.phone}
                </Text>
              </View>
              <Pressable hitSlop={6} onPress={() => router.push(`/profile/contact-form?id=${c.id}`)}>
                <Icon name="create-outline" size={20} color={colors.mutedForeground} />
              </Pressable>
              <Pressable hitSlop={6} onPress={() => remove(c)}>
                <Icon name="trash-outline" size={20} color={colors.emergency} />
              </Pressable>
            </Card>
          ))
        )}

        {list.length > 0 ? (
          <Button
            label={t('contacts.add')}
            variant="secondary"
            icon="add"
            className="mt-2"
            onPress={() => router.push('/profile/contact-form')}
          />
        ) : null}
      </ScrollView>
    </Screen>
  );
}
