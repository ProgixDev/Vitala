import { View } from 'react-native';
import { Text, Icon } from '@/components/ui';
import { shadow } from '@/constants/theme';
import { cn } from '@/utils/cn';

interface BrandMarkProps {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}

/** Vitala logo: a rounded "pulse" tile + optional wordmark. */
export function BrandMark({ size = 56, withWordmark = false, className }: BrandMarkProps) {
  return (
    <View className={cn('flex-row items-center gap-3', className)}>
      <View
        style={[{ width: size, height: size, borderRadius: size * 0.32 }, shadow.e2]}
        className="items-center justify-center bg-primary"
      >
        <Icon name="pulse" size={size * 0.56} color="#FFFFFF" />
      </View>
      {withWordmark ? (
        <Text className="font-display-bold text-foreground" style={{ fontSize: size * 0.5 }}>
          Vitala
        </Text>
      ) : null}
    </View>
  );
}
