import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  useReducedMotion,
} from "react-native-reanimated";
import { Text } from "./Text";
import { useThemeColors } from "@/constants/theme";

/**
 * Raised center emergency indicator for the tab bar. Rendered as a
 * `tabBarIcon` (presentational only) so the tab bar owns the press/navigation
 * and accessibility — no custom pressable wrapper. Red is reserved for
 * emergencies; a subtle breathing pulse draws the eye and is disabled under
 * reduced-motion.
 */
export function SosTabButton() {
  const colors = useThemeColors();
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
      -1,
      false,
    );
  }, [pulse, reduceMotion]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.6 }],
    opacity: 0.35 * (1 - pulse.value),
  }));

  return (
    <View className="items-center justify-center" style={{ width: 64, marginTop: -22 }}>
      <View className="items-center justify-center">
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              width: 58,
              height: 58,
              borderRadius: 29,
              backgroundColor: colors.emergency,
            },
            ringStyle,
          ]}
        />
        <View
          style={{
            width: 58,
            height: 58,
            borderRadius: 29,
            backgroundColor: colors.emergency,
            borderWidth: 4,
            borderColor: colors.surface,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: colors.emergency,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 10,
          }}
        >
          <Text
            variant="label"
            weight="headingBold"
            color="onEmergency"
            style={{ letterSpacing: 1 }}
          >
            SOS
          </Text>
        </View>
      </View>
    </View>
  );
}

export default SosTabButton;
