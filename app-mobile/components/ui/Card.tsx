import { View, type ViewProps } from 'react-native';
import { shadow } from '@/constants/theme';
import { cn } from '@/utils/cn';

export interface CardProps extends ViewProps {
  elevation?: 'e1' | 'e2' | 'e3' | 'flat';
  padded?: boolean;
  className?: string;
}

/** Soft, borderless floating surface — the core container of the design. */
export function Card({
  elevation = 'e1',
  padded = true,
  className,
  style,
  children,
  ...rest
}: CardProps) {
  return (
    <View
      style={[elevation === 'flat' ? undefined : shadow[elevation], style]}
      className={cn('rounded-card bg-surface', padded && 'p-5', className)}
      {...rest}
    >
      {children}
    </View>
  );
}
