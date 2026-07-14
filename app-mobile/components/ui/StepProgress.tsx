import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';
import { cn } from '@/utils/cn';

type Tone = 'default' | 'onDark';

interface StepProgressProps {
  total: number;
  current: number; // 1-based
  tone?: Tone;
  className?: string;
}

/** Segmented progress bar for multi-step wizards. */
export function StepProgress({ total, current, tone = 'default', className }: StepProgressProps) {
  return (
    <View className={cn('flex-row gap-1.5', className)}>
      {Array.from({ length: total }).map((_, i) => (
        <Segment key={i} active={i < current} tone={tone} />
      ))}
    </View>
  );
}

function Segment({ active, tone }: { active: boolean; tone: Tone }) {
  const progress = useSharedValue(active ? 1 : 0);
  useEffect(() => {
    progress.value = withTiming(active ? 1 : 0, { duration: 300 });
  }, [active, progress]);
  const style = useAnimatedStyle(() => ({ opacity: 0.25 + progress.value * 0.75 }));
  const activeColor = tone === 'onDark' ? 'bg-white' : 'bg-primary';
  const inactiveColor = tone === 'onDark' ? 'bg-white/40' : 'bg-surface-alt';
  return (
    <Animated.View
      style={style}
      className={cn('h-1.5 flex-1 rounded-full', active ? activeColor : inactiveColor)}
    />
  );
}
