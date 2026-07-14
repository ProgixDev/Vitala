import { useState } from 'react';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';
import { Text } from './Text';
import { Icon, type IconName } from './Icon';
import { cn } from '@/utils/cn';
import { useThemeColors } from '@/constants/theme';

export interface InputProps extends TextInputProps {
  label?: string;
  icon?: IconName;
  error?: string | null;
  secure?: boolean;
  containerClassName?: string;
}

export function Input({
  label,
  icon,
  error,
  secure = false,
  containerClassName,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const colors = useThemeColors();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secure);

  return (
    <View className={cn('gap-1.5', containerClassName)}>
      {label ? <Text variant="label">{label}</Text> : null}
      <View
        className={cn(
          'flex-row items-center rounded-2xl bg-surface-alt px-4',
          focused && 'border border-primary',
          !focused && 'border border-transparent',
          error && 'border border-emergency',
        )}
      >
        {icon ? (
          <View className="mr-2.5">
            <Icon
              name={icon}
              size={19}
              color={focused ? colors.primary : colors.mutedForeground}
            />
          </View>
        ) : null}
        <TextInput
          className="h-[52px] flex-1 font-sans text-[15px] text-foreground"
          placeholderTextColor={colors.mutedForeground}
          secureTextEntry={hidden}
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
        {secure ? (
          <Pressable
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
            onPress={() => setHidden((v) => !v)}
          >
            <Icon
              name={hidden ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.mutedForeground}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text variant="caption" className="text-emergency">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
