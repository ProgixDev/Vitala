import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Text, Icon, Well } from '@/components/ui';
import { useTranslation } from '@/utils/i18n';
import { shadow } from '@/constants/theme';
import { categoryImage } from '@/utils/status';

/**
 * Emergency affordance for Home — a fully red SOS card that pulls the eye. The
 * emergency photo sits in a Well, the SOS eyebrow and title read in white, and
 * a chevron on the right signals the tap into the full SOS flow (its own tab).
 */
export function SosRow() {
  const { t } = useTranslation();

  return (
    <View className="px-5">
      <Pressable
        onPress={() => router.push('/(tabs)/sos')}
        style={shadow.e2}
        className="flex-row items-center gap-3.5 rounded-card bg-emergency p-3.5 active:opacity-90"
      >
        <Well size={54} radius={18} elevated={false} photoUri={categoryImage('emergency')} />
        <View className="flex-1">
          <Text
            variant="label"
            className="uppercase text-on-emergency/80"
            style={{ letterSpacing: 1.5, fontSize: 11 }}
          >
            SOS
          </Text>
          <Text variant="bodyMedium" className="mt-0.5 text-on-emergency">
            {t('home.sosTitle')}
          </Text>
        </View>

        {/* Chevron affordance — the whole red card is the CTA */}
        <View className="h-9 w-9 items-center justify-center rounded-full bg-on-emergency/15">
          <Icon name="chevron-forward" size={18} color="#FFFFFF" weight="bold" />
        </View>
      </Pressable>
    </View>
  );
}
