import { View } from 'react-native';
import Constants from 'expo-constants';
import { Screen, Header, Text, Card, Divider, Icon, type IconName } from '@/components/ui';
import { BrandMark } from '@/components/BrandMark';
import { useThemeColors } from '@/constants/theme';
import { useTranslation } from '@/utils/i18n';

export default function About() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const version = Constants.expoConfig?.version ?? '1.0.0';

  const rows: { icon: IconName; label: string; value: string }[] = [
    {
      icon: 'shield-checkmark-outline',
      label: t('about.verifiedNurses'),
      value: t('about.verifiedNursesValue'),
    },
    { icon: 'lock-closed-outline', label: t('about.payments'), value: t('about.paymentsValue') },
    // Language names stay in their own language, as everyone writes them.
    { icon: 'globe-outline', label: t('about.languages'), value: 'Français · English' },
  ];

  return (
    <Screen edges={['top']}>
      <Header title={t('about.title')} />
      <View className="items-center py-8">
        <BrandMark size={64} withWordmark />
        <Text variant="subtitle" className="mt-4 px-8 text-center">
          {t('about.tagline')}
        </Text>
      </View>
      <Card elevation="e1" className="py-1">
        {rows.map((r, i) => (
          <View key={r.label}>
            {i > 0 ? <Divider /> : null}
            <View className="flex-row items-center gap-3 px-1 py-3.5">
              <Icon name={r.icon} size={19} color={colors.primary} />
              <Text variant="bodyMedium" className="flex-1">
                {r.label}
              </Text>
              <Text variant="caption">{r.value}</Text>
            </View>
          </View>
        ))}
      </Card>
      <Text variant="caption" className="mt-6 text-center text-muted-foreground">
        {t('about.version')} {version}
      </Text>
    </Screen>
  );
}
