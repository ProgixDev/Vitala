import { useEffect } from "react";
import { View, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { shadow } from "@/constants/theme";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  radius?: number;
  className?: string;
  style?: ViewStyle;
}

/** Single shimmering placeholder block. */
export function Skeleton({
  width = "100%",
  height = 16,
  radius = 8,
  className = "",
  style,
}: SkeletonProps) {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      className={`bg-surface-alt ${className}`}
      style={[
        { width: width as any, height, borderRadius: radius },
        animatedStyle,
        style,
      ]}
    />
  );
}

/** A stack of card-shaped skeletons for list loading states. */
export function SkeletonList({
  count = 4,
  itemHeight = 96,
}: {
  count?: number;
  itemHeight?: number;
}) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          className="bg-surface rounded-[28px] p-5 mb-3 flex-row items-center"
          style={shadow.e1}
        >
          <Skeleton width={48} height={48} radius={16} />
          <View className="flex-1 ml-3">
            <Skeleton width="60%" height={14} />
            <View className="h-2" />
            <Skeleton width="40%" height={12} />
          </View>
        </View>
      ))}
    </View>
  );
}

export default Skeleton;
