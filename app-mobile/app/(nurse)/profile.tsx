import { View, ScrollView, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text, Card, Badge, Avatar, Divider, Chip, Icon, type IconName } from '@/components/ui';
import { MenuRow } from '@/components/MenuRow';
import { useSession } from '@/providers/SessionProvider';
import { useTranslation } from '@/utils/i18n';
import { useThemeColors } from '@/constants/theme';

export default function NurseProfile() {
  const { t } = useTranslation();
  const { me, signOut } = useSession();
  const colors = useThemeColors();
  const np = me?.nurseProfile;

  const confirmLogout = () => {
    Alert.alert(t('profile.logoutConfirm'), undefined, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('profile.logout'), style: 'destructive', onPress: signOut },
    ]);
  };

  const verified = np?.verification_status === 'approved';
  const hasReviews = (np?.total_reviews ?? 0) > 0;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
        contentContainerClassName="px-5 pt-2"
      >
        <Text variant="title">{t('profile.title')}</Text>

        {/* Header */}
        <Card elevation="e2" className="mt-4 gap-4">
          <View className="flex-row items-center gap-4">
            <Avatar name={me?.full_name} uri={me?.avatar_url} size={60} />
            <View className="flex-1">
              <Text variant="heading" numberOfLines={1}>
                {me?.full_name}
              </Text>
              <Text variant="caption" numberOfLines={1}>
                {me?.email}
              </Text>
              <View className="mt-1.5 flex-row items-center gap-2">
                <Badge label={t('profile.roleNurse')} tone="info" />
                {verified ? (
                  <Badge label={t('nurse.profile.verified')} tone="success" dot />
                ) : null}
              </View>
            </View>
          </View>

          {/* Rating */}
          <View className="flex-row items-center gap-2 border-t border-border pt-4">
            <Icon name="star" size={18} color={colors.warning} weight="fill" />
            <Text variant="bodyMedium">
              {hasReviews ? (np?.rating ?? 0).toFixed(1) : t('nurse.profile.new')}
            </Text>
            <Text variant="caption">
              {t('nurse.profile.reviews', { count: np?.total_reviews ?? 0 })}
            </Text>
          </View>
        </Card>

        {/* Credentials */}
        <View className="mb-3 mt-6 flex-row items-center justify-between">
          <Text variant="heading">{t('nurse.profile.credentials')}</Text>
          <Pressable
            onPress={() => router.push('/nurse-credentials')}
            hitSlop={8}
            className="flex-row items-center gap-1 active:opacity-70"
          >
            <Icon name="create-outline" size={15} color={colors.primary} />
            <Text variant="label" className="text-primary">
              {t('common.edit')}
            </Text>
          </Pressable>
        </View>
        <Card elevation="e1" className="gap-3.5">
          <Row
            icon="shield-checkmark-outline"
            label={t('nurse.license')}
            value={np?.license_number || '—'}
          />
          <Divider />
          <Row
            icon="ribbon-outline"
            label={t('nurse.experience')}
            value={
              np?.experience_years != null
                ? t('nurse.profile.years', { count: np.experience_years })
                : '—'
            }
          />
          {np?.specializations && np.specializations.length > 0 ? (
            <>
              <Divider />
              <View className="gap-2">
                <Text variant="caption">{t('nurse.specializations')}</Text>
                <View className="flex-row flex-wrap gap-2">
                  {np.specializations.map((s) => (
                    <Chip key={s} label={s} />
                  ))}
                </View>
              </View>
            </>
          ) : null}
        </Card>

        {/* Reviews */}
        <Card elevation="e1" className="mt-4 py-1">
          <MenuRow
            icon="star-outline"
            label={t('nurse.reviews.title')}
            sublabel={t('nurse.profile.reviews', { count: np?.total_reviews ?? 0 })}
            onPress={() => router.push('/nurse-reviews')}
          />
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

function Row({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  const colors = useThemeColors();
  return (
    <View className="flex-row items-center gap-3">
      <Icon name={icon} size={20} color={colors.mutedForeground} />
      <Text variant="bodyMedium" className="flex-1">
        {label}
      </Text>
      <Text variant="bodyMedium" numberOfLines={1} className="max-w-[55%] text-muted-foreground">
        {value}
      </Text>
    </View>
  );
}
