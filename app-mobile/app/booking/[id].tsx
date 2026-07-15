import { useEffect, useMemo, useState } from 'react';
import { View, Pressable, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import {
  Screen,
  Header,
  Text,
  Card,
  Button,
  Badge,
  Divider,
  Skeleton,
  Icon,
} from '@/components/ui';
import { useAsync } from '@/hooks/useAsync';
import { Endpoints } from '@/lib/endpoints';
import { consumePickedLocation, usePickedLocation } from '@/lib/pickerStore';
import { useTranslation } from '@/utils/i18n';
import { useThemeColors } from '@/constants/theme';
import { formatPrice, formatDuration } from '@/utils/format';
import { TimeField } from '@/components/booking/TimeField';
import { DurationField } from '@/components/booking/DurationField';
import { estimatePrice } from '@/utils/booking';
import type { GeoPoint, SavedLocation, Service } from '@/types';


function nextDays(count: number): { date: string; weekday: string; day: string }[] {
  const out = [];
  const base = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    out.push({
      date: d.toISOString().slice(0, 10),
      weekday: d.toLocaleDateString(undefined, { weekday: 'short' }),
      day: String(d.getDate()),
    });
  }
  return out;
}

export default function Booking() {
  const { id, emergency } = useLocalSearchParams<{ id: string; emergency?: string }>();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const isEmergency = emergency === '1';

  const { data: service, loading } = useAsync<Service>(() => Endpoints.service(id), [id]);
  const locations = useAsync<SavedLocation[]>(() => Endpoints.listLocations(), []);
  const pickedSignal = usePickedLocation();

  const [duration, setDuration] = useState(60);
  const [date, setDate] = useState(nextDays(1)[0].date);
  const [time, setTime] = useState<string | null>(null);
  const [selectedLoc, setSelectedLoc] = useState<GeoPoint | null>(null);
  const [extraLocs, setExtraLocs] = useState<GeoPoint[]>([]);
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const days = useMemo(() => nextDays(7), []);

  // Pull in a location returned by the map picker.
  useEffect(() => {
    const picked = consumePickedLocation();
    if (picked) {
      setExtraLocs((prev) => [picked, ...prev]);
      setSelectedLoc(picked);
    }
  }, [pickedSignal]);

  useEffect(() => {
    // Default to the service's own duration, whatever it is — not just the presets.
    if (service?.duration_min) setDuration(service.duration_min);
  }, [service]);

  // Mirrors proRataPrice() on the server; the server's figure is authoritative.
  const estimate = service ? estimatePrice(service.price, service.duration_min, duration) : 0;

  const savedPoints: GeoPoint[] = [
    ...extraLocs,
    ...((locations.data ?? [])
      .filter((l) => l.address)
      .map((l) => ({
        latitude: l.latitude ?? 0,
        longitude: l.longitude ?? 0,
        address: l.address,
        label: l.label ?? undefined,
      })) as GeoPoint[]),
  ];

  const book = async () => {
    if (!time) {
      Toast.show({ type: 'info', text1: t('booking.pickTimeFirst') });
      return;
    }
    if (!selectedLoc) {
      Toast.show({ type: 'info', text1: t('booking.pickLocationFirst') });
      return;
    }
    setSubmitting(true);
    try {
      const created = await Endpoints.createAppointment({
        service_id: id,
        appointment_type: isEmergency ? 'emergency' : 'normal',
        scheduled_date: date,
        scheduled_start: time,
        address: selectedLoc.address,
        latitude: selectedLoc.latitude || undefined,
        longitude: selectedLoc.longitude || undefined,
        location_label: selectedLoc.label,
        // The server recomputes price from this — the estimate shown above is
        // only a preview and is never sent.
        duration_min: duration,
        symptoms: isEmergency ? symptoms : undefined,
        notes: notes || undefined,
      });
      // Straight to payment: the card is authorised as part of requesting care,
      // so a nurse never travels for a request with no valid card behind it.
      // Nothing is captured until the visit is completed.
      router.replace(`/pay/${created.id}`);
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: t('common.somethingWrong'),
        text2: e instanceof Error ? e.message : '',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll keyboardAvoiding edges={['top']} contentClassName="pb-28">
      <Header title={isEmergency ? t('booking.emergencyTitle') : t('booking.title')} />

      {loading || !service ? (
        <View className="gap-4 px-1 pt-2">
          <Skeleton height={110} radius={28} />
          <Skeleton height={90} radius={28} />
          <Skeleton height={140} radius={28} />
        </View>
      ) : (
        <View className="gap-5 px-1 pt-2">
          {/* Service summary */}
          <Card elevation="e2" className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text variant="heading" className="flex-1" numberOfLines={1}>
                {service.name}
              </Text>
              {isEmergency ? <Badge label={t('booking.emergencyBadge')} tone="danger" dot /> : null}
            </View>
            <Text variant="caption">{service.description}</Text>
            <View className="flex-row items-center gap-4">
              <View className="flex-row items-center gap-1.5">
                <Icon name="pricetag-outline" size={15} color={colors.primary} />
                <Text variant="label" className="text-primary">
                  {formatPrice(service.price)}
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <Icon name="time-outline" size={15} color={colors.mutedForeground} />
                <Text variant="caption">{formatDuration(service.duration_min)}</Text>
              </View>
            </View>
          </Card>

          {/* Duration — presets plus a stepper for anything in between. */}
          <View className="gap-2">
            <Text variant="label">{t('booking.duration')}</Text>
            <DurationField value={duration} onChange={setDuration} />
          </View>

          {/* Date */}
          <View className="gap-2">
            <Text variant="label">{t('booking.selectDate')}</Text>
            <View className="flex-row flex-wrap gap-2">
              {days.map((d) => {
                const active = d.date === date;
                return (
                  <Pressable
                    key={d.date}
                    onPress={() => setDate(d.date)}
                    className={`h-16 w-14 items-center justify-center rounded-2xl ${
                      active ? 'bg-primary' : 'bg-surface-alt'
                    }`}
                  >
                    <Text
                      variant="caption"
                      className={active ? 'text-on-primary' : 'text-muted-foreground'}
                    >
                      {d.weekday}
                    </Text>
                    <Text
                      variant="heading"
                      className={active ? 'text-on-primary' : 'text-foreground'}
                    >
                      {d.day}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Time — any time of day, not a fixed slot grid. */}
          <View className="gap-2">
            <Text variant="label">{t('booking.selectTime')}</Text>
            <TimeField value={time} onChange={setTime} />
          </View>

          {/* Location */}
          <View className="gap-2">
            <Text variant="label">{t('booking.location')}</Text>
            {savedPoints.map((p, i) => {
              const active = selectedLoc?.address === p.address;
              return (
                <Pressable key={`${p.address}-${i}`} onPress={() => setSelectedLoc(p)}>
                  <Card
                    elevation="flat"
                    className={`flex-row items-center gap-3 ${active ? 'bg-primary-soft' : 'bg-surface-alt'}`}
                  >
                    <Icon
                      name={active ? 'radio-button-on' : 'radio-button-off'}
                      size={22}
                      color={active ? colors.primary : colors.mutedForeground}
                    />
                    <View className="flex-1">
                      {p.label ? <Text variant="bodyMedium">{p.label}</Text> : null}
                      <Text variant="caption" numberOfLines={1}>
                        {p.address}
                      </Text>
                    </View>
                  </Card>
                </Pressable>
              );
            })}
            <Pressable onPress={() => router.push('/booking/map')}>
              <View className="flex-row items-center gap-3 rounded-card border border-dashed border-border bg-surface p-4">
                <Icon name="map-outline" size={20} color={colors.primary} />
                <Text variant="bodyMedium" className="text-primary">
                  {t('booking.useMap')}
                </Text>
              </View>
            </Pressable>
          </View>

          {/* Emergency description */}
          {isEmergency ? (
            <View className="gap-2">
              <Text variant="label">{t('booking.describe')}</Text>
              <TextArea
                value={symptoms}
                onChangeText={setSymptoms}
                placeholder={t('booking.describePlaceholder')}
                colorMuted={colors.mutedForeground}
              />
            </View>
          ) : null}

          {/* Notes */}
          <View className="gap-2">
            <Text variant="label">{t('booking.notes')}</Text>
            <TextArea
              value={notes}
              onChangeText={setNotes}
              placeholder={t('booking.notesPlaceholder')}
              colorMuted={colors.mutedForeground}
            />
          </View>

          <Divider />
          <View className="flex-row items-center justify-between">
            <Text variant="subtitle">{t('booking.estimate')}</Text>
            <Text variant="heading" className="text-primary">
              {formatPrice(estimate)}
            </Text>
          </View>
          <Button
            label={t('booking.book')}
            icon={isEmergency ? 'alert' : 'checkmark'}
            variant={isEmergency ? 'danger' : 'primary'}
            loading={submitting}
            onPress={book}
          />
        </View>
      )}
    </Screen>
  );
}

function TextArea({
  value,
  onChangeText,
  placeholder,
  colorMuted,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  colorMuted: string;
}) {
  return (
    <TextInput
      className="min-h-[96px] rounded-2xl bg-surface-alt p-4 font-sans text-[15px] text-foreground"
      placeholder={placeholder}
      placeholderTextColor={colorMuted}
      value={value}
      onChangeText={onChangeText}
      multiline
      textAlignVertical="top"
    />
  );
}
