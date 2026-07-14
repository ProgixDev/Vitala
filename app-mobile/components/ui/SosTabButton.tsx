import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Text } from './Text';
import { shadow } from '@/constants/theme';

interface SosTabButtonProps {
  focused: boolean;
  onPress: () => void;
}

/** Raised, pulsing emergency-red center tab action. */
export function SosTabButton({ onPress }: SosTabButtonProps) {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 1600 }), -1, false);
  }, [pulse]);

  const ring = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.4 }],
    opacity: 0.35 * (1 - pulse.value),
  }));

  return (
    <View className="w-20 items-center" pointerEvents="box-none">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Emergency SOS"
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPress();
        }}
        className="items-center"
        style={{ marginTop: -26 }}
      >
        <View className="items-center justify-center">
          <Animated.View
            style={ring}
            className="absolute h-16 w-16 rounded-full bg-emergency"
          />
          <View
            style={shadow.e2}
            className="h-16 w-16 items-center justify-center rounded-full bg-emergency"
          >
            <Ionicons name="add" size={34} color="#FFFFFF" />
          </View>
        </View>
        <Text variant="caption" className="mt-1 font-semibold text-emergency">
          SOS
        </Text>
      </Pressable>
    </View>
  );
}
