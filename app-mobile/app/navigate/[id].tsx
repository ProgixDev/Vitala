import { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MapboxNavigationView } from '@badatgil/expo-mapbox-navigation';
import Toast from 'react-native-toast-message';
import { Screen, Header, Text, Button, Icon } from '@/components/ui';
import { useAsync } from '@/hooks/useAsync';
import { useNurseLocation } from '@/hooks/useNurseLocation';
import { Endpoints } from '@/lib/endpoints';
import { useSession } from '@/providers/SessionProvider';
import { useTranslation, getLanguage } from '@/utils/i18n';
import { useThemeColors } from '@/constants/theme';
import { openDirections } from '@/utils/maps';
import type { Appointment } from '@/types';

/**
 * Turn-by-turn navigation to a visit, in-app.
 *
 * Mapbox's Navigation SDK owns the whole screen — map, route line, manoeuvre
 * banner and voice guidance. We only feed it two coordinates and react to the
 * events; there's no point re-styling its chrome.
 *
 * The nurse's own position keeps flowing to the patient the whole time via
 * useNurseLocationPing on the visit screen — that's independent of this.
 */
export default function NavigateToVisit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { me } = useSession();
  const colors = useThemeColors();
  const [failed, setFailed] = useState<string | null>(null);

  const { data: appt, loading } = useAsync<Appointment>(() => Endpoints.appointment(id), [id]);
  // Navigation needs a starting fix; `true` because by definition we're driving.
  const { point, denied } = useNurseLocation(true);

  const isNurse = me?.role === 'nurse' && appt?.nurse_id === me?.id;
  const dest =
    appt?.latitude != null && appt?.longitude != null
      ? { latitude: appt.latitude, longitude: appt.longitude }
      : null;

  const bail = (msg: string) => (
    <Screen edges={['top']}>
      <Header title={t('nurse.visit.navigate')} />
      <View className="flex-1 items-center justify-center gap-4 px-6">
        <Icon name="location-outline" size={28} color={colors.mutedForeground} />
        <Text variant="subtitle" className="text-center">
          {msg}
        </Text>
        {/* Always leave a way to actually get there. */}
        {appt ? (
          <Button
            label={t('nurse.visit.openInMaps')}
            variant="secondary"
            icon="map-outline"
            onPress={() => {
              const ok = openDirections({
                latitude: appt.latitude,
                longitude: appt.longitude,
                address: appt.address,
              });
              if (!ok) Toast.show({ type: 'error', text1: t('nurse.visit.navUnavailable') });
            }}
          />
        ) : null}
      </View>
    </Screen>
  );

  if (loading && !appt) {
    return (
      <Screen edges={['top']}>
        <Header title={t('nurse.visit.navigate')} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }
  if (!appt) return null;
  // Navigating someone else's visit would leak the patient's address.
  if (!isNurse) return bail(t('nurse.visit.navNotYours'));
  // The address exists but was never geocoded — hand off rather than dead-end.
  if (!dest) return bail(t('nurse.visit.navNoCoords'));
  if (denied) return bail(t('nurse.visit.navNeedsLocation'));
  if (failed) return bail(failed);

  if (!point) {
    return (
      <Screen edges={['top']}>
        <Header title={t('nurse.visit.navigate')} />
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator color={colors.primary} />
          <Text variant="caption">{t('nurse.visit.navLocating')}</Text>
        </View>
      </Screen>
    );
  }

  return (
    <View className="flex-1">
      <MapboxNavigationView
        style={{ flex: 1 }}
        coordinates={[{ latitude: point.latitude, longitude: point.longitude }, dest]}
        // Guidance follows the app's language, not the phone's.
        locale={getLanguage() === 'fr' ? 'fr-CA' : 'en-CA'}
        routeProfile="driving-traffic"
        onCancelNavigation={() => router.back()}
        onFinalDestinationArrival={() => {
          Toast.show({ type: 'success', text1: t('nurse.visit.navArrived') });
          router.back();
        }}
        onRouteFailedToLoad={({ nativeEvent }) =>
          setFailed(nativeEvent?.errorMessage || t('nurse.visit.navFailed'))
        }
      />
    </View>
  );
}
