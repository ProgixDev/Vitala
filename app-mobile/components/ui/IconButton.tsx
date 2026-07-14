import { Pressable, type PressableProps } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Icon, type IconName } from './Icon';
import { cn } from '@/utils/cn';
import { useThemeColors } from '@/constants/theme';

interface IconButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  icon: IconName;
  size?: number;
  variant?: 'surface' | 'ghost' | 'soft';
  color?: string;
  accessibilityLabel: string;
  className?: string;
}

export function IconButton({
  icon,
  size = 20,
  variant = 'surface',
  color,
  onPress,
  className,
  accessibilityLabel,
  ...rest
}: IconButtonProps) {
  const colors = useThemeColors();
  const bg =
    variant === 'surface' ? 'bg-surface' : variant === 'soft' ? 'bg-surface-alt' : 'bg-transparent';
  const iconColor = color ?? colors.foreground;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      onPress={(e) => {
        void Haptics.selectionAsync();
        onPress?.(e);
      }}
      className={cn(
        'h-11 w-11 items-center justify-center rounded-full active:opacity-70',
        bg,
        className,
      )}
      {...rest}
    >
      <Icon name={icon} size={size} color={iconColor} />
    </Pressable>
  );
}
