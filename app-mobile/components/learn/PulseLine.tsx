import { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

/**
 * The signature of the First Aid Academy: a single ECG heartbeat that draws
 * itself left-to-right on mount, then rests as a calm luminous line. It's the
 * one vivid moment on the otherwise dark, quiet hero panel — the emergency
 * world distilled to a hairline. Reduced motion shows the full line instantly.
 *
 * Two beats over a 320×52 field, baseline at y=26.
 */
const D =
  'M0 26 L90 26 L100 26 L106 20 L112 30 L118 6 L126 46 L132 22 L140 26 ' +
  'L210 26 L216 20 L222 30 L228 6 L236 46 L242 22 L250 26 L320 26';

// Generous overestimate of the path length so the dash fully hides then reveals.
const LEN = 900;

interface PulseLineProps {
  color: string;
  height?: number;
}

export function PulseLine({ color, height = 52 }: PulseLineProps) {
  const reduce = useReducedMotion();
  const offset = useSharedValue(reduce ? 0 : LEN);

  useEffect(() => {
    if (reduce) return;
    offset.value = withDelay(
      260,
      withTiming(0, { duration: 1500, easing: Easing.out(Easing.cubic) }),
    );
  }, [reduce, offset]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: offset.value,
  }));

  return (
    <View style={{ width: '100%', height }}>
      <Svg
        width="100%"
        height={height}
        viewBox="0 0 320 52"
        preserveAspectRatio="none"
      >
        <Defs>
          <LinearGradient id="pulseFade" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={color} stopOpacity="0.25" />
            <Stop offset="0.18" stopColor={color} stopOpacity="1" />
            <Stop offset="0.92" stopColor={color} stopOpacity="1" />
            <Stop offset="1" stopColor={color} stopOpacity="0.15" />
          </LinearGradient>
        </Defs>

        {/* Soft glow underlay */}
        <AnimatedPath
          d={D}
          stroke={color}
          strokeWidth={7}
          strokeOpacity={0.14}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          strokeDasharray={LEN}
          animatedProps={animatedProps}
        />
        {/* Crisp signal line */}
        <AnimatedPath
          d={D}
          stroke="url(#pulseFade)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          strokeDasharray={LEN}
          animatedProps={animatedProps}
        />
      </Svg>
    </View>
  );
}
