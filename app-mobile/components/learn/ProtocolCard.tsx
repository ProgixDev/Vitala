import { Pressable, View } from 'react-native';
import { Text, Icon } from '@/components/ui';
import { FirstAidArt } from './FirstAidArt';
import { shadow, useThemeColors } from '@/constants/theme';

interface ProtocolCardProps {
  artKind: string;
  color: string;
  title: string;
  summary: string;
  readLabel: string;
  onPress: () => void;
}

/**
 * A protocol as a tabbed divider in a field manual: a slim colored spine, a
 * duotone illustration, and a calm text block — a stack of them reads as a
 * curated set rather than a box of crayons.
 */
export function ProtocolCard({
  artKind,
  color,
  title,
  summary,
  readLabel,
  onPress,
}: ProtocolCardProps) {
  const colors = useThemeColors();
  return (
    <Pressable onPress={onPress} className="active:opacity-90">
      <View
        style={shadow.e1}
        className="flex-row items-stretch overflow-hidden rounded-card bg-surface"
      >
        {/* Colored spine — the manual-divider tab */}
        <View style={{ backgroundColor: color, width: 5 }} />

        <View className="flex-1 flex-row items-center gap-4 p-4 pl-[18px]">
          <FirstAidArt kind={artKind} color={color} size={60} />

          <View className="flex-1">
            <Text variant="bodyMedium" numberOfLines={1}>
              {title}
            </Text>
            <Text variant="caption" numberOfLines={2} className="mt-0.5">
              {summary}
            </Text>
            <View className="mt-1.5 flex-row items-center gap-1">
              <Icon name="time-outline" size={12} color={colors.mutedForeground} />
              <Text
                style={{
                  color: colors.mutedForeground,
                  fontFamily: 'HankenGrotesk_600SemiBold',
                  fontSize: 11,
                  letterSpacing: 0.2,
                }}
              >
                {readLabel}
              </Text>
            </View>
          </View>

          <Icon name="chevron-forward" size={18} color={colors.mutedForeground} />
        </View>
      </View>
    </Pressable>
  );
}
