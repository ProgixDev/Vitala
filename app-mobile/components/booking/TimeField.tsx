import { useState } from 'react';
import { Modal, Platform, Pressable, View } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Button, Icon } from '@/components/ui';
import { shadow, useThemeColors } from '@/constants/theme';
import { useTranslation } from '@/utils/i18n';

interface TimeFieldProps {
  /** "HH:mm", or null when nothing is chosen yet. */
  value: string | null;
  onChange: (next: string) => void;
  placeholder?: string;
}

const pad = (n: number) => String(n).padStart(2, '0');
const toHHmm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

/** "HH:mm" -> a Date today at that time. Defaults to the next round hour. */
function toDate(value: string | null): Date {
  const d = new Date();
  if (value) {
    const [h, m] = value.split(':').map(Number);
    if (!Number.isNaN(h) && !Number.isNaN(m)) {
      d.setHours(h, m, 0, 0);
      return d;
    }
  }
  d.setHours(d.getHours() + 1, 0, 0, 0);
  return d;
}

/**
 * Any-time-of-day picker.
 *
 * The two platforms want opposite shapes: Android opens a dialog imperatively,
 * iOS renders a wheel inline. Rendering the iOS wheel in our own sheet keeps a
 * Done button in reach — without one, a spun-but-unconfirmed value is ambiguous.
 */
export function TimeField({ value, onChange, placeholder }: TimeFieldProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [iosOpen, setIosOpen] = useState(false);
  const [draft, setDraft] = useState<Date>(() => toDate(value));

  const open = () => {
    const initial = toDate(value);
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: initial,
        mode: 'time',
        is24Hour: true,
        minuteInterval: 5,
        onValueChange: (_event, picked) => onChange(toHHmm(picked)),
        // Backing out leaves the existing choice alone, so there is nothing to do.
        onDismiss: () => {},
        // open() swallows native failures unless this is here.
        onError: (err) => console.warn('TimeField: time picker failed to open', err),
      });
      return;
    }
    setDraft(initial);
    setIosOpen(true);
  };

  return (
    <>
      <Pressable
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={t('booking.selectTime')}
        className="flex-row items-center justify-between rounded-2xl bg-surface-alt px-4 py-3.5 active:opacity-80"
      >
        <View className="flex-row items-center gap-2.5">
          <Icon name="time-outline" size={18} color={colors.primary} />
          <Text variant={value ? 'bodyMedium' : 'caption'}>
            {value ?? placeholder ?? t('booking.anyTime')}
          </Text>
        </View>
        <Icon name="chevron-forward" size={16} color={colors.mutedForeground} />
      </Pressable>

      {Platform.OS === 'ios' ? (
        <Modal visible={iosOpen} transparent animationType="slide" onRequestClose={() => setIosOpen(false)}>
          <View className="flex-1 justify-end">
            <Pressable className="absolute inset-0 bg-black/40" onPress={() => setIosOpen(false)} />
            <View
              style={[shadow.e3, { paddingBottom: (insets.bottom || 16) + 8 }]}
              className="gap-3 rounded-t-[28px] bg-surface px-5 pt-3"
            >
              <View className="items-center pb-1">
                <View className="h-1 w-10 rounded-full bg-border" />
              </View>
              <Text variant="heading">{t('booking.selectTime')}</Text>
              {/*
                Height is explicit on purpose. Under the New Architecture the picker is a
                leaf Yoga node that lays out at 0x0 until the native view measures itself
                and pushes a size back through state — so a collapsed wheel is the failure
                mode here, not a styling nicety. 216 is the standard iOS wheel height.
              */}
              <DateTimePicker
                value={draft}
                mode="time"
                display="spinner"
                minuteInterval={5}
                themeVariant={colors.scheme}
                style={{ height: 216, alignSelf: 'stretch' }}
                onValueChange={(_e, picked) => setDraft(picked)}
              />
              <Button
                label={t('common.done')}
                icon="checkmark"
                onPress={() => {
                  onChange(toHHmm(draft));
                  setIosOpen(false);
                }}
              />
            </View>
          </View>
        </Modal>
      ) : null}
    </>
  );
}
