import { useState } from "react";
import { TextInput, TextInputProps, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./Text";
import { fonts, useThemeColors } from "@/constants/theme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  required?: boolean;
  containerClassName?: string;
}

/**
 * Labeled text field with a focus ring, error-below-field, helper text and a
 * 44pt+ touch height. The shared base for all form inputs (incl. PasswordInput).
 */
export function Input({
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  onRightIconPress,
  required,
  containerClassName = "",
  style,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const colors = useThemeColors();
  const [focused, setFocused] = useState(false);

  // Filled, borderless field; a thin ink ring appears only on focus.
  const fieldClass = error
    ? "bg-surface-alt border border-emergency"
    : focused
      ? "bg-surface border border-foreground"
      : "bg-surface-alt border border-transparent";

  return (
    <View className={containerClassName}>
      {label && (
        <View className="flex-row mb-2">
          <Text variant="label" color="foreground">
            {label}
          </Text>
          {required && (
            <Text variant="label" color="emergency" className="ml-0.5">
              *
            </Text>
          )}
        </View>
      )}

      <View
        className={`flex-row items-center rounded-2xl px-4 h-14 ${fieldClass}`}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={focused ? colors.foreground : colors.mutedForeground}
            style={{ marginRight: 10 }}
          />
        )}
        <TextInput
          className="flex-1 text-foreground"
          placeholderTextColor={colors.mutedForeground}
          style={[{ fontFamily: fonts.regular, fontSize: 15 }, style]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {rightIcon && (
          <Pressable onPress={onRightIconPress} hitSlop={8} className="pl-2">
            <Ionicons name={rightIcon} size={20} color={colors.mutedForeground} />
          </Pressable>
        )}
      </View>

      {error ? (
        <Text variant="caption" color="emergency" className="mt-1.5 ml-1">
          {error}
        </Text>
      ) : helper ? (
        <Text variant="caption" color="muted" className="mt-1.5 ml-1">
          {helper}
        </Text>
      ) : null}
    </View>
  );
}

export default Input;
