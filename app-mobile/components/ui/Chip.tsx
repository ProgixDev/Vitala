import { Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Text } from './Text';
import { cn } from '@/utils/cn';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  className?: string;
}

/** Soft fill when unselected, solid primary when selected. */
export function Chip({ label, selected = false, onPress, className }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={
        onPress
          ? () => {
              void Haptics.selectionAsync();
              onPress();
            }
          : undefined
      }
      className={cn(
        'rounded-full px-4 py-2 active:opacity-80',
        selected ? 'bg-primary' : 'bg-surface-alt',
        className,
      )}
    >
      <Text
        variant="caption"
        className={cn('font-semibold', selected ? 'text-on-primary' : 'text-foreground')}
      >
        {label}
      </Text>
    </Pressable>
  );
}
