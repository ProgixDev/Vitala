import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./Text";
import { Button } from "./Button";
import { useThemeColors } from "@/constants/theme";

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: "neutral" | "error";
  className?: string;
}

/**
 * Friendly empty/error placeholder: soft icon medallion, title, guidance copy
 * and an optional CTA. Used for empty lists and load failures.
 */
export function EmptyState({
  icon = "sparkles-outline",
  title,
  message,
  actionLabel,
  onAction,
  tone = "neutral",
  className = "",
}: EmptyStateProps) {
  const colors = useThemeColors();
  const isError = tone === "error";
  return (
    <View className={`items-center justify-center px-8 py-12 ${className}`}>
      <View
        className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${
          isError ? "bg-emergency-soft" : "bg-primary-soft"
        }`}
      >
        <Ionicons
          name={isError ? "alert-circle-outline" : icon}
          size={30}
          color={isError ? colors.emergency : colors.primary}
        />
      </View>
      <Text variant="h3" color="foreground" className="text-center">
        {title}
      </Text>
      {message && (
        <Text variant="body" color="muted" className="text-center mt-1.5">
          {message}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button
          label={actionLabel}
          onPress={onAction}
          variant={isError ? "primary" : "secondary"}
          fullWidth={false}
          size="sm"
          className="mt-5 px-6"
        />
      )}
    </View>
  );
}

export default EmptyState;
