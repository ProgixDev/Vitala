import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Text, Icon, Well } from '@/components/ui';
import { useTranslation } from '@/utils/i18n';
import { useThemeColors, shadow } from '@/constants/theme';

/**
 * Restrained emergency affordance for Home — the siren illustration in a Well,
 * an unmistakable-but-quiet red eyebrow. Urgency without shouting; the full SOS
 * flow lives on its own tab.
 */
export function SosRow() {
  const { t } = useTranslation();
  const colors = useThemeColors();

  return (
    <View className="px-5">
      <Pressable
        onPress={() => router.push('/(tabs)/sos')}
        style={shadow.e1}
        className="flex-row items-center gap-3.5 rounded-card border border-border bg-surface p-3.5 active:opacity-90"
      >
        <Well illustration="siren" size={54} radius={18} imageScale={0.66} elevated={false} />
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
          <Text variant="caption" numberOfLines={1}>
            {t('home.sosDesc')}
          </Text>
        </View>
        <Icon name="chevron-forward" size={18} color={colors.mutedForeground} />
      </Pressable>
    </View>
  );
}
