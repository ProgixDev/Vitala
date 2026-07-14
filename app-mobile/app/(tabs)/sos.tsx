import { useState } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { Text, Icon, type IconName } from '@/components/ui';
import { useThemeColors } from '@/constants/theme';
import { getCurrentPoint } from '@/lib/location';
import { Endpoints } from '@/lib/endpoints';
import { useTranslation } from '@/utils/i18n';
import { cn } from '@/utils/cn';
import type { EmergencyType } from '@/types';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const HOLD_MS = 1500;

interface SosType {
  type: EmergencyType;
  icon: IconName;
  labelKey: string;
  titleKey: string;
  descKey: string;
}

const TYPES: SosType[] = [
  { type: 'nurse-alert', icon: 'medkit', labelKey: 'sos.type.nurse', titleKey: 'sos.nurse.title', descKey: 'sos.nurse.desc' },
  { type: 'ambulance', icon: 'car-sport', labelKey: 'sos.type.ambulance', titleKey: 'sos.ambulance.title', descKey: 'sos.ambulance.desc' },
  { type: 'family-alert', icon: 'people', labelKey: 'sos.type.family', titleKey: 'sos.family.title', descKey: 'sos.family.desc' },
];

export default function Sos() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [selected, setSelected] = useState<EmergencyType>('nurse-alert');
  const [sending, setSending] = useState<EmergencyType | null>(null);

  const active = TYPES.find((x) => x.type === selected)!;

  const fire = async (type: EmergencyType) => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    if (type === 'family-alert') {
      const contacts = await Endpoints.contacts().catch(() => []);
      if (!contacts.length) {
        Toast.show({ type: 'info', text1: t('sos.needContacts'), text2: t('sos.needContactsDesc') });
        router.push('/profile/emergency-contacts');
        return;
      }
    }

    setSending(type);
    try {
      const point = await getCurrentPoint();
      if (!point) {
        Toast.show({ type: 'error', text1: t('sos.locationNeeded') });
        return;
      }
      const req = await Endpoints.raiseEmergency({
        type,
        description: t(TYPES.find((c) => c.type === type)!.titleKey),
        address: point.address,
        latitude: point.latitude,
        longitude: point.longitude,
      });
      if (type === 'family-alert') {
        Toast.show({ type: 'success', text1: t('sos.familyAlerted') });
      } else {
        Toast.show({ type: 'success', text1: t('sos.dispatched') });
        router.push(`/emergency/${req.id}`);
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: t('common.somethingWrong'), text2: e instanceof Error ? e.message : '' });
    } finally {
      setSending(null);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <View className="px-5 pt-2">
        <Text variant="title" className="text-emergency">
          {t('sos.title')}
        </Text>
        <Text variant="subtitle" className="mt-1">
          {t('sos.subtitle')}
        </Text>
      </View>

      {/* Type selector */}
      <View className="mt-6 px-5">
        <Text variant="label" className="mb-2 text-muted-foreground">
          {t('sos.selectType')}
        </Text>
        <View className="flex-row gap-2.5">
          {TYPES.map((x) => {
            const on = x.type === selected;
            return (
              <Pressable
                key={x.type}
                disabled={sending !== null}
                onPress={() => {
                  void Haptics.selectionAsync();
                  setSelected(x.type);
                }}
                className={cn(
                  'flex-1 items-center gap-2 rounded-3xl border py-4',
                  on ? 'border-emergency bg-emergency/10' : 'border-border bg-surface',
                )}
              >
                <Icon
                  name={x.icon}
                  size={26}
                  color={on ? colors.emergency : colors.mutedForeground}
                  weight={on ? 'fill' : 'regular'}
                />
                <Text
                  variant="caption"
                  className={cn('font-semibold', on ? 'text-emergency' : 'text-muted-foreground')}
                >
                  {t(x.labelKey)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Hold-to-alert hero */}
      <View className="flex-1 items-center justify-center">
        <HoldButton
          disabled={sending !== null}
          sending={sending === selected}
          color={colors.emergency}
          trackColor={colors.border}
          icon={active.icon}
          onComplete={() => fire(selected)}
        />
        <Text className="mt-8 font-display-bold text-[22px] text-foreground">
          {t(active.titleKey)}
        </Text>
        <Text variant="subtitle" className="mt-1 max-w-[280px] text-center">
          {t(active.descKey)}
        </Text>
      </View>

      {/* Location footer */}
      <View className="mb-4 flex-row items-center justify-center gap-2 px-5">
        <Icon name="location" size={16} color={colors.mutedForeground} />
        <Text variant="caption">{t('sos.shareLocation')}</Text>
      </View>
    </SafeAreaView>
  );
}

function HoldButton({
  disabled,
  sending,
  color,
  trackColor,
  icon,
  onComplete,
}: {
  disabled: boolean;
  sending: boolean;
  color: string;
  trackColor: string;
  icon: IconName;
  onComplete: () => void;
}) {
  const { t } = useTranslation();
  const SIZE = 240;
  const STROKE = 12;
  const R = (SIZE - STROKE) / 2;
  const C = 2 * Math.PI * R;

  const progress = useSharedValue(0);
  const pulse = useSharedValue(0);
  const [holding, setHolding] = useState(false);

  const start = () => {
    if (disabled) return;
    setHolding(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    pulse.value = withRepeat(withTiming(1, { duration: 1100, easing: Easing.out(Easing.ease) }), -1, false);
    progress.value = withTiming(1, { duration: HOLD_MS, easing: Easing.linear }, (finished) => {
      if (finished) {
        runOnJS(setHolding)(false);
        runOnJS(onComplete)();
        progress.value = 0;
        cancelAnimation(pulse);
        pulse.value = 0;
      }
    });
  };

  const end = () => {
    setHolding(false);
    cancelAnimation(progress);
    cancelAnimation(pulse);
    progress.value = withTiming(0, { duration: 220 });
    pulse.value = 0;
  };

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: C * (1 - progress.value),
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.35 }],
    opacity: (1 - pulse.value) * 0.35,
  }));

  const coreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - progress.value * 0.04 }],
  }));

  return (
    <View style={{ width: SIZE, height: SIZE }} className="items-center justify-center">
      {/* Pulse halo */}
      <Animated.View
        pointerEvents="none"
        style={[
          { position: 'absolute', width: SIZE, height: SIZE, borderRadius: SIZE / 2, backgroundColor: color },
          pulseStyle,
        ]}
      />

      {/* Progress ring */}
      <Svg width={SIZE} height={SIZE} style={{ position: 'absolute' }}>
        <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={trackColor} strokeWidth={STROKE} fill="none" />
        <AnimatedCircle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke={color}
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={C}
          animatedProps={ringProps}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </Svg>

      {/* Core button */}
      <Animated.View style={coreStyle}>
        <Pressable
          disabled={disabled}
          onPressIn={start}
          onPressOut={end}
          accessibilityRole="button"
          accessibilityLabel={t('sos.hold')}
          style={{ width: SIZE - 48, height: SIZE - 48, borderRadius: (SIZE - 48) / 2, backgroundColor: color }}
          className={cn('items-center justify-center', disabled && 'opacity-60')}
        >
          {sending ? (
            <>
              <ActivityIndicator color="#FFFFFF" />
              <Text className="mt-2 font-semibold text-white">{t('sos.sending')}</Text>
            </>
          ) : (
            <>
              <Icon name={icon} size={52} color="#FFFFFF" weight="fill" />
              <Text className="mt-2 font-display-bold text-[20px] text-white">SOS</Text>
              <Text className="mt-0.5 font-sans text-[12px] text-white/85">
                {holding ? t('sos.holding') : t('sos.hold')}
              </Text>
            </>
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
}
