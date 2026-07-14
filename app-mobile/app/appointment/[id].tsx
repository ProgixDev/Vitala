import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Screen, Header, Text, Card, Button, Badge, Avatar, Icon, type IconName } from '@/components/ui';
import { CompletionSheet } from '@/components/nurse/CompletionSheet';
import { ReviewSheet } from '@/components/ReviewSheet';
import { useAsync } from '@/hooks/useAsync';
import { useNurseLocationPing } from '@/hooks/useNurseLocationPing';
import { Endpoints } from '@/lib/endpoints';
import { useSession } from '@/providers/SessionProvider';
import { useTranslation } from '@/utils/i18n';
import { useThemeColors } from '@/constants/theme';
import { formatDate, formatTime, formatPrice } from '@/utils/format';
import { openDirections } from '@/utils/maps';
import type { Appointment, AppointmentStatus } from '@/types';

const STEP_ORDER: AppointmentStatus[] = [
  'pending',
  'confirmed',
  'on-the-way',
  'in-progress',
  'completed',
];

const stepMeta: Record<string, { icon: IconName; titleKey: string; descKey: string }> = {
  pending: { icon: 'hourglass-outline', titleKey: 'status.step.pending', descKey: 'status.desc.pending' },
  confirmed: { icon: 'checkmark-circle-outline', titleKey: 'status.step.confirmed', descKey: 'status.desc.confirmed' },
  'on-the-way': { icon: 'car-outline', titleKey: 'status.step.onway', descKey: 'status.desc.onway' },
  'in-progress': { icon: 'medkit-outline', titleKey: 'status.step.inprogress', descKey: 'status.desc.inprogress' },
  completed: { icon: 'ribbon-outline', titleKey: 'status.step.completed', descKey: 'status.desc.completed' },
};

const NEXT_STATUS: Partial<Record<AppointmentStatus, AppointmentStatus>> = {
  confirmed: 'on-the-way',
  'on-the-way': 'in-progress',
  'in-progress': 'completed',
};

