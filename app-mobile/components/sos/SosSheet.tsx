import { useState } from 'react';
import { Modal, View, Pressable } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { Text, Icon, type IconName } from '@/components/ui';
import { SlideToConfirm } from '@/components/SlideToConfirm';
import { shadow, useThemeColors, type ThemeColors } from '@/constants/theme';
import { getCurrentPoint } from '@/lib/location';
import { Endpoints } from '@/lib/endpoints';
import { getSosPrefs } from '@/lib/sosPrefs';
import { composeSosMessage } from '@/lib/sosMessage';
import { useSession } from '@/providers/SessionProvider';
import { useTranslation } from '@/utils/i18n';
import type { EmergencyType } from '@/types';

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
  { type: 'nurse-alert', icon: 'stethoscope', accent: (c) => c.primary, labelKey: 'sos.type.nurse', titleKey: 'sos.nurse.title', descKey: 'sos.nurse.desc', etaKey: 'sos.nurse.eta' },
  { type: 'ambulance', icon: 'siren', accent: (c) => c.emergency, labelKey: 'sos.type.ambulance', titleKey: 'sos.ambulance.title', descKey: 'sos.ambulance.desc', etaKey: 'sos.ambulance.eta' },
  { type: 'family-alert', icon: 'people', accent: (c) => c.warning, labelKey: 'sos.type.family', titleKey: 'sos.family.title', descKey: 'sos.family.desc', etaKey: 'sos.family.eta' },
];

/**
 * The SOS flow as a bottom sheet: step one picks a channel (nurse / ambulance /
 * family), step two confirms with a deliberate slide-to-alert. Opened from
 * anywhere via `useSosSheet().open()` instead of routing to a full screen.
 */
export function SosSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { me } = useSession();
  const [selected, setSelected] = useState<SosChannel | null>(null);
  const [sending, setSending] = useState(false);

  const close = () => {
    if (sending) return;
    setSelected(null);
    onClose();
  };

  const pick = (ch: SosChannel) => {
    void Haptics.selectionAsync();
    setSelected(ch);
  };

  const back = () => {
    if (sending) return;
    void Haptics.selectionAsync();
    setSelected(null);
  };

  const fire = async () => {
    if (!selected) return;
    const { type, titleKey } = selected;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    if (type === 'family-alert') {
      const contacts = await Endpoints.contacts().catch(() => []);
      if (!contacts.length) {
        Toast.show({ type: 'info', text1: t('sos.needContacts'), text2: t('sos.needContactsDesc') });
        setSelected(null);
        onClose();
        router.push('/profile/emergency-contacts');
        return;
      }
    }

    setSending(true);
    try {
      const point = await getCurrentPoint();
      if (!point) {
        Toast.show({ type: 'error', text1: t('sos.locationNeeded') });
        return;
      }
      // Family alerts carry the patient's pre-composed message + medical context;
      // other channels use the channel title.
      const description =
        type === 'family-alert' ? composeSosMessage(await getSosPrefs(), me, t) : t(titleKey);
      const req = await Endpoints.raiseEmergency({
        type,
        description,
        address: point.address,
        latitude: point.latitude,
        longitude: point.longitude,
      });
      if (type === 'family-alert') {
        Toast.show({ type: 'success', text1: t('sos.familyAlerted') });
        setSelected(null);
        onClose();
      } else {
        Toast.show({ type: 'success', text1: t('sos.dispatched') });
        setSelected(null);
        onClose();
        router.push(`/emergency/${req.id}`);
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: t('common.somethingWrong'), text2: e instanceof Error ? e.message : '' });
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View className="flex-1 justify-end">
          <Pressable className="absolute inset-0 bg-black/50" onPress={close} />
          <View
            style={[shadow.e3, { paddingBottom: (insets.bottom || 16) + 8 }]}
            className="rounded-t-[28px] bg-surface px-5 pt-3"
          >
            {/* Grabber */}
            <View className="items-center pb-1">
              <View className="h-1 w-10 rounded-full bg-border" />
            </View>

            {selected ? (
              <ConfirmStep
                channel={selected}
                accent={selected.accent(colors)}
                colors={colors}
                sending={sending}
                onBack={back}
                onConfirm={fire}
              />
            ) : (
              <PickStep colors={colors} onPick={pick} />
            )}
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

/** Step one — the three triage channels as tappable rows. */
function PickStep({ colors, onPick }: { colors: ThemeColors; onPick: (ch: SosChannel) => void }) {
  const { t } = useTranslation();

  return (
    <Animated.View entering={FadeIn.duration(180)}>
      <View className="flex-row items-center gap-2 pt-1">
        <View className="h-2.5 w-2.5 rounded-full bg-emergency" />
        <Text variant="label" className="uppercase text-emergency" style={{ letterSpacing: 1.5, fontSize: 11 }}>
          {t('sos.title')}
        </Text>
      </View>
      <Text className="mt-1.5 font-display-bold text-[26px] leading-[30px] text-foreground">
        {t('sos.chooseWho')}
      </Text>

      <View className="mt-4 gap-2.5">
        {CHANNELS.map((ch) => {
          const accent = ch.accent(colors);
          return (
            <Pressable
              key={ch.type}
              onPress={() => onPick(ch)}
              style={{ backgroundColor: accent }}
              className="flex-row items-center gap-3.5 rounded-[22px] p-3.5 active:opacity-90"
            >
              <View
                className="items-center justify-center"
                style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.22)' }}
              >
                <Icon name={ch.icon} size={26} color="#FFFFFF" weight="fill" />
              </View>
              <View className="flex-1">
                <Text className="font-display-bold text-[17px] leading-[21px]" style={{ color: '#FFFFFF' }}>
                  {t(ch.titleKey)}
                </Text>
                <Text variant="caption" className="mt-0.5" numberOfLines={1} style={{ color: 'rgba(255,255,255,0.85)' }}>
                  {t(ch.descKey)}
                </Text>
              </View>
              <View className="h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.22)' }}>
                <Icon name="chevron-forward" size={16} color="#FFFFFF" weight="bold" />
              </View>
            </Pressable>
          );
        })}
      </View>

      <View className="mt-4 flex-row items-center justify-center gap-2">
        <Icon name="location" size={15} color={colors.mutedForeground} />
        <Text variant="caption">{t('sos.shareLocation')}</Text>
      </View>
    </Animated.View>
  );
}

