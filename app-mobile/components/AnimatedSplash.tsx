import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Text } from '@/components/ui';
import { fonts, useThemeColors } from '@/constants/theme';

const LOGO = require('../assets/logo.png');
/** Never let the splash hold the app hostage longer than this. */
const MAX_MS = 4000;

/**
 * Full-screen animated logo that plays once on cold start, then hands off to the
 * app. Rendered natively (logo on the app's own background) rather than from a
 * fixed-aspect video, so it fills any screen crisply with no letterbox — and the
 * background matches the app for a seamless launch-screen → animation → app fade.
 */
export function AnimatedSplash({ onDone }: { onDone: () => void }) {
  const colors = useThemeColors();
  const reduced = useReducedMotion();
  const finished = useRef(false);
  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    onDone();
  };

  const logoScale = useSharedValue(reduced ? 1 : 0.82);
  const logoOpacity = useSharedValue(reduced ? 1 : 0);
  const ringScale = useSharedValue(0.6);
  const ringOpacity = useSharedValue(0);
  const wordY = useSharedValue(reduced ? 0 : 12);
  const wordOpacity = useSharedValue(reduced ? 1 : 0);
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    if (!reduced) {
      logoOpacity.value = withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) });
      logoScale.value = withTiming(1, { duration: 560, easing: Easing.out(Easing.back(1.4)) });
      ringOpacity.value = withDelay(
        160,
        withSequence(
          withTiming(0.3, { duration: 90 }),
          withTiming(0, { duration: 820, easing: Easing.out(Easing.quad) }),
        ),
      );
      ringScale.value = withDelay(160, withTiming(1.75, { duration: 900, easing: Easing.out(Easing.quad) }));
      wordOpacity.value = withDelay(380, withTiming(1, { duration: 420 }));
      wordY.value = withDelay(380, withTiming(0, { duration: 460, easing: Easing.out(Easing.cubic) }));
    }

    const hold = reduced ? 1000 : 1500;
    const t1 = setTimeout(() => {
      containerOpacity.value = withTiming(
        0,
        { duration: 320, easing: Easing.in(Easing.quad) },
        (done) => {
          if (done) runOnJS(finish)();
        },
      );
    }, hold);
    const t2 = setTimeout(finish, MAX_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  const containerStyle = useAnimatedStyle(() => ({ opacity: containerOpacity.value }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [{ scale: ringScale.value }],
  }));
  const wordStyle = useAnimatedStyle(() => ({
    opacity: wordOpacity.value,
    transform: [{ translateY: wordY.value }],
  }));

  return (
    <Animated.View
      style={[styles.overlay, { backgroundColor: colors.background }, containerStyle]}
      pointerEvents="none"
    >
      <View style={styles.center}>
        <View style={styles.logoWrap}>
          <Animated.View
            style={[styles.ring, { borderColor: colors.primary }, ringStyle]}
            pointerEvents="none"
          />
          <Animated.View style={logoStyle}>
            <Image source={LOGO} style={styles.logo} contentFit="contain" />
          </Animated.View>
        </View>
        <Animated.View style={wordStyle}>
          <Text style={[styles.word, { color: colors.foreground }]}>Vitala</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  center: { alignItems: 'center' },
  logoWrap: {
    width: 176,
    height: 176,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 88,
    borderWidth: 2,
  },
  logo: { width: 132, height: 132 },
  word: {
    fontFamily: fonts.displayBold,
    fontSize: 30,
    // Match the line box to the font size — the default body variant's
    // leading-[22px] would otherwise clip a 30px serif top & bottom.
    lineHeight: 38,
    letterSpacing: 0.5,
    textAlign: 'center',
    includeFontPadding: false,
    marginTop: 18,
  },
});
