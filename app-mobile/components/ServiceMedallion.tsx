import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, Icon } from '@/components/ui';
import { shadow } from '@/constants/theme';
import { categoryIcon, categoryCover, categoryImage } from '@/utils/status';
import { formatPrice, formatDuration } from '@/utils/format';
import type { Service } from '@/types';

interface ServiceMedallionProps {
  service: Service;
  onPress: () => void;
}

export function ServiceMedallion({ service, onPress }: ServiceMedallionProps) {
  const cover = categoryCover(service.category);
  const icon = categoryIcon(service.category);
  const imageUri = service.image_url ?? categoryImage(service.category);

  return (
    <Pressable onPress={onPress} className="w-full active:opacity-90">
      <View
        style={shadow.e1}
        className="overflow-hidden rounded-card border border-border bg-surface"
      >
        {/* Cover */}
        <View className="h-24 w-full">
          {/* Colored backdrop (also the no-photo fallback) */}
          <LinearGradient
            colors={cover}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ position: 'absolute', inset: 0 }}
          />
          {/* Decorative oversized category glyph */}
          <View pointerEvents="none" className="absolute -bottom-3 -right-2 opacity-25">
            <Icon name={icon} size={76} color="#FFFFFF" weight="fill" />
          </View>

          <Image
            source={{ uri: imageUri }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={220}
          />

          {/* Legibility scrim */}
          <LinearGradient
            colors={['transparent', 'rgba(8,15,25,0.28)']}
            style={{ position: 'absolute', inset: 0 }}
          />

          {/* Category icon chip */}
          <View className="absolute left-3 top-3 h-9 w-9 items-center justify-center rounded-xl bg-white/25">
            <Icon name={icon} size={19} color="#FFFFFF" weight="fill" />
          </View>

          {/* Duration pill */}
          <View className="absolute bottom-2.5 right-2.5 flex-row items-center gap-1 rounded-full bg-black/30 px-2.5 py-1">
            <Icon name="time-outline" size={12} color="#FFFFFF" />
            <Text className="font-semibold text-[11px] text-white">
              {formatDuration(service.duration_min)}
            </Text>
          </View>
        </View>

        {/* Body */}
        <View className="p-4">
          <Text variant="bodyMedium" numberOfLines={1}>
            {service.name}
          </Text>
          <Text variant="caption" numberOfLines={2} className="mt-0.5 h-8">
            {service.description}
          </Text>
          <View className="mt-2">
            <Text variant="label" className="text-primary">
              {formatPrice(service.price)}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
