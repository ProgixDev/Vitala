import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      // TEMPORARY: Force welcome screen to show for testing
      // Remove or comment out the next line when done testing
      await AsyncStorage.removeItem("@vitala_first_launch");

      const hasLaunched = await AsyncStorage.getItem("@vitala_first_launch");

      if (hasLaunched === null) {
        // First launch
        setIsFirstLaunch(true);
      } else {
        // Not first launch
        setIsFirstLaunch(false);
      }
    } catch (error) {
      console.error("Error checking first launch:", error);
      setIsFirstLaunch(false);
    }
  };

  useEffect(() => {
    if (isFirstLaunch === null) {
      // Still loading
      return;
    }

    const inWelcome = segments[0] === "welcome";

    if (isFirstLaunch && !inWelcome) {
      // First launch and not in welcome screen, navigate to welcome
      router.replace("/welcome");
    } else if (!isFirstLaunch && inWelcome) {
      // Not first launch but in welcome screen, navigate to tabs
      router.replace("/(tabs)");
    }
  }, [isFirstLaunch, segments]);

  // Don't render anything while checking first launch status
  if (isFirstLaunch === null) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
