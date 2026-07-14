import { View } from 'react-native';
import { Text } from './Text';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import { useThemeColors } from '@/constants/theme';
import { cn } from '@/utils/cn';

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon = 'sparkles-outline',
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  const colors = useThemeColors();
  return (
    <View className={cn('items-center justify-center px-8 py-12', className)}>
      <Icon name={icon} size={44} color={colors.mutedForeground} />
      <Text variant="heading" className="mt-4 text-center">
        {title}
      </Text>
      {description ? (
        <Text variant="subtitle" className="mt-1 text-center">
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          variant="soft"
          fullWidth={false}
          className="mt-5"
          onPress={onAction}
        />
      ) : null}
    </View>
  );
}
