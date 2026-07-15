import { View } from 'react-native';
import { Image } from 'expo-image';
import { Text } from './Text';
import { Icon } from './Icon';
import { cn } from '@/utils/cn';
import { initialsOf } from '@/utils/format';
import { useThemeColors } from '@/constants/theme';

interface AvatarProps {
  name?: string | null;
  uri?: string | null;
  size?: number;
  className?: string;
  /**
   * What to draw when there's no photo. Initials suit people we expect to have
   * a name and often a picture (nurses); 'icon' suits patients, who are never
   * asked for a photo — initials for someone who'll never have an avatar just
   * reads as a missing image.
   */
  fallback?: 'initials' | 'icon';
}

export function Avatar({
  name,
  uri,
  size = 48,
  className,
  fallback = 'initials',
}: AvatarProps) {
  const colors = useThemeColors();

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
      {fallback === 'icon' ? (
        <Icon
          name="person-outline"
          size={size * 0.5}
          color={colors.mutedForeground}
        />
      ) : (
        <Text
          className="font-display text-foreground"
          style={{ fontSize: size * 0.38 }}
        >
          {initialsOf(name)}
        </Text>
      )}
    </View>
  );
}
