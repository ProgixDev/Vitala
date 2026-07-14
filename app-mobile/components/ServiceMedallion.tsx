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

/**
 * A care service as a full-bleed image card — the category photo fills the tile,
 * a bottom scrim keeps text legible, and the name / price / duration sit over the
 * image. A category gradient sits underneath as the load + no-photo fallback.
 */
export function ServiceMedallion({ service, onPress }: ServiceMedallionProps) {
  const cover = categoryCover(service.category);
  const icon = categoryIcon(service.category);
  const imageUri = service.image_url ?? categoryImage(service.category);

  return (
    <Pressable onPress={onPress} className="w-full active:opacity-95">
      <View style={shadow.e2} className="h-48 w-full overflow-hidden rounded-card">
        {/* Colored fallback (behind the photo, shows while it loads) */}
        <LinearGradient
          colors={cover}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: 'absolute', inset: 0 }}
        />

        {/* Full-card photo */}
        <Image
          source={{ uri: imageUri }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={240}
        />

        {/* Legibility scrim — clear at top, deep at the bottom */}
        <LinearGradient
          colors={['rgba(8,15,25,0.02)', 'rgba(8,15,25,0.38)', 'rgba(8,15,25,0.86)']}
          locations={[0, 0.5, 1]}
          style={{ position: 'absolute', inset: 0 }}
        />

        {/* Category glyph chip */}
        <View className="absolute left-3 top-3 h-9 w-9 items-center justify-center rounded-xl bg-white/20">
          <Icon name={icon} size={19} color="#FFFFFF" weight="fill" />
        </View>

        {/* Overlaid details */}
        <View className="absolute inset-x-0 bottom-0 gap-1.5 p-3.5">
          <Text
            numberOfLines={2}
            className="font-display text-white"
            style={{ fontSize: 15.5, lineHeight: 19 }}
          >
            {service.name}
          </Text>
          <View className="flex-row items-center gap-2">
            <Text className="font-bold text-[13px] text-white">{formatPrice(service.price)}</Text>
            <View className="h-1 w-1 rounded-full bg-white/60" />
            <View className="flex-row items-center gap-1">
              <Icon name="time-outline" size={12} color="#FFFFFF" />
              <Text className="text-[12px] text-white/90">
                {formatDuration(service.duration_min)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
