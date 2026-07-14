import { useState } from 'react';
import { View, LayoutChangeEvent } from 'react-native';
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
import { Text, Icon } from '@/components/ui';
import { shadow } from '@/constants/theme';

const TRACK_HEIGHT = 60;
const KNOB_SIZE = 52;
const PADDING = 4;
const THRESHOLD = 0.75; // fraction of travel required to confirm

type Props = {
  label: string;
  onConfirm: () => void;
  color?: string;
};

/**
 * iPhone-style "slide to unlock" control. Drag the knob left → right across
 * the track; releasing past the threshold fires onConfirm.
 */
export function SlideToConfirm({ label, onConfirm, color = '#E11D48' }: Props) {
  const [trackWidth, setTrackWidth] = useState(0);
  const translateX = useSharedValue(0);
  const maxTravel = Math.max(trackWidth - KNOB_SIZE - PADDING * 2, 0);

  const fire = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onConfirm();
  };

  const pan = Gesture.Pan()
    .onChange((e) => {
      const next = translateX.value + e.changeX;
      translateX.value = Math.min(Math.max(next, 0), maxTravel);
    })
    .onEnd(() => {
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
    opacity: maxTravel > 0 ? interpolate(translateX.value, [0, maxTravel], [1, 0], Extrapolation.CLAMP) : 1,
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
          backgroundColor: `${color}22`,
          justifyContent: 'center',
          overflow: 'hidden',
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
            backgroundColor: `${color}33`,
            borderRadius: TRACK_HEIGHT / 2,
          },
          fillStyle,
        ]}
      />

      {/* Centered label */}
      <Animated.View pointerEvents="none" style={[{ alignItems: 'center' }, labelStyle]}>
        <Text variant="bodyMedium" style={{ color, marginLeft: KNOB_SIZE / 2 }}>
          {label}
        </Text>
      </Animated.View>

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
            shadow.e1,
            knobStyle,
          ]}
        >
          <Icon name="chevron-forward" size={24} color="#FFFFFF" weight="bold" />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
