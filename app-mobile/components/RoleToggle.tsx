import { useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Text, Icon, type IconName } from '@/components/ui';
import { useThemeColors, shadow } from '@/constants/theme';
import { useTranslation } from '@/utils/i18n';

export type AuthRole = 'patient' | 'nurse';

interface RoleToggleProps {
  value: AuthRole;
  onChange: (role: AuthRole) => void;
}

const OPTIONS: { key: AuthRole; icon: IconName; labelKey: string }[] = [
  { key: 'patient', icon: 'person-outline', labelKey: 'auth.patient' },
  { key: 'nurse', icon: 'medkit-outline', labelKey: 'auth.nurse' },
];

const PADDING = 4;
const SPRING = { damping: 20, stiffness: 220, mass: 0.7 };

function tick() {
  'worklet';
  runOnJS(Haptics.selectionAsync)();
}

/**
 * Segmented Patient / Nurse selector. A single pill slides under the active
 * option; you can tap either side or swipe the pill across, and the labels
 * cross-fade between muted and on-primary as it travels. Used in the sign-in
 * and sign-up flows.
 */
export function RoleToggle({ value, onChange }: RoleToggleProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();

  const [trackWidth, setTrackWidth] = useState(0);
  const pillWidth = trackWidth > 0 ? (trackWidth - PADDING * 2) / 2 : 0;

  const activeIndex = OPTIONS.findIndex((o) => o.key === value);
  const translateX = useSharedValue(0);
  const dragging = useSharedValue(false);
  const committed = useSharedValue(activeIndex);

  // Keep the pill in sync when the selection changes from outside a drag
  // (tap, external state) and once the track has been measured.
  useEffect(() => {
    committed.value = activeIndex;
    if (pillWidth > 0 && !dragging.value) {
      translateX.value = withSpring(activeIndex * pillWidth, SPRING);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, pillWidth]);

  const commit = (index: number) => {
    const next = OPTIONS[index].key;
    if (next !== value) onChange(next);
  };

  const select = (index: number) => {
    if (index === activeIndex) return;
    void Haptics.selectionAsync();
    if (pillWidth > 0) translateX.value = withSpring(index * pillWidth, SPRING);
    onChange(OPTIONS[index].key);
  };

  const pan = Gesture.Pan()
    .onBegin(() => {
      dragging.value = true;
    })
    .onChange((e) => {
      if (pillWidth <= 0) return;
      translateX.value = Math.min(Math.max(translateX.value + e.changeX, 0), pillWidth);
      const nearest = translateX.value > pillWidth / 2 ? 1 : 0;
      if (nearest !== committed.value) {
        committed.value = nearest;
        tick();
      }
    })
    .onFinalize(() => {
      dragging.value = false;
      if (pillWidth <= 0) return;
      const index = translateX.value > pillWidth / 2 ? 1 : 0;
      translateX.value = withSpring(index * pillWidth, SPRING);
      runOnJS(commit)(index);
    });

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const overlayStyle = (index: number) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => {
      if (pillWidth <= 0) return { opacity: index === activeIndex ? 1 : 0 };
      const p = translateX.value / pillWidth;
      return { opacity: interpolate(p, [0, 1], index === 0 ? [1, 0] : [0, 1], Extrapolation.CLAMP) };
    });

  const onLayout = (e: LayoutChangeEvent) => setTrackWidth(e.nativeEvent.layout.width);

  return (
    <GestureDetector gesture={pan}>
      <View
        onLayout={onLayout}
        className="flex-row rounded-2xl bg-surface-alt p-1"
        accessibilityRole="tablist"
      >
        {/* Sliding active pill */}
        {pillWidth > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                left: PADDING,
                top: PADDING,
                bottom: PADDING,
                width: pillWidth,
                borderRadius: 12,
                backgroundColor: colors.primary,
              },
              shadow.e1,
              pillStyle,
            ]}
          />
        ) : null}

        {OPTIONS.map((o, i) => {
          const active = value === o.key;
          return (
            <Pressable
              key={o.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => select(i)}
              className="flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3"
            >
              {/* Muted resting state */}
              <Icon name={o.icon} size={18} color={colors.mutedForeground} weight="regular" />
              <Text variant="button" className="text-muted-foreground">
                {t(o.labelKey)}
              </Text>

              {/* On-primary layer that cross-fades in as the pill arrives */}
              <Animated.View
                pointerEvents="none"
                style={[
                  { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 8 },
                  overlayStyle(i),
                ]}
              >
                <Icon name={o.icon} size={18} color={colors.onPrimary} weight="fill" />
                <Text variant="button" className="text-on-primary">
                  {t(o.labelKey)}
                </Text>
              </Animated.View>
            </Pressable>
          );
        })}
      </View>
    </GestureDetector>
  );
}
