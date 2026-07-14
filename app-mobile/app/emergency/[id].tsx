import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, Badge, IconButton, Icon } from '@/components/ui';
import { useAsync } from '@/hooks/useAsync';
import { Endpoints } from '@/lib/endpoints';
import { useTranslation } from '@/utils/i18n';
import { useThemeColors } from '@/constants/theme';
import { emergencyStatusMeta } from '@/utils/status';
import { formatTime } from '@/utils/format';
import type { EmergencyRequest, EmergencyStatus } from '@/types';

const ORDER: EmergencyStatus[] = ['pending', 'dispatched', 'en-route', 'on-scene', 'completed'];
const stepKey: Record<string, string> = {
  pending: 'etrack.step.pending',
  dispatched: 'etrack.step.dispatched',
  'en-route': 'etrack.step.enroute',
  'on-scene': 'etrack.step.onscene',
  completed: 'etrack.step.completed',
};

export default function EmergencyTracker() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const colors = useThemeColors();

  const { data, loading, refetch } = useAsync<EmergencyRequest>(
    () => Endpoints.emergencyStatus(id),
    [id],
  );

  useEffect(() => {
    const timer = setInterval(() => void refetch(), 10000);
    return () => clearInterval(timer);
  }, [refetch]);

  const currentIndex = data ? ORDER.indexOf(data.status) : 0;
  const meta = data ? emergencyStatusMeta(data.status) : null;

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-5 pt-2">
        <Text variant="heading" className="text-emergency">
          {t('etrack.title')}
        </Text>
        <IconButton
          icon="close"
          accessibilityLabel={t('common.close')}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
        />
      </View>

      {loading && !data ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.emergency} />
        </View>
      ) : !data ? null : (
        <View className="flex-1 px-5 pt-4">
          {/* Pulsing status hero */}
          <View className="items-center py-8">
            <View className="h-24 w-24 items-center justify-center rounded-full bg-emergency/15">
              <Icon name="pulse" size={44} color={colors.emergency} />
            </View>
            {meta ? <Badge label={meta.label} tone={meta.tone} dot className="mt-4" /> : null}
            <Text variant="subtitle" className="mt-3 text-center">
              {t('etrack.stayCalm')}
            </Text>
            {data.eta ? (
              <Text variant="caption" className="mt-1">
                {t('etrack.eta')}: {formatTime(new Date(data.eta).toTimeString().slice(0, 5))}
              </Text>
            ) : null}
          </View>

          {/* Stepper */}
          <Card elevation="e1" className="gap-0">
            {ORDER.map((s, i) => {
              const done = i < currentIndex;
              const active = i === currentIndex && data.status !== 'cancelled';
              const last = i === ORDER.length - 1;
              return (
                <View key={s} className="flex-row gap-3">
                  <View className="items-center">
                    <View
                      className={`h-8 w-8 items-center justify-center rounded-full ${
                        done ? 'bg-success' : active ? 'bg-emergency' : 'bg-surface-alt'
                      }`}
                    >
                      <Icon
                        name={done ? 'checkmark' : 'ellipse'}
                        size={done ? 16 : 10}
                        color={done || active ? '#FFFFFF' : colors.mutedForeground}
                      />
                    </View>
                    {!last ? <View className={`my-1 w-0.5 flex-1 ${done ? 'bg-success' : 'bg-border'}`} /> : null}
                  </View>
                  <View className={`flex-1 ${last ? '' : 'pb-4'} pt-0.5`}>
                    <Text
                      variant="bodyMedium"
                      className={active ? 'text-emergency' : done ? 'text-foreground' : 'text-muted-foreground'}
                    >
                      {t(stepKey[s])}
                    </Text>
                  </View>
                </View>
              );
            })}
          </Card>
        </View>
      )}
    </SafeAreaView>
  );
}
