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
} as const;

/** True when a config value is still an unfilled placeholder. */
export const isPlaceholder = (value: string): boolean =>
  !value || value.startsWith('REPLACE_WITH');
