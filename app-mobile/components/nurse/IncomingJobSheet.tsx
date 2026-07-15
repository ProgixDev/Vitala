import { useEffect, useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Text, Button, Badge, Avatar, Icon, type IconName } from '@/components/ui';
import { SlideToConfirm } from '@/components/SlideToConfirm';
import { shadow, useThemeColors } from '@/constants/theme';
import { useTranslation } from '@/utils/i18n';
import { formatDate, formatTime, formatPrice } from '@/utils/format';
import type { Appointment } from '@/types';

interface IncomingJobSheetProps {
  job: Appointment | null;
  onAccept: () => Promise<void>;
  onPass: () => Promise<void>;
  onDismiss: () => void;
}

/**
 * The request that just came in, surfaced over whatever the nurse was doing.
 * Swipe to take it, tap to pass. Modelled on the SOS sheet so the two
 * interruptions feel like the same app.
 *
 * Passing is permanent for this nurse but leaves the job in the pool for
 * everyone else; dismissing (scrim/back) just defers the decision — the job
 * stays in the Requests tab.
 */
export function IncomingJobSheet({
  job,
  onAccept,
  onPass,
  onDismiss,
}: IncomingJobSheetProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState<'accept' | 'pass' | null>(null);

  // A fresh job means a fresh decision — never inherit the last one's spinner.
  useEffect(() => {
    if (job) setBusy(null);
  }, [job?.id]);

  if (!job) return null;
  const isEmergency = job.appointment_type === 'emergency';
  const accent = isEmergency ? colors.emergency : colors.primary;

  const run = async (which: 'accept' | 'pass', fn: () => Promise<void>) => {
    if (busy) return;
    setBusy(which);
    try {
      await fn();
    } finally {
      setBusy(null);
    }
  };

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      {/* RN Modal renders in its own native hierarchy, so the app-root gesture
          handler doesn't reach inside. SlideToConfirm needs this one. */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View className="flex-1 justify-end">
          <Pressable className="absolute inset-0 bg-black/50" onPress={onDismiss} />
          <Animated.View
            entering={FadeIn.duration(180)}
            style={[shadow.e3, { paddingBottom: (insets.bottom || 16) + 8 }]}
            className="rounded-t-[28px] bg-surface px-5 pt-3"
          >
            <View className="items-center pb-1">
              <View className="h-1 w-10 rounded-full bg-border" />
            </View>

            <View className="gap-4 pt-2">
              <View className="flex-row items-center justify-between gap-2">
                <Text variant="heading" numberOfLines={1} className="flex-1">
                  {isEmergency
                    ? t('nurse.incoming.emergencyTitle')
                    : t('nurse.incoming.title')}
                </Text>
                {isEmergency ? <Badge label="SOS" tone="danger" dot /> : null}
              </View>

              {/* Who */}
              <View className="flex-row items-center gap-3">
                <Avatar
                  name={job.patient?.full_name}
                  uri={job.patient?.avatar_url}
                  size={52}
                  fallback="icon"
                />
                <View className="flex-1">
                  <Text variant="subtitle" numberOfLines={1}>
                    {job.patient?.full_name ?? t('nurse.jobs.patient')}
                  </Text>
                  <Text variant="caption" numberOfLines={1}>
                    {job.service?.name ?? t('nurse.incoming.homeVisit')}
                  </Text>
                </View>
                <View className="items-end">
                  <Text variant="subtitle" style={{ color: accent }}>
                    {formatPrice(job.price)}
                  </Text>
                  <Text variant="caption">{t('nurse.jobs.payout')}</Text>
                </View>
              </View>

              {/* When / where */}
              <View className="gap-2 rounded-2xl bg-surface-alt p-3.5">
                <Row
                  icon="calendar-outline"
                  color={colors.mutedForeground}
                  text={`${formatDate(job.scheduled_date)} · ${formatTime(job.scheduled_start)}`}
                />
                <Row
                  icon="location-outline"
                  color={colors.mutedForeground}
                  text={job.location_label || job.address}
                />
                {job.symptoms ? (
                  <Row
                    icon="alert-circle-outline"
                    color={colors.mutedForeground}
                    text={job.symptoms}
                  />
                ) : null}
              </View>

              <SlideToConfirm
                label={t('nurse.incoming.slide')}
                releaseLabel={t('nurse.incoming.slideRelease')}
                sendingLabel={t('nurse.incoming.accepting')}
                sending={busy === 'accept'}
                disabled={busy === 'pass'}
                color={accent}
                icon="checkmark"
                onConfirm={() => void run('accept', onAccept)}
              />

              <Button
                label={t('nurse.incoming.pass')}
                variant="ghost"
                loading={busy === 'pass'}
                disabled={busy === 'accept'}
                onPress={() => void run('pass', onPass)}
              />
            </View>
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

function Row({
  icon,
  color,
  text,
}: {
  icon: IconName;
  color: string;
  text: string;
}) {
  return (
    <View className="flex-row items-center gap-2">
      <Icon name={icon} size={14} color={color} />
      <Text variant="caption" numberOfLines={2} className="flex-1">
        {text}
      </Text>
    </View>
  );
}
