import { useState } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
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
 * iOS needs the profile fully qualified ("mapbox/driving-traffic"); Android
 * wants the bare id. Passing the bare id on iOS makes the online router 404
 * ("OnlineRouter::getRoute failed w/error: Not Found"), the SDK then falls back
 * to offline routing tiles it can't fetch, and the surfaced error is the
 * misleading "No suitable edges near location" — nothing to do with the
 * coordinates.
 */
const ROUTE_PROFILE = Platform.select({
  ios: 'mapbox/driving-traffic',
  default: 'driving-traffic',
});

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

  const origin = { latitude: point.latitude, longitude: point.longitude };

  return (
    <View className="flex-1">
      <MapboxNavigationView
        style={{ flex: 1 }}
        coordinates={[origin, dest]}
        // Frame the map on the nurse straight away, before the route resolves.
        initialLocation={{ ...origin, zoom: 15 }}
        // Guidance follows the app's language, not the phone's.
        locale={getLanguage() === 'fr' ? 'fr' : 'en'}
        routeProfile={ROUTE_PROFILE}
        onCancelNavigation={() => router.back()}
        onFinalDestinationArrival={() => {
          Toast.show({ type: 'success', text1: t('nurse.visit.navArrived') });
          router.back();
        }}
        onRouteFailedToLoad={({ nativeEvent }) => {
          // The SDK's own message is an internal diagnostic in English
          // ("OnlineRouter::getRoute failed w/error: Not Found") — useless to a
          // nurse at the wheel, and untranslated. She gets the written line; the
          // detail goes to the log, where it's actually of use.
          if (nativeEvent?.errorMessage) {
            console.warn(`[navigate] route failed: ${nativeEvent.errorMessage}`);
          }
          setFailed(t('nurse.visit.navFailed'));
        }}
      />
    </View>
  );
}
