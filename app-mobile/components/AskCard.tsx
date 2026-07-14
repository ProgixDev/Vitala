import { View, Pressable } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Path } from 'react-native-svg';
import { Text } from '@/components/ui';
import { GreenPlanet } from '@/components/GreenPlanet';
import { shadow } from '@/constants/theme';
import { brand } from '@/constants/brand';

interface AskCardProps {
  title: string;
  subtitle: string;
  onPress: () => void;
  planetSize?: number;
}

/** Violet gradient card with the green "planet" — the assistant entry point. */
export function AskCard({ title, subtitle, onPress, planetSize = 104 }: AskCardProps) {
  return (
    <Pressable onPress={onPress} className="active:opacity-90">
      <View style={shadow.e2} className="overflow-hidden rounded-[24px]">
        <Svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
          <Defs>
            <LinearGradient id="askcard" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={brand.cardGradient[0]} />
              <Stop offset="1" stopColor={brand.cardGradient[1]} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#askcard)" />
          <Path d="M0 90 C120 40 240 40 400 96 L400 140 L0 140 Z" fill="#FFFFFF" opacity={0.05} />
        </Svg>

        <View className="flex-row items-center p-5" style={{ minHeight: 132 }}>
          <View className="flex-1 pr-3">
            <Text
              className="text-white"
              style={{ fontFamily: 'Fraunces_700Bold', fontSize: 22, lineHeight: 26 }}
            >
              {title}
            </Text>
            <View className="mt-3 self-start rounded-full bg-white/20 px-3 py-1.5">
              <Text variant="caption" className="font-semibold text-white">
                {subtitle}
              </Text>
            </View>
          </View>
          <GreenPlanet size={planetSize} />
        </View>
      </View>
    </Pressable>
  );
}
