import { useColorScheme } from 'react-native';

/**
 * TS mirror of the CSS tokens in `global.css`, for the (few) places that need a
 * raw color value as a prop — Ionicons `color`, Mapbox styles, the Stripe sheet,
 * gradients. Prefer NativeWind classes everywhere else.
 */
export const palette = {
  light: {
    background: '#FBF9F5',
    surface: '#FFFFFF',
    surfaceAlt: '#F4F1EA',
    foreground: '#14201D',
    mutedForeground: '#5B6B66',
    border: '#E9E4DA',
    primary: '#0E7C6B',
    primaryDeep: '#0B5A4F',
    onPrimary: '#FFFFFF',
    primarySoft: '#E3F0EC',
    accent: '#0B5A4F',
    success: '#12805F',
    warning: '#B4791F',
    emergency: '#C4433A',
    onEmergency: '#FFFFFF',
  },
  dark: {
    background: '#0E1512',
    surface: '#141D19',
    surfaceAlt: '#1B2621',
    foreground: '#EAF0EC',
    mutedForeground: '#94A69E',
    border: '#2A3630',
    primary: '#2B9D86',
    primaryDeep: '#1E7664',
    onPrimary: '#FFFFFF',
    primarySoft: '#162B26',
    accent: '#3FB8A0',
    success: '#34C08A',
    warning: '#E0A64B',
    emergency: '#E4695E',
    onEmergency: '#FFFFFF',
  },
} as const;

export type ThemeColors = { [K in keyof (typeof palette)['light']]: string };
export type ColorScheme = 'light' | 'dark';

/** Resolve the active palette + scheme from the device color scheme. */
export function useThemeColors(): ThemeColors & { scheme: ColorScheme } {
  const scheme: ColorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return { ...palette[scheme], scheme };
}

/** Soft, diffuse elevation presets (used with `style=` on floating surfaces). */
export const shadow = {
  e1: {
    shadowColor: '#0B1220',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  e2: {
    shadowColor: '#0B1220',
    shadowOpacity: 0.09,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  e3: {
    shadowColor: '#0B1220',
    shadowOpacity: 0.14,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 16 },
    elevation: 12,
  },
} as const;

/** Font family names as loaded by `useFonts` in the root layout. */
export const fonts = {
  body: 'HankenGrotesk_400Regular',
  medium: 'HankenGrotesk_500Medium',
  semibold: 'HankenGrotesk_600SemiBold',
  bold: 'HankenGrotesk_700Bold',
  display: 'Fraunces_600SemiBold',
  displayMedium: 'Fraunces_500Medium',
  displayBold: 'Fraunces_700Bold',
} as const;
