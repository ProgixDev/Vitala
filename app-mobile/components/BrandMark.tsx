import { View } from 'react-native';
import { Image } from 'expo-image';
import { Text } from '@/components/ui';
import { cn } from '@/utils/cn';

interface BrandMarkProps {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}

const LOGO = require('../assets/logo.png');

/** Vitala logo — the medical-cross mark, optionally with the wordmark. */
export function BrandMark({ size = 56, withWordmark = false, className }: BrandMarkProps) {
  return (
    <View className={cn('flex-row items-center gap-3', className)}>
      <Image source={LOGO} style={{ width: size, height: size }} contentFit="contain" />
      {withWordmark ? (
        <Text className="font-display-bold text-foreground" style={{ fontSize: size * 0.5 }}>
          Vitala
        </Text>
      ) : null}
    </View>
  );
}
