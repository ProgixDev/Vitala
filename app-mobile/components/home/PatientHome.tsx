import { useState } from 'react';
import { View, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text, EmptyState, Skeleton, FadeInView } from '@/components/ui';
import { ServiceMedallion } from '@/components/ServiceMedallion';
import { Hero } from '@/components/home/Hero';
import { ConciergeCard } from '@/components/home/ConciergeCard';
import { PromoCarousel } from '@/components/home/PromoCarousel';
import { SosRow } from '@/components/home/SosRow';
import { SosSetupCard } from '@/components/home/SosSetupCard';
import { useAsync } from '@/hooks/useAsync';
import { Endpoints } from '@/lib/endpoints';
import { useTranslation } from '@/utils/i18n';
import { useThemeColors } from '@/constants/theme';
import type { Service } from '@/types';

export function PatientHome() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [showAll, setShowAll] = useState(false);

  const { data, loading, refetch } = useAsync<Service[]>(() => Endpoints.services(), []);

  const services = data ?? [];
  const visible = showAll ? services : services.slice(0, 6);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} tintColor={colors.primary} />
        }
      >
        {/* Hero */}
        <FadeInView index={0} className="px-5 pt-2">
          <Hero />
        </FadeInView>

        {/* SOS setup nudge — self-hides when complete (no empty gap) */}
        <SosSetupCard />

        {/* Concierge — next step (signature) */}
        <FadeInView index={2} className="mt-7">
          <ConciergeCard />
        </FadeInView>

        {/* Hero carousel */}
        <FadeInView index={3} className="mt-8">
          <PromoCarousel />
        </FadeInView>

        {/* Emergency */}
        <FadeInView index={4} className="mt-4">
          <SosRow />
        </FadeInView>

        {/* Services */}
        <FadeInView index={5} className="mb-3 mt-9 flex-row items-end justify-between px-5">
          <Text variant="heading">{t('home.services')}</Text>
          {services.length > 6 ? (
            <Pressable hitSlop={8} onPress={() => setShowAll((v) => !v)}>
              <Text variant="caption" className="font-semibold text-primary">
                {showAll ? t('common.seeLess') : t('common.seeAll')}
              </Text>
            </Pressable>
          ) : null}
        </FadeInView>

        {loading && !data ? (
          <View className="flex-row flex-wrap justify-between gap-y-3 px-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} width="48%" height={192} radius={28} />
            ))}
          </View>
        ) : services.length === 0 ? (
          <EmptyState
            icon="medkit-outline"
            title={t('home.noServices')}
            description={t('home.noServicesDesc')}
          />
        ) : (
          <View className="flex-row flex-wrap justify-between gap-y-3 px-5">
            {visible.map((s, i) => (
              <FadeInView key={s.id} index={i + 6} className="w-[48%]">
                <ServiceMedallion
                  service={s}
                  onPress={() => router.push(`/booking/${s.id}`)}
                />
              </FadeInView>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