/** Step two — the chosen channel writ large + the slide-to-alert gesture. */
function ConfirmStep({
  channel,
  accent,
  colors,
  sending,
  onBack,
  onConfirm,
}: {
  channel: SosChannel;
  accent: string;
  colors: ThemeColors;
  sending: boolean;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Animated.View entering={FadeInDown.duration(220)}>
      <Pressable
        onPress={onBack}
        disabled={sending}
        hitSlop={8}
        className="mt-1 flex-row items-center gap-1 self-start active:opacity-70"
      >
        <Icon name="chevron-back" size={16} color={colors.mutedForeground} weight="bold" />
        <Text variant="caption">{t('common.back')}</Text>
      </Pressable>

      <View className="mt-3 items-center">
        <View
          className="items-center justify-center"
          style={{ width: 64, height: 64, borderRadius: 22, backgroundColor: accent }}
        >
          <Icon name={channel.icon} size={34} color="#FFFFFF" weight="fill" />
        </View>
        <Text className="mt-3 text-center font-display-bold text-[22px] leading-[26px]" style={{ color: accent }}>
          {t(channel.titleKey)}
        </Text>
        <Text variant="caption" className="mt-1 px-4 text-center">
          {t(channel.descKey)}
        </Text>
        <View className="mt-2 flex-row items-center gap-2">
          <Icon name="time-outline" size={15} color={accent} />
          <Text variant="caption" style={{ color: colors.foreground }}>
            {t(channel.etaKey)}
          </Text>
        </View>
      </View>

      <View className="mt-5">
        <SlideToConfirm
          label={t('sos.slide')}
          releaseLabel={t('sos.slideRelease')}
          sendingLabel={t('sos.sending')}
          sending={sending}
          color={accent}
          icon={channel.icon}
          onConfirm={onConfirm}
        />
      </View>
    </Animated.View>
  );
}
