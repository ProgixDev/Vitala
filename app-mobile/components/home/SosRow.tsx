import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Text, Icon, Well } from '@/components/ui';
import { useTranslation } from '@/utils/i18n';
import { shadow } from '@/constants/theme';
import { categoryImage } from '@/utils/status';

/**
 * Emergency affordance for Home — the emergency photo in a Well, a red SOS
 * eyebrow, and a red "Get help now" CTA that pulls the eye. The full SOS flow
 * lives on its own tab.
 */
export function SosRow() {
  const { t } = useTranslation();

  return (
    <View className="px-5">
      <Pressable
        onPress={() => router.push('/(tabs)/sos')}
        style={shadow.e1}
        className="flex-row items-center gap-3.5 rounded-card border border-border bg-surface p-3.5 active:opacity-90"
      >
        <Well size={54} radius={18} elevated={false} photoUri={categoryImage('emergency')} />
        <View className="flex-1">
          <Text
            variant="label"
            className="uppercase text-emergency"
            style={{ letterSpacing: 1.5, fontSize: 11 }}
          >
            SOS
          </Text>
          <Text variant="bodyMedium" className="mt-0.5">
            {t('home.sosTitle')}
          </Text>

          {/* Red CTA — the urgent, eye-catching action */}
          <View className="mt-2.5 flex-row items-center gap-1.5 self-start rounded-full bg-emergency px-3.5 py-2">
            <Text className="font-semibold text-[13px] text-on-emergency">
              {t('home.sosCta')}
            </Text>
            <Icon name="arrow-forward" size={13} color="#FFFFFF" weight="bold" />
          </View>
        </View>
      </Pressable>
    </View>
  );
}
