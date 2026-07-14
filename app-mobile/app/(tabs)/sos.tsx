import { useEffect, useState } from 'react';
import { View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { Text, Icon, type IconName } from '@/components/ui';
import { SlideToConfirm } from '@/components/SlideToConfirm';
import { useThemeColors, type ThemeColors } from '@/constants/theme';
import { getCurrentPoint } from '@/lib/location';
import { Endpoints } from '@/lib/endpoints';
import { useTranslation } from '@/utils/i18n';
import type { EmergencyType } from '@/types';

const SPRING = LinearTransition.springify().damping(20).stiffness(190);

interface SosChannel {
  type: EmergencyType;
  icon: IconName;
  /** Resolve the channel's triage accent from the active palette. */
  accent: (c: ThemeColors) => string;
  labelKey: string;
  titleKey: string;
  descKey: string;
  etaKey: string;
}

/**
 * Triage colour coding — a panicking eye finds the right channel by hue.
 * Nurse → the app's own care teal, Ambulance → emergency red (most critical),
 * Family → a softer amber alert.
 */
const CHANNELS: SosChannel[] = [
  { type: 'nurse-alert', icon: 'medkit', accent: (c) => c.primary, labelKey: 'sos.type.nurse', titleKey: 'sos.nurse.title', descKey: 'sos.nurse.desc', etaKey: 'sos.nurse.eta' },
  { type: 'ambulance', icon: 'car-sport', accent: (c) => c.emergency, labelKey: 'sos.type.ambulance', titleKey: 'sos.ambulance.title', descKey: 'sos.ambulance.desc', etaKey: 'sos.ambulance.eta' },
  { type: 'family-alert', icon: 'people', accent: (c) => c.warning, labelKey: 'sos.type.family', titleKey: 'sos.family.title', descKey: 'sos.family.desc', etaKey: 'sos.family.eta' },
];

export default function Sos() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [selected, setSelected] = useState<EmergencyType>('nurse-alert');
  const [sending, setSending] = useState<EmergencyType | null>(null);

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
        description: t(CHANNELS.find((c) => c.type === type)!.titleKey),
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

  const selectChannel = (type: EmergencyType) => {
    if (sending) return;
    void Haptics.selectionAsync();
    setSelected(type);
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      {/* Header */}
      <View className="px-5 pt-2">
        <View className="flex-row items-center gap-2">
          <View className="h-2.5 w-2.5 rounded-full bg-emergency" />
          <Text variant="label" className="uppercase text-emergency" style={{ letterSpacing: 1.5, fontSize: 11 }}>
            {t('sos.title')}
          </Text>
        </View>
        <Text className="mt-1.5 font-display-bold text-[28px] leading-[32px] text-foreground">
          {t('sos.chooseWho')}
        </Text>
      </View>

      {/* Channel accordion */}
      <View className="flex-1 justify-center gap-3 px-5">
        {CHANNELS.map((ch) => (
          <ChannelCard
            key={ch.type}
            channel={ch}
            expanded={selected === ch.type}
            sending={sending === ch.type}
            locked={sending !== null && sending !== ch.type}
            accent={ch.accent(colors)}
            colors={colors}
            onSelect={() => selectChannel(ch.type)}
            onConfirm={() => fire(ch.type)}
          />
        ))}
      </View>

      {/* Location footer */}
      <View className="mb-3 flex-row items-center justify-center gap-2 px-5">
        <Icon name="location" size={15} color={colors.mutedForeground} />
        <Text variant="caption">{t('sos.shareLocation')}</Text>
      </View>
    </SafeAreaView>
  );
}

function ChannelCard({
  channel,
  expanded,
  sending,
  locked,
  accent,
  colors,
  onSelect,
  onConfirm,
}: {
  channel: SosChannel;
  expanded: boolean;
  sending: boolean;
  locked: boolean;
  accent: string;
  colors: ThemeColors;
  onSelect: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Animated.View
      layout={SPRING}
      style={{
        borderRadius: 26,
        borderWidth: 1.5,
        borderColor: expanded ? accent : colors.border,
        backgroundColor: expanded ? `${accent}0F` : colors.surface,
        overflow: 'hidden',
        opacity: locked ? 0.45 : 1,
      }}
    >
      <Pressable onPress={onSelect} disabled={expanded} className="flex-row items-center gap-3.5 p-4">
        {/* Icon chip with a breathing glow when open */}
        <View className="items-center justify-center" style={{ width: 52, height: 52 }}>
          {expanded ? <BreathingGlow color={accent} /> : null}
          <View
            className="items-center justify-center"
            style={{ width: 52, height: 52, borderRadius: 18, backgroundColor: expanded ? accent : `${accent}1A` }}
          >
            <Icon name={channel.icon} size={28} color={expanded ? '#FFFFFF' : accent} weight={expanded ? 'fill' : 'duotone'} />
          </View>
        </View>

        <View className="flex-1">
          <Text className="font-display-bold text-[18px] leading-[22px]" style={{ color: expanded ? accent : colors.foreground }}>
            {t(channel.titleKey)}
          </Text>
          {!expanded ? (
            <Text variant="caption" className="mt-0.5" numberOfLines={1}>
              {t(channel.descKey)}
            </Text>
          ) : null}
        </View>

        {!expanded ? (
          <View className="h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: `${accent}14` }}>
            <Icon name="chevron-forward" size={16} color={accent} weight="bold" />
          </View>
        ) : null}
      </Pressable>

      {/* Revealed detail + confirm gesture */}
      {expanded ? (
        <Animated.View entering={FadeInDown.duration(260)} exiting={FadeOut.duration(120)} className="px-4 pb-4">
          <View className="mb-3 flex-row items-center gap-2">
            <Icon name="time-outline" size={15} color={accent} />
            <Text variant="caption" style={{ color: colors.foreground }}>
              {t(channel.etaKey)}
            </Text>
          </View>
          <SlideToConfirm
            label={t('sos.slide')}
            releaseLabel={t('sos.slideRelease')}
            sendingLabel={t('sos.sending')}
            sending={sending}
            color={accent}
            icon={channel.icon}
            onConfirm={onConfirm}
          />
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

/** Slow radial breath behind the active channel's icon — a quiet "listening" pulse. */
function BreathingGlow({ color }: { color: string }) {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [pulse]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.28 }],
    opacity: 0.14 + pulse.value * 0.16,
  }));

  return (
    <Animated.View
      entering={FadeIn}
      pointerEvents="none"
      style={[
        { position: 'absolute', width: 52, height: 52, borderRadius: 26, backgroundColor: color },
        style,
      ]}
    />
  );
}
