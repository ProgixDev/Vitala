import { useState } from 'react';
import { View, LayoutChangeEvent, ActivityIndicator } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Text, Icon, type IconName } from '@/components/ui';
import { shadow } from '@/constants/theme';

const TRACK_HEIGHT = 62;
const KNOB_SIZE = 54;
const PADDING = 4;
const THRESHOLD = 0.72; // fraction of travel required to confirm

type Props = {
  label: string;
  onConfirm: () => void;
  color?: string;
  /** Icon shown on the draggable knob. */
  icon?: IconName;
  /** Label swapped in once the knob passes the release threshold. */
  releaseLabel?: string;
  /** While true the track shows a spinner and the gesture is disabled. */
  sending?: boolean;
  sendingLabel?: string;
  disabled?: boolean;
};

function tick() {
  'worklet';
  runOnJS(Haptics.selectionAsync)();
}

/**
 * "Slide to alert" control. Drag the knob left → right across the track; the
 * fill floods with `color` as it travels, haptics tick at each third, and
 * releasing past the threshold fires onConfirm (snaps back otherwise). Used as
 * the deliberate, accident-resistant confirm gesture on the SOS screen.
 */
export function SlideToConfirm({
  label,
  onConfirm,
  color = '#E11D48',
  icon = 'arrow-forward',
  releaseLabel,
  sending = false,
  sendingLabel,
  disabled = false,
}: Props) {
  const [trackWidth, setTrackWidth] = useState(0);
  const translateX = useSharedValue(0);
  const lastTick = useSharedValue(0);
  const maxTravel = Math.max(trackWidth - KNOB_SIZE - PADDING * 2, 0);

  const fire = () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onConfirm();
  };

  const pan = Gesture.Pan()
    .enabled(!sending && !disabled)
    .onChange((e) => {
      const next = translateX.value + e.changeX;
      translateX.value = Math.min(Math.max(next, 0), maxTravel);
      // Haptic tick when crossing each third of the travel.
      if (maxTravel > 0) {
        const step = Math.floor((translateX.value / maxTravel) * 3);
        if (step !== lastTick.value) {
          lastTick.value = step;
          if (step > 0) tick();
        }
      }
    })
    .onEnd(() => {
      lastTick.value = 0;
      if (maxTravel > 0 && translateX.value >= maxTravel * THRESHOLD) {
        translateX.value = withTiming(maxTravel, { duration: 120 }, () => {
          runOnJS(fire)();
        });
      } else {
        translateX.value = withSpring(0, { damping: 18, stiffness: 180 });
      }
    });

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: maxTravel > 0 ? interpolate(translateX.value, [0, maxTravel * 0.55], [1, 0], Extrapolation.CLAMP) : 1,
  }));

  const releaseStyle = useAnimatedStyle(() => ({
    opacity: maxTravel > 0 ? interpolate(translateX.value, [maxTravel * THRESHOLD, maxTravel], [0, 1], Extrapolation.CLAMP) : 0,
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: translateX.value + KNOB_SIZE + PADDING,
  }));

  const onLayout = (e: LayoutChangeEvent) => setTrackWidth(e.nativeEvent.layout.width);

  return (
    <View
      onLayout={onLayout}
      style={[
        shadow.e1,
        {
          height: TRACK_HEIGHT,
          borderRadius: TRACK_HEIGHT / 2,
          backgroundColor: `${color}1F`,
          justifyContent: 'center',
          overflow: 'hidden',
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      {/* Progress fill that follows the knob */}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            backgroundColor: `${color}30`,
            borderRadius: TRACK_HEIGHT / 2,
          },
          fillStyle,
        ]}
      />

      {sending ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <ActivityIndicator color={color} />
          <Text variant="bodyMedium" style={{ color }}>
            {sendingLabel ?? label}
          </Text>
        </View>
      ) : (
        <>
          {/* Resting label */}
          <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, right: 0, alignItems: 'center' }, labelStyle]}>
            <Text variant="bodyMedium" style={{ color, marginLeft: KNOB_SIZE / 2 }}>
              {label}
            </Text>
          </Animated.View>

          {/* Release-to-send label near the end */}
          {releaseLabel ? (
            <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, right: 0, alignItems: 'center' }, releaseStyle]}>
              <Text variant="bodyMedium" style={{ color, fontWeight: '700', marginLeft: KNOB_SIZE / 2 }}>
                {releaseLabel}
              </Text>
            </Animated.View>
          ) : null}

          {/* Draggable knob */}
          <GestureDetector gesture={pan}>
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  left: PADDING,
                  width: KNOB_SIZE,
                  height: KNOB_SIZE,
                  borderRadius: KNOB_SIZE / 2,
                  backgroundColor: color,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                shadow.e2,
                knobStyle,
              ]}
            >
              <Icon name={icon} size={26} color="#FFFFFF" weight="bold" />
            </Animated.View>
          </GestureDetector>
        </>
      )}
    </View>
  );
}
