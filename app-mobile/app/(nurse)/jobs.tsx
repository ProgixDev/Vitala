import { useCallback, useState } from 'react';
import { View, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Text, EmptyState, SkeletonList, Icon } from '@/components/ui';
import { AppointmentCard } from '@/components/AppointmentCard';
import { RequestCard } from '@/components/nurse/RequestCard';
import { JobFiltersSheet } from '@/components/nurse/JobFiltersSheet';
import { useAsync } from '@/hooks/useAsync';
import { useRefetchOnFocus } from '@/hooks/useRefetchOnFocus';
import { useJobFilters } from '@/hooks/useJobFilters';
import { useNurseLocation } from '@/hooks/useNurseLocation';
import { Endpoints } from '@/lib/endpoints';
import { useSession } from '@/providers/SessionProvider';
import { useTranslation } from '@/utils/i18n';
import { useThemeColors } from '@/constants/theme';
import { cn } from '@/utils/cn';
import { rankJobs } from '@/utils/jobFilters';
import type { Appointment, AppointmentStatus } from '@/types';

type Tab = 'requests' | 'active';
const ACTIVE_STATUSES: AppointmentStatus[] = ['confirmed', 'on-the-way', 'in-progress'];

export default function NurseJobs() {
  const { t } = useTranslation();
  const { me } = useSession();
  const colors = useThemeColors();
  const [tab, setTab] = useState<Tab>('requests');
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { radiusKm, categories, saving, save } = useJobFilters();
  // Location is only worth asking for while the nurse is actually taking work.
  const onDuty = me?.nurseProfile?.is_online ?? false;
  const { point, denied } = useNurseLocation(onDuty);

  const requests = useAsync<Appointment[]>(() => Endpoints.unassignedAppointments(), []);
  const mine = useAsync<Appointment[]>(() => Endpoints.appointments(), []);

  const loading = requests.loading || mine.loading;
  const refetch = async () => {
    await Promise.all([requests.refetch(), mine.refetch()]);
  };

  // A visit completed on the detail screen must drop out of the Active tab.
  const revalidate = useCallback(async () => {
    await Promise.all([requests.revalidate(), mine.revalidate()]);
  }, [requests.revalidate, mine.revalidate]);
  useRefetchOnFocus(revalidate);

  // Open pool — emergencies first, then nearest. Filtered to what the nurse
  // asked for; jobs with no coordinates survive the radius and sort last.
  const ranked = rankJobs(
    (requests.data ?? []).filter((a) => !dismissed.includes(a.id)),
    point,
    { radiusKm, categories },
  );
  const pending = ranked.map((r) => r.appointment);
  const kmById = new Map(ranked.map((r) => [r.appointment.id, r.km]));

  const active = (mine.data ?? [])
    .filter((a) => a.nurse_id === me?.id && ACTIVE_STATUSES.includes(a.status))
    .sort((a, b) =>
      `${a.scheduled_date}${a.scheduled_start}`.localeCompare(`${b.scheduled_date}${b.scheduled_start}`),
    );

  const accept = async (id: string) => {
    setBusyId(id);
    try {
      await Endpoints.assignSelf(id);
      Toast.show({ type: 'success', text1: t('nurse.jobs.accepted') });
      await refetch();
      setTab('active');
    } catch (e) {
      Toast.show({ type: 'error', text1: t('common.somethingWrong'), text2: msg(e) });
    } finally {
      setBusyId(null);
    }
  };
  // Passing is optimistic: hide it immediately, persist in the background. The
  // server keeps the job in the pool for other nurses but never offers it to
  // this one again, so it won't reappear on refresh.
  const decline = async (id: string) => {
    setDismissed((d) => [...d, id]);
    Toast.show({ type: 'info', text1: t('nurse.jobs.declined') });
    try {
      await Endpoints.passJob(id);
    } catch (e) {
      setDismissed((d) => d.filter((x) => x !== id)); // put it back
      Toast.show({ type: 'error', text1: t('common.somethingWrong'), text2: msg(e) });
    }
  };

  const list = tab === 'requests' ? pending : active;
  // A chosen radius counts as one filter, plus one per chosen service.
  const activeFilterCount = (radiusKm != null ? 1 : 0) + categories.length;
  // How many open jobs the filters removed — drives the empty-state copy.
  const filteredOut =
    (requests.data ?? []).filter((a) => !dismissed.includes(a.id)).length - pending.length;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-5 pt-2">
        <Text variant="title">{t('nurse.jobs.title')}</Text>
        <Pressable
          onPress={() => setFiltersOpen(true)}
          className="flex-row items-center gap-1.5 rounded-full bg-surface-alt px-3 py-2 active:opacity-80"
        >
          <Icon name="settings-outline" size={16} color={colors.primary} />
          <Text variant="caption" className="font-semibold text-primary">
            {t('nurse.filters.button')}
          </Text>
          {activeFilterCount > 0 ? (
            <View className="rounded-full bg-primary px-1.5">
              <Text variant="caption" className="font-semibold text-on-primary">
                {activeFilterCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      {/* Segmented control */}
      <View className="mx-5 mt-4 flex-row rounded-full bg-surface-alt p-1">
        {(['requests', 'active'] as Tab[]).map((seg) => {
          const activeTab = tab === seg;
          const count = seg === 'requests' ? pending.length : active.length;
          return (
            <Pressable
              key={seg}
              onPress={() => setTab(seg)}
              className={cn(
                'flex-1 flex-row items-center justify-center gap-1.5 rounded-full py-2.5',
                activeTab && 'bg-surface',
              )}
            >
              <Text variant="bodyMedium" className={activeTab ? 'text-foreground' : 'text-muted-foreground'}>
                {t(`nurse.jobs.${seg}`)}
              </Text>
              <View className={cn('rounded-full px-1.5', activeTab ? 'bg-primary' : 'bg-border')}>
                <Text variant="caption" className={activeTab ? 'font-semibold text-on-primary' : 'text-muted-foreground'}>
                  {count}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28, paddingTop: 16 }}
        contentContainerClassName="px-5 gap-3"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} tintColor={colors.primary} />
        }
      >
        {/* Without a fix we can't rank by distance and the radius does nothing,
            so say so rather than silently showing an unsorted list. */}
        {tab === 'requests' && denied && onDuty ? (
          <View className="flex-row items-center gap-2 rounded-2xl bg-surface-alt px-3.5 py-2.5">
            <Icon name="location-outline" size={14} color={colors.mutedForeground} />
            <Text variant="caption" className="flex-1">
              {t('nurse.filters.locationOff')}
            </Text>
          </View>
        ) : null}

        {loading && list.length === 0 ? (
          <SkeletonList count={3} />
        ) : list.length === 0 ? (
          <EmptyState
            icon={tab === 'requests' ? 'checkmark-done-outline' : 'briefcase-outline'}
            title={
              tab === 'active'
                ? t('nurse.jobs.noActive')
                : // Distinguish "nothing came in" from "your filters hid it" —
                  // otherwise a too-narrow radius looks like a dead market.
                  filteredOut > 0
                  ? t('nurse.filters.noMatch')
                  : t('nurse.jobs.noRequests')
            }
            description={
              tab === 'active'
                ? t('nurse.jobs.noActiveDesc')
                : filteredOut > 0
                  ? t('nurse.filters.noMatchDesc')
                  : t('nurse.jobs.noRequestsDesc')
            }
            actionLabel={filteredOut > 0 && tab === 'requests' ? t('nurse.filters.button') : undefined}
            onAction={filteredOut > 0 && tab === 'requests' ? () => setFiltersOpen(true) : undefined}
          />
        ) : tab === 'requests' ? (
          pending.map((a) => (
            <RequestCard
              key={a.id}
              appointment={a}
              accepting={busyId === a.id}
              distanceKm={kmById.get(a.id) ?? null}
              onAccept={() => accept(a.id)}
              onDecline={() => decline(a.id)}
            />
          ))
        ) : (
          active.map((a) => (
            <AppointmentCard
              key={a.id}
              appointment={a}
              counterpart="patient"
              onPress={() => router.push(`/appointment/${a.id}`)}
            />
          ))
        )}
      </ScrollView>

      <JobFiltersSheet
        visible={filtersOpen}
        radiusKm={radiusKm}
        categories={categories}
        saving={saving}
        onClose={() => setFiltersOpen(false)}
        onSave={async (next) => {
          if (await save(next)) setFiltersOpen(false);
        }}
      />
    </SafeAreaView>
  );
}

function msg(e: unknown): string {
  return e instanceof Error ? e.message : '';
}
