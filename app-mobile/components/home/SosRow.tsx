import { View, Pressable } from 'react-native';
import { Text, Icon } from '@/components/ui';
import { useTranslation } from '@/utils/i18n';
import { useSosSheet } from '@/providers/SosSheetProvider';
import { shadow } from '@/constants/theme';

/**
 * Emergency affordance for Home — a fully red card with the SOS eyebrow, the
 * "Get help now" copy, and a chevron pulling the eye to the right. Opens the
 * SOS bottom sheet (channel picker → slide-to-alert).
 */
export function SosRow() {
  const { t } = useTranslation();
  const { open } = useSosSheet();

  return (
    <View className="px-5">
      <Pressable
        onPress={open}
        style={shadow.e1}
        className="flex-row items-center gap-3.5 rounded-card bg-emergency p-4 active:opacity-90"
      >
        {/* Icon chip */}
        <View
          className="h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
        >
          <Icon name="siren" size={24} color="#FFFFFF" weight="fill" />
        </View>

        <View className="flex-1">
          <Text
            variant="label"
            className="uppercase text-on-emergency"
            style={{ letterSpacing: 1.5, fontSize: 11, opacity: 0.85 }}
          >
            SOS
          </Text>
          <Text className="mt-0.5 font-bold text-[15px] text-on-emergency">
            {t('home.sosCta')}
          </Text>
        </View>

        {/* Chevron pulling the eye to the right */}
        <Icon name="chevron-forward" size={22} color="#FFFFFF" weight="bold" />
      </Pressable>
    </View>
  );
}
