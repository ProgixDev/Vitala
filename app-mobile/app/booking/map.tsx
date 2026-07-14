import { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import MapView, { PROVIDER_DEFAULT, type Region } from 'react-native-maps';
import { Text, Button, IconButton, Icon } from '@/components/ui';
import { setPickedLocation } from '@/lib/pickerStore';
import { useThemeColors } from '@/constants/theme';
import { useTranslation } from '@/utils/i18n';

// Default region (used until GPS resolves) — roughly Montréal.
const DEFAULT_REGION: Region = {
  latitude: 45.5017,
  longitude: -73.5673,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

export default function MapPicker() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const mapRef = useRef<MapView>(null);
  const [center, setCenter] = useState({ latitude: DEFAULT_REGION.latitude, longitude: DEFAULT_REGION.longitude });
  const [address, setAddress] = useState('');
  const [locating, setLocating] = useState(true);

  const reverse = async (lat: number, lng: number) => {
    try {
      const [place] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (place) {
        setAddress([place.name, place.street, place.city, place.region].filter(Boolean).join(', '));
      }
    } catch {
      setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    }
  };

  useEffect(() => {
    (async () => {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.granted) {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const region: Region = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setCenter({ latitude: region.latitude, longitude: region.longitude });
        mapRef.current?.animateToRegion(region, 600);
        await reverse(region.latitude, region.longitude);
      }
      setLocating(false);
    })();
  }, []);

  const onRegionChangeComplete = (region: Region) => {
    setCenter({ latitude: region.latitude, longitude: region.longitude });
    void reverse(region.latitude, region.longitude);
  };

  const confirm = () => {
    setPickedLocation({
      latitude: center.latitude,
      longitude: center.longitude,
      address: address || `${center.latitude.toFixed(5)}, ${center.longitude.toFixed(5)}`,
    });
    router.back();
  };

  return (
    <View className="flex-1 bg-background">
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={{ flex: 1 }}
        initialRegion={DEFAULT_REGION}
        showsUserLocation
        showsMyLocationButton={false}
        onRegionChangeComplete={onRegionChangeComplete}
      />

      {/* Fixed center pin */}
      <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
        <View className="-mt-10">
          <Icon name="location" size={40} color={colors.emergency} />
        </View>
      </View>

      {/* Top bar */}
      <SafeAreaView edges={['top']} className="absolute left-0 right-0 top-0">
        <View className="flex-row items-center justify-between px-5 pt-2">
          <IconButton icon="close" accessibilityLabel={t('common.close')} onPress={() => router.back()} />
          <Text variant="bodyMedium" className="rounded-full bg-surface px-4 py-2">
            {t('map.title')}
          </Text>
          <View className="w-11" />
        </View>
      </SafeAreaView>

      {/* Bottom sheet */}
      <SafeAreaView edges={['bottom']} className="absolute bottom-0 left-0 right-0">
        <View className="m-4 gap-3 rounded-card bg-surface p-5">
          {locating ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator color={colors.primary} />
              <Text variant="caption">{t('map.locating')}</Text>
            </View>
          ) : (
            <View className="flex-row items-start gap-2">
              <Icon name="location-outline" size={18} color={colors.primary} />
              <Text variant="bodyMedium" className="flex-1">
                {address || t('map.myLocation')}
              </Text>
            </View>
          )}
          <Button label={t('map.confirm')} onPress={confirm} disabled={locating} />
        </View>
      </SafeAreaView>
    </View>
  );
}
