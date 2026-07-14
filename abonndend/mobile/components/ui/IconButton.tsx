import { Pressable, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useThemeColors } from "@/constants/theme";

interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  size?: number;
  variant?: "plain" | "surface" | "soft";
  color?: string;
  accessibilityLabel: string;
  haptic?: boolean;
  className?: string;
  style?: ViewStyle;
}

/**
 * Round, accessible icon button with a 44pt touch area (via hitSlop + min
 * size). Always requires an accessibilityLabel — no unlabeled icon buttons.
 */
export function IconButton({
  icon,
  onPress,
  size = 22,
  variant = "plain",
  color,
  accessibilityLabel,
  haptic = false,
  className = "",
  style,
}: IconButtonProps) {
  const colors = useThemeColors();
  const bg =
    variant === "surface"
      ? "bg-surface-alt"
      : variant === "soft"
        ? "bg-surface-alt"
        : "";

  return (
    <Pressable
      onPress={() => {
        if (haptic) Haptics.selectionAsync().catch(() => {});
        onPress?.();
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      className={`w-11 h-11 items-center justify-center rounded-full active:opacity-70 ${bg} ${className}`}
      style={style}
    >
      <Ionicons name={icon} size={size} color={color ?? colors.foreground} />
    </Pressable>
  );
}

export default IconButton;
