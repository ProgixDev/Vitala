// Suppress Expo Go notification errors BEFORE any imports
if (__DEV__) {
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('expo-notifications: Android Push notifications') ||
       args[0].includes('removed from Expo Go with the release of SDK 53'))
    ) {
      return;
    }
    originalError.apply(console, args);
  };

  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('expo-notifications')
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

import { useNotifications } from "@/hooks/useNotifications";
import { Stack } from "expo-router";
import { LogBox } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import "./global.css";

// Initialize react-native-css
import "react-native-css";

// Suppress Expo Go notification warnings
LogBox.ignoreLogs([
  "expo-notifications: Android Push notifications",
  "removed from Expo Go with the release of SDK 53",
  "expo-notifications",
]);

// Notification handler is configured in utils/notifications.ts (conditionally for non-Expo Go)

export default function RootLayout() {
  // Initialize push notifications
  useNotifications();

  return (
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
  );
}
