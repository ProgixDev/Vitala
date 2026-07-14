import type { ReactNode } from 'react';
import type { ViewProps } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  FadeInDown,
  type AnimatedProps,
} from 'react-native-reanimated';

type MotionProps = AnimatedProps<ViewProps> & {
  children?: ReactNode;
  /** Stagger offset in ms — combine with `index` for lists. */
  delay?: number;
  /** Convenience for staggering: delay becomes index * step. */
  index?: number;
  step?: number;
  duration?: number;
};

/**
 * Content fades in (with a gentle upward drift) on mount and fades out on
 * unmount. Drop it around any block to make it feel alive instead of static.
 */
export function FadeInView({
  children,
  delay,
  index,
  step = 70,
  duration = 320,
  ...rest
}: MotionProps) {
  const resolvedDelay = delay ?? (index != null ? index * step : 0);
  return (
    <Animated.View
      entering={FadeInDown.duration(duration).delay(resolvedDelay)}
      exiting={FadeOut.duration(180)}
      {...rest}
    >
      {children}
    </Animated.View>
  );
}

/** Pure cross-fade with no movement — for full-screen / overlay containers. */
export function FadeView({ children, delay = 0, duration = 300, ...rest }: MotionProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(duration).delay(delay)}
      exiting={FadeOut.duration(180)}
      {...rest}
    >
      {children}
    </Animated.View>
  );
}