export default function AppointmentStatusScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { me } = useSession();
  const colors = useThemeColors();

  const { data: appt, loading, refetch, setData } = useAsync<Appointment>(
    () => Endpoints.appointment(id),
    [id],
  );
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Share live location while this nurse is on the way (hook is a no-op otherwise).
  const activePing =
    me?.role === 'nurse' && !!appt && appt.nurse_id === me?.id && appt.status === 'on-the-way';
  const { sharing, denied } = useNurseLocationPing(activePing, id);

  // Light polling so both sides see live progress.
  useEffect(() => {
    const timer = setInterval(() => void refetch(), 12000);
    return () => clearInterval(timer);
  }, [refetch]);

  if (loading && !appt) {
    return (
      <Screen edges={['top']}>
        <Header title={t('status.title')} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }
  if (!appt) return null;

  const terminal = appt.status === 'cancelled' || appt.status === 'declined';
  const currentIndex = STEP_ORDER.indexOf(appt.status);
  const isNurse = me?.role === 'nurse' && appt.nurse_id === me?.id;
  const next = NEXT_STATUS[appt.status];
  const unpaid = appt.payment?.status !== 'completed';
  const person = me?.role === 'nurse' ? appt.patient : appt.nurse;
  const enRoutePhase = appt.status === 'confirmed' || appt.status === 'on-the-way';
  const isPatient = me?.role === 'patient' && appt.patient_id === me?.id;
  const canReview = isPatient && appt.status === 'completed' && !appt.review;
  const existingReview = isPatient ? appt.review : null;

  const advance = async () => {
    if (!next) return;
    try {
      const updated = await Endpoints.updateAppointmentStatus(id, { status: next });
      setData(() => ({ ...appt, ...updated }));
      Toast.show({ type: 'success', text1: t('status.advanced') });
      void refetch();
    } catch (e) {
      Toast.show({ type: 'error', text1: t('status.advanceError'), text2: msg(e) });
    }
  };

  const completeVisit = async () => {
    setSubmitting(true);
    try {
      const updated = await Endpoints.updateAppointmentStatus(id, {
        status: 'completed',
        completion_notes: notes.trim() || undefined,
      });
      setData(() => ({ ...appt, ...updated }));
      setNotesOpen(false);
      setNotes('');
      Toast.show({ type: 'success', text1: t('nurse.visit.completed') });
      void refetch();
    } catch (e) {
      Toast.show({ type: 'error', text1: t('status.advanceError'), text2: msg(e) });
    } finally {
      setSubmitting(false);
    }
  };

  const submitReview = async () => {
    if (reviewRating < 1) return;
    setSubmittingReview(true);
    try {
      await Endpoints.createReview({
        appointment_id: id,
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });
      setReviewOpen(false);
      setReviewComment('');
      setReviewRating(0);
      Toast.show({ type: 'success', text1: t('review.thanks') });
      void refetch();
    } catch (e) {
      Toast.show({ type: 'error', text1: t('common.somethingWrong'), text2: msg(e) });
    } finally {
      setSubmittingReview(false);
    }
  };

  const navigate = () => {
    const ok = openDirections({
      latitude: appt.latitude,
      longitude: appt.longitude,
      address: appt.address,
    });
    if (!ok) Toast.show({ type: 'error', text1: t('nurse.visit.navUnavailable') });
  };

  const primary =
    next === 'on-the-way'
      ? { label: t('nurse.visit.onMyWay'), icon: 'car-outline' as IconName, action: advance }
      : next === 'in-progress'
        ? { label: t('nurse.visit.arrived'), icon: 'checkmark' as IconName, action: advance }
        : next === 'completed'
          ? { label: t('nurse.visit.complete'), icon: 'ribbon-outline' as IconName, action: () => setNotesOpen(true) }
          : null;

  return (
    <Screen scroll edges={['top']} contentClassName="pb-10">
      <Header title={t('status.title')} />

      <View className="gap-5 px-1 pt-2">
        {/* Summary */}
        <Card elevation="e2" className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text variant="heading" className="flex-1" numberOfLines={1}>
              {appt.service?.name ?? 'Home visit'}
            </Text>
            {appt.appointment_type === 'emergency' ? <Badge label="SOS" tone="danger" /> : null}
          </View>
          <View className="flex-row items-center gap-4">
            <View className="flex-row items-center gap-1.5">
              <Icon name="calendar-outline" size={15} color={colors.mutedForeground} />
              <Text variant="caption">{formatDate(appt.scheduled_date)}</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Icon name="time-outline" size={15} color={colors.mutedForeground} />
              <Text variant="caption">{formatTime(appt.scheduled_start)}</Text>
            </View>
            <Text variant="label" className="text-primary">
              {formatPrice(appt.price)}
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Icon name="location-outline" size={15} color={colors.mutedForeground} />
            <Text variant="caption" numberOfLines={1} className="flex-1">
              {appt.address}
            </Text>
          </View>
        </Card>

        {/* Counterpart */}
        {person ? (
          <Card elevation="e1" className="flex-row items-center gap-3">
            <Avatar name={person.full_name} uri={person.avatar_url} size={44} />
            <View className="flex-1">
              <Text variant="caption">{me?.role === 'nurse' ? t('status.patient') : t('status.nurse')}</Text>
              <Text variant="bodyMedium">{person.full_name}</Text>
            </View>
            <Icon name="call-outline" size={22} color={colors.primary} />
          </Card>
        ) : null}

        {/* Visit details — symptoms / notes / care notes */}
        {appt.symptoms || appt.notes || appt.completion_notes ? (
          <Card elevation="e1" className="gap-3">
            <Text variant="label">{t('status.details')}</Text>
            {appt.symptoms ? (
              <DetailLine icon="alert-circle-outline" label={t('nurse.visit.symptoms')} value={appt.symptoms} />
            ) : null}
            {appt.notes ? (
              <DetailLine icon="chatbox-outline" label={t('nurse.visit.notes')} value={appt.notes} />
            ) : null}
            {appt.completion_notes ? (
              <DetailLine icon="checkmark-circle-outline" label={t('nurse.visit.careNotes')} value={appt.completion_notes} />
            ) : null}
          </Card>
        ) : null}

        {/* Waiting / pay prompts */}
        {appt.status === 'pending' && !isNurse ? (
          <Card elevation="flat" className="flex-row items-center gap-3 bg-warning/10">
            <Icon name="hourglass-outline" size={22} color={colors.warning} />
            <Text variant="caption" className="flex-1">
              {t('status.waiting')}
            </Text>
          </Card>
        ) : null}

        {appt.status === 'confirmed' && unpaid && !isNurse ? (
          <Card elevation="flat" className="gap-3 bg-primary-soft">
            <Text variant="bodyMedium" className="text-primary">
              {t('status.payPrompt')}
            </Text>
            <Button
              label={t('status.payNow')}
              icon="card-outline"
              onPress={() => router.push(`/pay/${id}`)}
            />
          </Card>
        ) : null}

        {/* Patient review prompt / summary */}
        {canReview ? (
          <Card elevation="flat" className="gap-3 bg-primary-soft">
            <View className="gap-1">
              <Text variant="bodyMedium" className="text-primary">
                {t('review.cta')}
              </Text>
              <Text variant="caption">{t('review.ctaSubtitle')}</Text>
            </View>
            <Button
              label={t('review.cta')}
              icon="star"
              onPress={() => {
                setReviewRating(0);
                setReviewComment('');
                setReviewOpen(true);
              }}
            />
          </Card>
        ) : existingReview ? (
          <Card elevation="e1" className="gap-2">
            <Text variant="caption">{t('review.yourRating')}</Text>
            <View className="flex-row items-center gap-2">
              <View className="flex-row gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Icon
                    key={n}
                    name="star"
                    size={16}
                    color={n <= Math.round(existingReview.rating) ? colors.warning : colors.border}
                    weight="fill"
                  />
                ))}
              </View>
              <Text variant="bodyMedium">{existingReview.rating.toFixed(1)}</Text>
            </View>
            {existingReview.comment ? (
              <Text variant="body">{existingReview.comment}</Text>
            ) : null}
          </Card>
        ) : null}

        {/* Stepper */}
        <Card elevation="e1" padded className="gap-0">
          {terminal ? (
            <View className="flex-row items-center gap-3 py-2">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-emergency/15">
                <Icon name="close-circle" size={22} color={colors.emergency} />
              </View>
              <View className="flex-1">
                <Text variant="bodyMedium" className="text-emergency">
                  {t(appt.status === 'cancelled' ? 'status.step.cancelled' : 'status.step.declined')}
                </Text>
                <Text variant="caption">
                  {t(appt.status === 'cancelled' ? 'status.desc.cancelled' : 'status.desc.declined')}
                </Text>
              </View>
            </View>
          ) : (
            STEP_ORDER.map((s, i) => {
              const meta = stepMeta[s];
              const done = i < currentIndex;
              const active = i === currentIndex;
              const last = i === STEP_ORDER.length - 1;
              return (
                <View key={s} className="flex-row gap-3">
                  <View className="items-center">
                    <View
                      className={`h-9 w-9 items-center justify-center rounded-full ${
                        done ? 'bg-success' : active ? 'bg-primary' : 'bg-surface-alt'
                      }`}
                    >
                      <Icon
                        name={done ? 'checkmark' : meta.icon}
                        size={18}
                        color={done || active ? '#FFFFFF' : colors.mutedForeground}
                        weight={done || active ? 'bold' : 'regular'}
                      />
                    </View>
                    {!last ? (
                      <View className={`my-1 w-0.5 flex-1 ${done ? 'bg-success' : 'bg-border'}`} />
                    ) : null}
                  </View>
                  <View className={`flex-1 ${last ? '' : 'pb-5'} pt-1`}>
                    <Text
                      variant="bodyMedium"
                      className={active ? 'text-primary' : done ? 'text-foreground' : 'text-muted-foreground'}
                    >
                      {t(meta.titleKey)}
                    </Text>
                    {active ? (
                      <Text variant="caption" className="mt-0.5">
                        {t(meta.descKey)}
                      </Text>
                    ) : null}
                  </View>
                </View>
              );
            })
          )}
        </Card>

        {/* Nurse active-visit controls */}
        {isNurse && !terminal ? (
          <View className="gap-3">
            {appt.status === 'on-the-way' && sharing ? (
              <View className="flex-row items-center gap-2 self-start rounded-full bg-primary-soft px-3 py-1.5">
                <View className="h-2 w-2 rounded-full bg-primary" />
                <Text variant="caption" className="text-primary">
                  {t('nurse.visit.sharing')}
                </Text>
              </View>
            ) : null}
            {appt.status === 'on-the-way' && denied ? (
              <Text variant="caption" className="text-warning">
                {t('nurse.visit.locationDenied')}
              </Text>
            ) : null}

            {enRoutePhase ? (
              <Button
                label={t('nurse.visit.navigate')}
                variant="secondary"
                icon="map-outline"
                onPress={navigate}
              />
            ) : null}

            {primary ? (
              <Button label={primary.label} icon={primary.icon} onPress={primary.action} />
            ) : null}
          </View>
        ) : null}
      </View>

      <CompletionSheet
        visible={notesOpen}
        notes={notes}
        onChangeNotes={setNotes}
        submitting={submitting}
        onCancel={() => setNotesOpen(false)}
        onConfirm={completeVisit}
      />

      <ReviewSheet
        visible={reviewOpen}
        rating={reviewRating}
        comment={reviewComment}
        onChangeRating={setReviewRating}
        onChangeComment={setReviewComment}
        submitting={submittingReview}
        onCancel={() => setReviewOpen(false)}
        onConfirm={submitReview}
      />
    </Screen>
  );
}

function DetailLine({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  const colors = useThemeColors();
  return (
    <View className="flex-row gap-3">
      <Icon name={icon} size={18} color={colors.mutedForeground} />
      <View className="flex-1">
        <Text variant="caption">{label}</Text>
        <Text variant="body" className="mt-0.5">
          {value}
        </Text>
      </View>
    </View>
  );
}

function msg(e: unknown): string {
  return e instanceof Error ? e.message : '';
}
