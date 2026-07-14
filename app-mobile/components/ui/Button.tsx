import { ActivityIndicator, Pressable, View, type PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Text } from './Text';
import { Icon, type IconName } from './Icon';
import { cn } from '@/utils/cn';
import { useThemeColors } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'soft' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: IconName;
  iconRight?: IconName;
  fullWidth?: boolean;
  haptic?: boolean;
  className?: string;
}

const container: Record<Variant, string> = {
  primary: 'bg-primary',
  secondary: 'bg-surface-alt',
  soft: 'bg-primary-soft',
  ghost: 'bg-transparent',
  danger: 'bg-emergency',
};

const label: Record<Variant, string> = {
  primary: 'text-on-primary',
  secondary: 'text-foreground',
  soft: 'text-primary',
  ghost: 'text-primary',
  danger: 'text-on-emergency',
};

const sizes: Record<Size, string> = {
  sm: 'h-11 px-4',
  md: 'h-[52px] px-5',
  lg: 'h-[58px] px-6',
};

export function Button({
  label: text,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconRight,
  fullWidth = true,
  haptic = true,
  disabled,
  onPress,
  className,
  ...rest
}: ButtonProps) {
  const colors = useThemeColors();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const isDisabled = disabled || loading;
  const iconColor =
    variant === 'primary'
      ? colors.onPrimary
      : variant === 'danger'
        ? colors.onEmergency
        : colors.primary;

  return (
    <Animated.View style={[animatedStyle, fullWidth ? undefined : { alignSelf: 'flex-start' }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        disabled={isDisabled}
        onPressIn={() => {
          scale.value = withTiming(0.97, { duration: 90 });
        }}
        onPressOut={() => {
          scale.value = withTiming(1, { duration: 120 });
        }}
        onPress={(e) => {
          if (haptic) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress?.(e);
        }}
        className={cn(
          'flex-row items-center justify-center rounded-full',
          sizes[size],
          container[variant],
          isDisabled && 'opacity-50',
          className,
        )}
        {...rest}
      >
        {loading ? (
          <ActivityIndicator color={iconColor} />
        ) : (
          <View className="flex-row items-center justify-center">
            {icon ? (
              <View className="mr-2">
                <Icon name={icon} size={18} color={iconColor} weight="bold" />
              </View>
            ) : null}
            <Text variant="button" className={label[variant]}>
              {text}
            </Text>
            {iconRight ? (
              <View className="ml-2">
                <Icon name={iconRight} size={18} color={iconColor} weight="bold" />
              </View>
            ) : null}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}
