import { useNotifications } from "@/hooks/useNotifications";
import { StripeProvider } from "@stripe/stripe-react-native";
import Mapbox from "@rnmapbox/maps";
import Constants from "expo-constants";
import { Stack } from "expo-router";
import { useEffect } from "react";
import {
  LogBox,
  Text as RNText,
  TextInput as RNTextInput,
  useColorScheme,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import {
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
} from "@expo-google-fonts/figtree";
import {
  NotoSans_400Regular,
  NotoSans_500Medium,
  NotoSans_600SemiBold,
} from "@expo-google-fonts/noto-sans";
import Toast from "react-native-toast-message";
import { fonts, useThemeColors } from "@/constants/theme";
import "./global.css";

// Initialize react-native-css
import "react-native-css";

// Keep the splash visible until fonts are ready to avoid a flash of the
// system font before the brand type loads.
SplashScreen.preventAutoHideAsync().catch(() => {});

// Apply the brand body font to every un-migrated <Text>/<TextInput> so the
// whole app picks up Noto Sans, not the OS default. Screens that use the UI
// `Text` primitive override this per-variant.
function applyDefaultFont() {
  const text = RNText as unknown as { defaultProps?: Record<string, unknown> };
  text.defaultProps = text.defaultProps || {};
  (text.defaultProps as any).style = [
    (text.defaultProps as any).style,
    { fontFamily: fonts.regular },
  ];
  const input = RNTextInput as unknown as {
    defaultProps?: Record<string, unknown>;
  };
  input.defaultProps = input.defaultProps || {};
  (input.defaultProps as any).style = [
    (input.defaultProps as any).style,
    { fontFamily: fonts.regular },
  ];
}

// Mapbox access token (Expo inlines EXPO_PUBLIC_*; app.config.js also puts it in extra)
const MAPBOX_TOKEN =
  (Constants.expoConfig?.extra as any)?.mapboxAccessToken ||
  process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ||
  "";
if (MAPBOX_TOKEN) {
  Mapbox.setAccessToken(MAPBOX_TOKEN);
} else if (__DEV__) {
  console.warn(
    "Mapbox: set EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN in mobile/.env (see .env.example), then restart Expo with cache cleared.",
  );
}

// Suppress Expo Go notification warnings
LogBox.ignoreLogs([
  "expo-notifications: Android Push notifications",
  "removed from Expo Go with the release of SDK 53",
  "expo-notifications",
]);

// Notification handler is configured in utils/notifications.ts (conditionally for non-Expo Go)

const STRIPE_PUBLISHABLE_KEY =
  Constants.expoConfig?.extra?.stripePublishableKey ||
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  "";

export default function RootLayout() {
  // Initialize push notifications
  useNotifications();

  const colors = useThemeColors();
  const scheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
    NotoSans_400Regular,
    NotoSans_500Medium,
    NotoSans_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      applyDefaultFont();
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <StripeProvider
      publishableKey={STRIPE_PUBLISHABLE_KEY}
      urlScheme="vitala"
      merchantIdentifier="merchant.com.vitala"
    >
      <SafeAreaProvider>
        <StatusBar style={scheme === "dark" ? "light" : "dark"} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
        <Toast />
      </SafeAreaProvider>
    </StripeProvider>
  );
}
