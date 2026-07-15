import { useEffect, useRef } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEventListener } from 'expo';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const SPLASH = require('../assets/vitalasplash.mp4');
/** Never let the splash hold the app hostage longer than this (load stalls, etc.). */
const MAX_MS = 8000;

/**
 * Full-screen branded splash video (`vitalasplash.mp4`) that plays once on cold
 * start, then fades into the app. Rendered `cover` over the app's own
 * background. Shown centered at a fraction of the screen (not stretched to
 * fill) so the 1080×1920 source is displayed below its native resolution and
 * stays crisp — no upscaling artifacts. Plays with sound, no controls.
 * Reduced-motion users hold on the first frame instead of playback.
 */
const SRC_RATIO = 1920 / 1080; // source is 9:16 portrait

/** Splash sits on a solid white field, in both light and dark mode. */
const SPLASH_BG = '#FFFFFF';

export function AnimatedSplash({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion();
  const { width, height } = useWindowDimensions();

  // Fit a 9:16 box within ~72% of the screen on both axes — keeps the video
  // smaller than its native pixels so it renders sharp on any device.
  const boxW = Math.min(width * 0.72, height * 0.72 / SRC_RATIO);
  const boxH = boxW * SRC_RATIO;
  const finished = useRef(false);
  const containerOpacity = useSharedValue(1);

  const player = useVideoPlayer(SPLASH, (p) => {
    p.loop = false;
    p.muted = false;
    p.volume = 1;
    if (!reduced) p.play();
  });

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    onDone();
  };

  const fadeOut = () => {
    containerOpacity.value = withTiming(
      0,
      { duration: 320, easing: Easing.in(Easing.quad) },
      (done) => {
        if (done) runOnJS(finish)();
      },
    );
  };

  // Hand off as soon as the video finishes.
  useEventListener(player, 'playToEnd', fadeOut);

  useEffect(() => {
    // Reduced motion: don't play — hold the first frame briefly, then move on.
    // Otherwise this is only a safety net in case `playToEnd` never fires.
    const t = setTimeout(fadeOut, reduced ? 900 : MAX_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  const containerStyle = useAnimatedStyle(() => ({ opacity: containerOpacity.value }));

  return (
    <Animated.View
      style={[styles.overlay, { backgroundColor: SPLASH_BG }, containerStyle]}
      pointerEvents="none"
    >
      <VideoView
        player={player}
        style={{ width: boxW, height: boxH }}
        contentFit="contain"
        nativeControls={false}
        pointerEvents="none"
      />
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
});
