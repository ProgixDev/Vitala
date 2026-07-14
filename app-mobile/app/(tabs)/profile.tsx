import { View, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text, Card, Badge, Avatar, Divider } from '@/components/ui';
import { MenuRow } from '@/components/MenuRow';
import { useSession } from '@/providers/SessionProvider';
import { useTranslation } from '@/utils/i18n';

export default function Profile() {
  const { t } = useTranslation();
  const { me, signOut } = useSession();

  const confirmLogout = () => {
    Alert.alert(t('profile.logoutConfirm'), undefined, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('profile.logout'), style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        contentContainerClassName="px-5 pt-2"
      >
        <Text variant="title">{t('profile.title')}</Text>

        {/* Profile header */}
        <Card elevation="e2" className="mt-4 flex-row items-center gap-4">
          <Avatar name={me?.full_name} uri={me?.avatar_url} size={60} />
          <View className="flex-1">
            <Text variant="heading" numberOfLines={1}>
              {me?.full_name}
            </Text>
            <Text variant="caption" numberOfLines={1}>
              {me?.email}
            </Text>
            <Badge
              label={me?.role === 'nurse' ? t('profile.roleNurse') : t('profile.rolePatient')}
              tone={me?.role === 'nurse' ? 'info' : 'primary'}
              className="mt-1.5"
            />
          </View>
        </Card>

        {/* Account */}
        <Card elevation="e1" className="mt-4 py-1">
          <MenuRow icon="person-outline" label={t('profile.myProfile')} onPress={() => router.push('/profile/edit')} />
          <Divider />
          <MenuRow icon="lock-closed-outline" label={t('profile.changePassword')} onPress={() => router.push('/profile/change-password')} />
          <Divider />
          <MenuRow icon="settings-outline" label={t('profile.settings')} onPress={() => router.push('/profile/settings')} />
          <Divider />
          <MenuRow icon="notifications-outline" label={t('profile.notifications')} onPress={() => router.push('/profile/notifications')} />
        </Card>

        {/* Activity */}
        <Card elevation="e1" className="mt-4 py-1">
          <MenuRow icon="receipt-outline" label={t('profile.transactions')} onPress={() => router.push('/profile/transactions')} />
          <Divider />
          <MenuRow icon="people-outline" label={t('profile.emergencyContacts')} onPress={() => router.push('/profile/emergency-contacts')} />
        </Card>

        {/* Support */}
        <Card elevation="e1" className="mt-4 py-1">
          <MenuRow icon="help-circle-outline" label={t('profile.faq')} onPress={() => router.push('/profile/faq')} />
          <Divider />
          <MenuRow icon="information-circle-outline" label={t('profile.about')} onPress={() => router.push('/profile/about')} />
        </Card>

        {/* Logout */}
        <Card elevation="e1" className="mt-4 py-1">
          <MenuRow icon="log-out-outline" label={t('profile.logout')} danger right="none" onPress={confirmLogout} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
