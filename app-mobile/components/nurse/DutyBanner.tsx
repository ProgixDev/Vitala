import { useEffect } from 'react';
import { View, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Text } from '@/components/ui';
import { shadow } from '@/constants/theme';
import { useTranslation } from '@/utils/i18n';
import { cn } from '@/utils/cn';

interface DutyBannerProps {
  online: boolean;
  waiting: number;
  onToggle: (next: boolean) => void;
}

/**
 * The nurse app's signature — a shift status you read in a glance. On duty, the
 * banner goes teal and alive (a soft pulsing beacon); off duty it falls quiet.
 * It answers the first question of every shift: am I taking work right now?
 */
export function DutyBanner({ online, waiting, onToggle }: DutyBannerProps) {
  const { t } = useTranslation();

  // Pulsing beacon — only animates while on duty.
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = online
      ? withRepeat(withTiming(1, { duration: 1700 }), -1, false)
      : withTiming(0, { duration: 200 });
  }, [online, pulse]);
  const ring = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 2.4 }],
    opacity: 0.55 * (1 - pulse.value),
  }));

  // Toggle knob slides between off (left) and on (right).
  const knob = useSharedValue(online ? 1 : 0);
  useEffect(() => {
    knob.value = withTiming(online ? 1 : 0, { duration: 200 });
  }, [online, knob]);
  const knobStyle = useAnimatedStyle(() => ({ transform: [{ translateX: knob.value * 24 }] }));

  const toggle = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggle(!online);
  };

  const subline = online
    ? waiting > 0
      ? t('nurse.duty.waiting', { count: waiting })
      : t('nurse.duty.available')
    : t('nurse.duty.offDesc');

  return (
    <View
      style={shadow.e2}
      className={cn(
        'mx-5 flex-row items-center gap-4 rounded-card p-5',
        online ? 'bg-primary' : 'border border-border bg-surface',
      )}
    >
      {/* Beacon */}
      <View className="h-3.5 w-3.5 items-center justify-center">
        {online ? (
          <Animated.View style={ring} className="absolute h-3.5 w-3.5 rounded-full bg-white" />
        ) : null}
        <View
          className={cn('h-3.5 w-3.5 rounded-full', online ? 'bg-white' : 'bg-muted-foreground')}
        />
      </View>

      <View className="flex-1">
        <Text variant="heading" className={online ? 'text-on-primary' : 'text-foreground'}>
          {online ? t('nurse.duty.on') : t('nurse.duty.off')}
        </Text>
        <Text
          variant="caption"
          numberOfLines={1}
          className={online ? 'text-on-primary' : 'text-muted-foreground'}
          style={online ? { opacity: 0.85 } : undefined}
        >
          {subline}
        </Text>
      </View>

      {/* Toggle */}
      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: online }}
        accessibilityLabel={online ? t('nurse.duty.on') : t('nurse.duty.off')}
        hitSlop={8}
        onPress={toggle}
        className={cn('h-8 w-14 justify-center rounded-full p-1', online ? 'bg-white/30' : 'bg-surface-alt')}
      >
        <Animated.View style={[knobStyle, shadow.e1]} className="h-6 w-6 rounded-full bg-white" />
      </Pressable>
    </View>
  );
}
