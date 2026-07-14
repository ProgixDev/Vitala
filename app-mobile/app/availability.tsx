import { useEffect, useState } from 'react';
import { View, Pressable, Modal, ScrollView, Switch, useColorScheme } from 'react-native';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Screen, Header, Text, Card, Button, Icon } from '@/components/ui';
import { useAsync } from '@/hooks/useAsync';
import { Endpoints } from '@/lib/endpoints';
import { useTranslation } from '@/utils/i18n';
import { useThemeColors, palette, shadow } from '@/constants/theme';
import { formatTime } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { AvailabilitySlot } from '@/types';

// Preset half-hour times, 06:00–22:00.
const TIMES: string[] = (() => {
  const out: string[] = [];
  for (let h = 6; h <= 22; h++) {
    out.push(`${String(h).padStart(2, '0')}:00`);
    if (h < 22) out.push(`${String(h).padStart(2, '0')}:30`);
  }
  return out;
})();

// Display Monday-first; values are 0 = Sunday … 6 = Saturday.
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

interface DayState {
  enabled: boolean;
  start: string;
  end: string;
}
type DaysMap = Record<number, DayState>;

const hhmm = (t: string) => t.slice(0, 5);

function weekdayName(weekday: number, language: string): string {
  // 2023-01-01 is a Sunday, so getDay() of (1 + weekday) equals `weekday`.
  const d = new Date(2023, 0, 1 + weekday);
  return d.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'long' });
}

export default function Availability() {
  const { t, language } = useTranslation();
  const colors = useThemeColors();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';

  const { data, loading } = useAsync<AvailabilitySlot[]>(() => Endpoints.availability(), []);
  const [days, setDays] = useState<DaysMap>(() => defaults());
  const [picker, setPicker] = useState<{ weekday: number; field: 'start' | 'end' } | null>(null);
  const [saving, setSaving] = useState(false);

  // Seed the editor from the saved slots (first window per weekday).
  useEffect(() => {
    if (!data) return;
    const next = defaults();
    for (const slot of data) {
      if (next[slot.weekday] && !next[slot.weekday].enabled) {
        next[slot.weekday] = { enabled: true, start: hhmm(slot.start_time), end: hhmm(slot.end_time) };
      }
    }
    setDays(next);
  }, [data]);

  const setDay = (weekday: number, patch: Partial<DayState>) =>
    setDays((d) => ({ ...d, [weekday]: { ...d[weekday], ...patch } }));

  const save = async () => {
    const slots: { weekday: number; start_time: string; end_time: string }[] = [];
    for (const weekday of WEEKDAY_ORDER) {
      const day = days[weekday];
      if (!day.enabled) continue;
      if (day.end <= day.start) {
        Toast.show({
          type: 'error',
          text1: t('nurse.availability.invalid'),
          text2: weekdayName(weekday, language),
        });
        return;
      }
      slots.push({ weekday, start_time: day.start, end_time: day.end });
    }
    setSaving(true);
    try {
      await Endpoints.updateAvailability(slots);
      Toast.show({ type: 'success', text1: t('nurse.availability.saved') });
      router.back();
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: t('common.somethingWrong'),
        text2: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll edges={['top']} contentClassName="pb-10">
      <Header title={t('nurse.availability.title')} />

      <View className="gap-4 px-1 pt-1">
        <Text variant="subtitle">{t('nurse.availability.subtitle')}</Text>

        <Card elevation="e1" className="gap-1 py-2">
          {WEEKDAY_ORDER.map((weekday, i) => {
            const day = days[weekday];
            return (
              <View key={weekday}>
                <View className="flex-row items-center gap-3 py-2.5">
                  <Text variant="bodyMedium" className="flex-1">
                    {weekdayName(weekday, language)}
                  </Text>

                  {day.enabled ? (
                    <View className="flex-row items-center gap-2">
                      <TimePill label={formatTime(day.start)} onPress={() => setPicker({ weekday, field: 'start' })} />
                      <Text variant="caption">–</Text>
                      <TimePill label={formatTime(day.end)} onPress={() => setPicker({ weekday, field: 'end' })} />
                    </View>
                  ) : (
                    <Text variant="caption" className="mr-1">
                      {t('nurse.availability.off')}
                    </Text>
                  )}

                  <Switch
                    value={day.enabled}
                    onValueChange={(v) => setDay(weekday, { enabled: v })}
                    trackColor={{ false: palette[scheme].surfaceAlt, true: colors.primary }}
                    thumbColor="#FFFFFF"
                  />
                </View>
                {i < WEEKDAY_ORDER.length - 1 ? <View className="h-px bg-border" /> : null}
              </View>
            );
          })}
        </Card>

        <Button
          label={t('common.save')}
          loading={saving || loading}
          onPress={save}
          icon="checkmark"
        />
      </View>

      {/* Time picker */}
      <Modal visible={!!picker} transparent animationType="slide" onRequestClose={() => setPicker(null)}>
        <View className="flex-1 justify-end">
          <Pressable className="absolute inset-0 bg-black/40" onPress={() => setPicker(null)} />
          <View style={shadow.e3} className="max-h-[60%] rounded-t-[28px] bg-surface pb-8 pt-4">
            <View className="items-center pb-2">
              <View className="h-1 w-10 rounded-full bg-border" />
            </View>
            <Text variant="heading" className="px-6 pb-2">
              {picker?.field === 'start'
                ? t('nurse.availability.startTime')
                : t('nurse.availability.endTime')}
            </Text>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-4 pb-4">
              {TIMES.map((time) => {
                const selected = picker
                  ? days[picker.weekday][picker.field] === time
                  : false;
                return (
                  <Pressable
                    key={time}
                    onPress={() => {
                      if (picker) setDay(picker.weekday, { [picker.field]: time });
                      setPicker(null);
                    }}
                    className={cn(
                      'flex-row items-center justify-between rounded-2xl px-4 py-3.5',
                      selected && 'bg-primary-soft',
                    )}
                  >
                    <Text variant="bodyMedium" className={selected ? 'text-primary' : undefined}>
                      {formatTime(time)}
                    </Text>
                    {selected ? <Icon name="checkmark" size={18} color={colors.primary} weight="bold" /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function TimePill({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="rounded-full bg-surface-alt px-3 py-1.5 active:opacity-80">
      <Text variant="caption" className="font-semibold text-foreground">
        {label}
      </Text>
    </Pressable>
  );
}

function defaults(): DaysMap {
  const map: DaysMap = {};
  for (let w = 0; w <= 6; w++) map[w] = { enabled: false, start: '09:00', end: '17:00' };
  return map;
}
