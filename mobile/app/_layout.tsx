import { useNotifications } from "@/hooks/useNotifications";
import { StripeProvider } from "@stripe/stripe-react-native";
import Mapbox from "@rnmapbox/maps";
import Constants from "expo-constants";
import { Stack } from "expo-router";
import { LogBox } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import "./global.css";

// Initialize react-native-css
import "react-native-css";

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

  return (
    <StripeProvider
      publishableKey={STRIPE_PUBLISHABLE_KEY}
      urlScheme="vitala"
      merchantIdentifier="merchant.com.vitala"
    >
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#F6F6F6" },
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
