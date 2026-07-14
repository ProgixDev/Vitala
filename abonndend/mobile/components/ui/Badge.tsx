import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./Text";
import { useThemeColors } from "@/constants/theme";

export type BadgeTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "emergency";

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Quiet status style: a colored dot + text, no fill. */
  dot?: boolean;
  className?: string;
}

const tones: Record<
  BadgeTone,
  {
    bg: string;
    text: "foreground" | "muted" | "primary" | "accent" | "warning" | "emergency";
    iconKey: "mutedForeground" | "primary" | "accent" | "warning" | "emergency";
  }
> = {
  neutral: { bg: "bg-surface-alt", text: "muted", iconKey: "mutedForeground" },
  primary: { bg: "bg-primary-soft", text: "foreground", iconKey: "primary" },
  success: { bg: "bg-accent-soft", text: "accent", iconKey: "accent" },
  warning: { bg: "bg-warning-soft", text: "warning", iconKey: "warning" },
  emergency: { bg: "bg-emergency-soft", text: "emergency", iconKey: "emergency" },
};

/** Status pill. `dot` gives a quiet dot+text status; otherwise a soft fill. */
export function Badge({ label, tone = "neutral", icon, dot, className = "" }: BadgeProps) {
  const colors = useThemeColors();
  const t = tones[tone];

  if (dot) {
    return (
      <View className={`flex-row items-center self-start ${className}`}>
        <View
          className="w-1.5 h-1.5 rounded-full mr-1.5"
          style={{ backgroundColor: colors[t.iconKey] }}
        />
        <Text variant="caption" weight="semibold" color="muted">
          {label}
        </Text>
      </View>
    );
  }

  return (
    <View
      className={`flex-row items-center self-start rounded-full px-2.5 py-1 ${t.bg} ${className}`}
    >
      {icon && (
        <Ionicons name={icon} size={12} color={colors[t.iconKey]} style={{ marginRight: 4 }} />
      )}
      <Text variant="caption" weight="semibold" color={t.text}>
        {label}
      </Text>
    </View>
  );
}

export default Badge;
