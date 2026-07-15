import { Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Text, Chip, Icon } from '@/components/ui';
import { useThemeColors } from '@/constants/theme';
import { useTranslation } from '@/utils/i18n';
import { formatDuration } from '@/utils/format';
import { DURATION_PRESETS, DURATION_STEP, MAX_DURATION, MIN_DURATION } from '@/utils/booking';

interface DurationFieldProps {
  value: number;
  onChange: (minutes: number) => void;
}

/**
 * Presets for the common cases, plus a stepper for anything else.
 *
 * Bounds mirror the server's DTO (15–480 min): letting the patient pick a
 * duration the API will reject is a worse experience than not offering it.
 */
export function DurationField({ value, onChange }: DurationFieldProps) {
  const { t } = useTranslation();

  const nudge = (delta: number) => {
    const next = Math.min(MAX_DURATION, Math.max(MIN_DURATION, value + delta));
    if (next === value) return;
    void Haptics.selectionAsync();
    onChange(next);
  };

  const canDown = value > MIN_DURATION;
  const canUp = value < MAX_DURATION;

  return (
    <View className="gap-2.5">
      <View className="flex-row flex-wrap gap-2">
        {DURATION_PRESETS.map((d) => (
          <Chip
            key={d}
            label={formatDuration(d)}
            selected={value === d}
            onPress={() => onChange(d)}
          />
        ))}
      </View>

      <View className="flex-row items-center justify-between rounded-2xl bg-surface-alt px-3 py-2.5">
        <Text variant="caption">{t('booking.customDuration')}</Text>
        <View className="flex-row items-center gap-3">
          <Stepper icon="remove" onPress={() => nudge(-DURATION_STEP)} disabled={!canDown} />
          <Text variant="bodyMedium" className="min-w-[72px] text-center">
            {formatDuration(value)}
          </Text>
          <Stepper icon="add" onPress={() => nudge(DURATION_STEP)} disabled={!canUp} />
        </View>
      </View>
    </View>
  );
}

function Stepper({
  icon,
  onPress,
  disabled,
}: {
  icon: 'add' | 'remove';
  onPress: () => void;
  disabled?: boolean;
}) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      hitSlop={8}
      className={`h-9 w-9 items-center justify-center rounded-full bg-surface ${
        disabled ? 'opacity-40' : 'active:opacity-70'
      }`}
    >
      <Icon name={icon} size={16} color={colors.foreground} weight="bold" />
    </Pressable>
  );
}
