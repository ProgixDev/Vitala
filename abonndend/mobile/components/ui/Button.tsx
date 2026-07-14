import { ActivityIndicator, Pressable, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Text, TextColor } from "./Text";
import { useThemeColors } from "@/constants/theme";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "emergency"
  | "danger";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  haptic?: boolean;
  className?: string;
  style?: ViewStyle;
}

// Ink-forward: primary is near-black (paper on dark), secondary a soft fill.
const container: Record<ButtonVariant, string> = {
  primary: "bg-primary",
  secondary: "bg-surface-alt",
  ghost: "bg-transparent",
  emergency: "bg-emergency",
  danger: "bg-emergency-soft",
};

const labelColor: Record<ButtonVariant, TextColor> = {
  primary: "onPrimary",
  secondary: "foreground",
  ghost: "foreground",
  emergency: "onEmergency",
  danger: "emergency",
};

const sizes: Record<ButtonSize, { h: string; px: string; text: "body" | "bodyLg" }> = {
  sm: { h: "h-11", px: "px-5", text: "body" },
  md: { h: "h-13", px: "px-6", text: "bodyLg" },
  lg: { h: "h-15", px: "px-7", text: "bodyLg" },
};

/**
 * Premium pill button. Primary is ink (luxe black in light / crisp white in
 * dark); secondary a soft neutral fill; ghost text-only. Haptic + subtle press.
 */
export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = true,
  leftIcon,
  rightIcon,
  haptic = true,
  className = "",
  style,
}: ButtonProps) {
  const colors = useThemeColors();
  const s = sizes[size];
  const isDisabled = disabled || loading;

  const iconColor =
    variant === "primary"
      ? colors.onPrimary
      : variant === "emergency"
        ? colors.onEmergency
        : variant === "danger"
          ? colors.emergency
          : colors.foreground;

  const handlePress = () => {
    if (isDisabled) return;
    if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      className={`flex-row items-center justify-center rounded-full ${s.h} ${s.px} ${
        container[variant]
      } ${fullWidth ? "w-full" : ""} ${isDisabled ? "opacity-40" : "active:opacity-90"} ${className}`}
      style={style}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} />
      ) : (
        <View className="flex-row items-center justify-center">
          {leftIcon && (
            <Ionicons name={leftIcon} size={18} color={iconColor} style={{ marginRight: 8 }} />
          )}
          <Text variant={s.text} weight="semibold" color={labelColor[variant]}>
            {label}
          </Text>
          {rightIcon && (
            <Ionicons name={rightIcon} size={18} color={iconColor} style={{ marginLeft: 8 }} />
          )}
        </View>
      )}
    </Pressable>
  );
}

export default Button;
