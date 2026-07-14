import type { ReactNode } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Text } from './Text';
import { IconButton } from './IconButton';
import { cn } from '@/utils/cn';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  right?: ReactNode;
  className?: string;
}

export function Header({
  title,
  subtitle,
  showBack = true,
  onBack,
  right,
  className,
}: HeaderProps) {
  return (
    <View className={cn('flex-row items-center gap-3 px-5 pb-2 pt-1', className)}>
      {showBack ? (
        <IconButton
          icon="chevron-back"
          variant="surface"
          accessibilityLabel="Go back"
          onPress={() => (onBack ? onBack() : router.back())}
        />
      ) : null}
      <View className="flex-1">
        {title ? (
          <Text variant="heading" numberOfLines={1}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text variant="caption" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}
