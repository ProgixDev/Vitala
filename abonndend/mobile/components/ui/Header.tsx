import { ReactNode } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./Text";
import { IconButton } from "./IconButton";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  rightLabel?: string;
  right?: ReactNode;
  large?: boolean;
  className?: string;
}

/**
 * Standard screen header: back affordance, centered/large title, optional
 * right action. Replaces the ~20 hand-rolled header rows across screens.
 */
export function Header({
  title,
  subtitle,
  showBack = true,
  onBack,
  rightIcon,
  onRightPress,
  rightLabel,
  right,
  large = false,
  className = "",
}: HeaderProps) {
  const handleBack = () => (onBack ? onBack() : router.back());

  if (large) {
    return (
      <View className={`pt-2 pb-4 ${className}`}>
        <View className="flex-row items-center justify-between mb-3">
          {showBack ? (
            <IconButton
              icon="chevron-back"
              onPress={handleBack}
              variant="surface"
              accessibilityLabel="Go back"
            />
          ) : (
            <View className="w-11" />
          )}
          {right ??
            (rightIcon ? (
              <IconButton
                icon={rightIcon}
                onPress={onRightPress}
                variant="surface"
                accessibilityLabel={rightLabel ?? "Action"}
              />
            ) : (
              <View className="w-11" />
            ))}
        </View>
        {title && (
          <Text variant="h1" color="foreground">
            {title}
          </Text>
        )}
        {subtitle && (
          <Text variant="body" color="muted" className="mt-1">
            {subtitle}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View
      className={`flex-row items-center justify-between h-14 ${className}`}
    >
      {showBack ? (
        <IconButton
          icon="chevron-back"
          onPress={handleBack}
          accessibilityLabel="Go back"
        />
      ) : (
        <View className="w-11" />
      )}
      <View className="flex-1 items-center px-2">
        {title && (
          <Text variant="h3" color="foreground" numberOfLines={1}>
            {title}
          </Text>
        )}
        {subtitle && (
          <Text variant="caption" color="muted" numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      {right ??
        (rightIcon ? (
          <IconButton
            icon={rightIcon}
            onPress={onRightPress}
            accessibilityLabel={rightLabel ?? "Action"}
          />
        ) : (
          <View className="w-11" />
        ))}
    </View>
  );
}

export default Header;
