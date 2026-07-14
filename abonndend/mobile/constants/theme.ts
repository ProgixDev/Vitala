/**
 * Vitala design tokens — TypeScript source of truth.
 * "Ink & Paper" premium minimalist system. Mirrors app/global.css for the
 * places a color must be passed as a *prop* (Ionicons color, tab bar,
 * StatusBar, Stripe, Mapbox, shadows). Prefer NativeWind classNames in markup.
 */
import { useColorScheme } from "react-native";

export const lightColors = {
  primary: "#5346DE", // indigo brand
  primarySoft: "#ECEBFE",
  primaryStrong: "#4938C9",
  onPrimary: "#FFFFFF",

  accent: "#0A8259", // emerald — positive/success
  accentSoft: "#E6F6EF",
  onAccent: "#FFFFFF",

  background: "#F5F6FA",
  surface: "#FFFFFF",
  surfaceAlt: "#EDEFF5",

  foreground: "#12141A",
  mutedForeground: "#565B6A",

  border: "#E5E7EF",

  emergency: "#D51F45",
  emergencySoft: "#FBE6EC",
  onEmergency: "#FFFFFF",
  warning: "#B45309",
  warningSoft: "#FBEEDC",
  success: "#0A8259",
  info: "#5346DE",
};

export type ThemeColors = typeof lightColors;

export const darkColors: ThemeColors = {
  primary: "#6355E8",
  primarySoft: "#211E3D",
  primaryStrong: "#8B80FF",
  onPrimary: "#FFFFFF",

  accent: "#34D39E",
  accentSoft: "#0F2E24",
  onAccent: "#04231A",

  background: "#0C0E14",
  surface: "#161923",
  surfaceAlt: "#20242F",

  foreground: "#F1F2F6",
  mutedForeground: "#9BA0AE",

  border: "#282C38",

  emergency: "#FB7185",
  emergencySoft: "#2A1418",
  onEmergency: "#2A0A0C",
  warning: "#E3B341",
  warningSoft: "#2A2410",
  success: "#34D39E",
  info: "#8B80FF",
};

/* ---- Category tints — colorful, organized medallions for services ---- */
type Tint = { bg: string; fg: string };
const TINTS: Record<string, { light: Tint; dark: Tint }> = {
  indigo: { light: { bg: "#ECEBFE", fg: "#4F46E5" }, dark: { bg: "#211E3D", fg: "#A79BFF" } },
  teal: { light: { bg: "#DCF3F0", fg: "#0D9488" }, dark: { bg: "#0E2E2A", fg: "#2DD4BF" } },
  violet: { light: { bg: "#F0E9FE", fg: "#7C3AED" }, dark: { bg: "#241A3D", fg: "#C4A6FF" } },
  amber: { light: { bg: "#FBEEDC", fg: "#B45309" }, dark: { bg: "#2C2410", fg: "#F0B24B" } },
  rose: { light: { bg: "#FBE6EC", fg: "#D51F45" }, dark: { bg: "#2E1319", fg: "#FB7185" } },
  blue: { light: { bg: "#E4ECFD", fg: "#2563EB" }, dark: { bg: "#12213F", fg: "#7AA6F8" } },
  emerald: { light: { bg: "#E6F6EF", fg: "#0A8259" }, dark: { bg: "#0F2A20", fg: "#34D39E" } },
  fuchsia: { light: { bg: "#F7E5F9", fg: "#A21CAF" }, dark: { bg: "#2C1030", fg: "#E879F9" } },
};

const CATEGORY_TINT: Record<string, keyof typeof TINTS> = {
  reeducation: "teal",
  perfusion: "blue",
  vaccination: "emerald",
  analyses: "violet",
  consultation: "indigo",
  maternity: "rose",
  pediatric: "amber",
  medication: "fuchsia",
  "wound-care": "rose",
  "elderly-care": "amber",
  dialysis: "blue",
  respiratory: "teal",
  "post-op-care": "indigo",
  injection: "emerald",
  palliative: "violet",
  nutrition: "emerald",
};

/** Colored medallion tint for a service category (theme-aware). */
export function getCategoryTint(
  category: string,
  scheme: "light" | "dark" | null | undefined,
): Tint {
  const key = CATEGORY_TINT[category] ?? "indigo";
  return scheme === "dark" ? TINTS[key].dark : TINTS[key].light;
}

/** Reactive category tint hook. */
export function useCategoryTint(category: string): Tint {
  const scheme = useColorScheme();
  return getCategoryTint(category, scheme);
}

/** Reactive palette that follows the device color scheme. */
export function useThemeColors(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === "dark" ? darkColors : lightColors;
}

/** Non-reactive lookup for modules outside React render. */
export function getColors(scheme: "light" | "dark" | null | undefined) {
  return scheme === "dark" ? darkColors : lightColors;
}

/* ---- Font families (registered in app/_layout.tsx via expo-font) ---- */
export const fonts = {
  regular: "NotoSans_400Regular",
  medium: "NotoSans_500Medium",
  semibold: "NotoSans_600SemiBold",
  body: "NotoSans_400Regular",
  heading: "Figtree_600SemiBold",
  headingBold: "Figtree_700Bold",
  headingMedium: "Figtree_500Medium",
} as const;

/* ---- Type scale (size / lineHeight / tracking) — editorial hierarchy ---- */
export const typeScale = {
  display: { fontSize: 36, lineHeight: 40, letterSpacing: -1.1 },
  h1: { fontSize: 28, lineHeight: 34, letterSpacing: -0.7 },
  h2: { fontSize: 22, lineHeight: 28, letterSpacing: -0.4 },
  h3: { fontSize: 18, lineHeight: 24, letterSpacing: -0.2 },
  bodyLg: { fontSize: 16, lineHeight: 25, letterSpacing: 0 },
  body: { fontSize: 15, lineHeight: 23, letterSpacing: 0 },
  label: { fontSize: 14, lineHeight: 20, letterSpacing: 0 },
  caption: { fontSize: 12.5, lineHeight: 17, letterSpacing: 0.1 },
  overline: { fontSize: 11.5, lineHeight: 14, letterSpacing: 1.2 },
} as const;

/* ---- Radii ---- */
export const radius = {
  sm: 12,
  md: 18,
  lg: 22,
  xl: 28,
  "2xl": 34,
  full: 999,
} as const;

/* ---- Spacing (4/8pt) ---- */
export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
} as const;

/* ---- Elevation — soft, diffuse, floating (premium) ---- */
export const shadow = {
  e1: {
    shadowColor: "#0B0F12",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 22,
    elevation: 2,
  },
  e2: {
    shadowColor: "#0B0F12",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 34,
    elevation: 7,
  },
  e3: {
    shadowColor: "#0B0F12",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.12,
    shadowRadius: 44,
    elevation: 14,
  },
} as const;
