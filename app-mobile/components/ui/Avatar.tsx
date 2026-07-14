import { View } from 'react-native';
import { Image } from 'expo-image';
import { Text } from './Text';
import { cn } from '@/utils/cn';
import { initialsOf } from '@/utils/format';

interface AvatarProps {
  name?: string | null;
  uri?: string | null;
  size?: number;
  className?: string;
}

export function Avatar({ name, uri, size = 48, className }: AvatarProps) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        contentFit="cover"
        transition={200}
      />
    );
  }
  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className={cn('items-center justify-center bg-surface-alt', className)}
    >
      <Text
        className="font-display text-foreground"
        style={{ fontSize: size * 0.38 }}
      >
        {initialsOf(name)}
      </Text>
    </View>
  );
}
