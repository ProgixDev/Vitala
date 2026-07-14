import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Text } from "./Text";
import { useThemeColors } from "@/constants/theme";

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  className?: string;
}

/**
 * Pill for options / filters / removable tags. Unselected = soft neutral fill;
 * selected = ink (the premium selected state). No hard borders.
 */
export function Chip({
  label,
  selected = false,
  onPress,
  onRemove,
  icon,
  className = "",
}: ChipProps) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={() => {
        if (onPress) {
          Haptics.selectionAsync().catch(() => {});
          onPress();
        }
      }}
      className={`flex-row items-center rounded-full px-4 py-2.5 ${
        selected ? "bg-primary" : "bg-surface-alt active:opacity-80"
      } ${className}`}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={14}
          color={selected ? colors.onPrimary : colors.mutedForeground}
          style={{ marginRight: 6 }}
        />
      )}
      <Text
        variant="label"
        color={selected ? "onPrimary" : "foreground"}
        weight={selected ? "semibold" : "medium"}
      >
        {label}
      </Text>
      {onRemove && (
        <Pressable onPress={onRemove} hitSlop={8} className="ml-1.5">
          <Ionicons
            name="close"
            size={14}
            color={selected ? colors.onPrimary : colors.mutedForeground}
          />
        </Pressable>
      )}
    </Pressable>
  );
}

export default Chip;
