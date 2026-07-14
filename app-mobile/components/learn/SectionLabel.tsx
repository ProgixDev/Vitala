import { View } from 'react-native';
import { Text } from '@/components/ui';
import { useThemeColors } from '@/constants/theme';

/** Tracked-out uppercase eyebrow — the structural label system of the academy. */
export function SectionLabel({ children }: { children: string }) {
  const colors = useThemeColors();
  return (
    <View className="flex-row items-center gap-2">
      <View style={{ backgroundColor: colors.primary, width: 14, height: 2 }} />
      <Text
        style={{
          color: colors.primary,
          fontFamily: 'HankenGrotesk_700Bold',
          fontSize: 11,
          letterSpacing: 1.6,
        }}
      >
        {children.toUpperCase()}
      </Text>
    </View>
  );
}
