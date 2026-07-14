import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, Badge, Button, Icon } from '@/components/ui';
import { BrandMark } from '@/components/BrandMark';
import { useSession } from '@/providers/SessionProvider';
import { useTranslation } from '@/utils/i18n';
import { useThemeColors } from '@/constants/theme';
import type { VerificationStatus } from '@/types';

export function NursePending({
  name,
  status,
}: {
  name: string;
  status: VerificationStatus;
}) {
  const { t } = useTranslation();
  const { signOut } = useSession();
  const colors = useThemeColors();

  const rejected = status === 'rejected';

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-6">
        <BrandMark size={48} />
        <View className="my-8 h-24 w-24 items-center justify-center rounded-full bg-surface-alt">
          <Icon
            name={rejected ? 'close-circle' : 'shield-checkmark'}
            size={48}
            color={rejected ? colors.emergency : colors.primary}
          />
        </View>
        <Text variant="title" className="text-center">
          {t('nurse.pending.title')}
        </Text>
        <Text variant="subtitle" className="mt-3 text-center">
          {t('nurse.pending.subtitle', { name: name.split(' ')[0] || 'there' })}
        </Text>

        <Card elevation="e1" className="mt-8 w-full flex-row items-center justify-between">
          <Text variant="bodyMedium">{t('nurse.pending.status')}</Text>
          <Badge
            label={rejected ? 'Rejected' : status === 'approved' ? 'Approved' : 'Pending'}
            tone={rejected ? 'danger' : status === 'approved' ? 'success' : 'warning'}
            dot
          />
        </Card>
      </View>

      <View className="px-6 pb-4">
        <Button label={t('profile.logout')} variant="secondary" onPress={signOut} />
      </View>
    </SafeAreaView>
  );
}
