import { Pressable, View, ViewProps } from "react-native";
import { shadow } from "@/constants/theme";

interface CardProps extends ViewProps {
  onPress?: () => void;
  elevation?: "none" | "e1" | "e2" | "e3";
  padded?: boolean;
  /** Flat inset surface (no shadow, subtle fill) instead of a floating card. */
  inset?: boolean;
  className?: string;
}

/**
 * Soft floating surface — the signature of the premium look. Borderless,
 * large-radius, resting on the paper background via a soft diffuse shadow.
 * Use `inset` for nested muted panels that shouldn't float.
 */
export function Card({
  onPress,
  elevation = "e1",
  padded = true,
  inset = false,
  className = "",
  style,
  children,
  ...rest
}: CardProps) {
  const base = inset
    ? `bg-surface-alt rounded-2xl ${padded ? "p-5" : ""} ${className}`
    : `bg-surface rounded-[28px] ${padded ? "p-5" : ""} ${className}`;
  const shadowStyle = inset || elevation === "none" ? undefined : shadow[elevation];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className={`${base} active:opacity-95`}
        style={[shadowStyle, style]}
        {...(rest as any)}
      >
        {children}
      </Pressable>
    );
  }
  return (
    <View className={base} style={[shadowStyle, style]} {...rest}>
      {children}
    </View>
  );
}

export default Card;
