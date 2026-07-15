import Constants from 'expo-constants';

/** Public runtime config, sourced from app.json `extra` (+ EXPO_PUBLIC overrides). */
type AppExtra = {
  apiBaseUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  stripePublishableKey: string;
  stripeMerchantId: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Partial<AppExtra>;

export const config = {
  /**
   * Base URL of the NestJS API. On a physical device `localhost` won't reach
   * your machine — set EXPO_PUBLIC_API_URL to your LAN IP (e.g.
   * http://192.168.1.20:4000/api) when testing on-device.
   */
  apiBaseUrl:
    process.env.EXPO_PUBLIC_API_URL ?? extra.apiBaseUrl ?? 'http://localhost:4000/api',
  supabaseUrl: extra.supabaseUrl ?? '',
  supabaseAnonKey: extra.supabaseAnonKey ?? '',
  stripePublishableKey: extra.stripePublishableKey ?? '',
  stripeMerchantId: extra.stripeMerchantId ?? 'merchant.com.vitala.app',
  /**
   * Mapbox PUBLIC token (pk.) — safe in the bundle; it's what the Maps SDK and
   * the Directions API authenticate with.
   *
   * The SECRET download token (sk.) is deliberately NOT here: it's only read by
   * the native build at prebuild time from RNMAPBOX_MAPS_DOWNLOAD_TOKEN, and
   * must never reach the JS bundle.
   */
  mapboxToken: process.env.EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN ?? '',
} as const;

/** True when a config value is still an unfilled placeholder. */
export const isPlaceholder = (value: string): boolean =>
  !value || value.startsWith('REPLACE_WITH');
