import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect } from "react";
import { Image, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function Layout() {
  const { isLoggedIn } = useCurrentUser();

  const checkLoginStatus = useCallback(async () => {
    const _ = await isLoggedIn();
    if (_) {
      router.replace("/(tabs)");
    }
  }, [isLoggedIn]);

  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  return (
    <SafeAreaProvider>
      <StatusBar hidden />
      <SafeAreaView className="flex-1 bg-background px-6 pt-2 pb-4" edges={["top", "bottom"]}>
        {/* Logo */}
        <View className="items-center mb-2">
          <Image
            source={require("@/assets/images/Logo.png")}
            className="w-[46%]"
            resizeMode="contain"
          />
        </View>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "transparent" },
          }}
        >
          <Stack.Screen name="signin/index" />
          <Stack.Screen name="signup/choose" />
          <Stack.Screen name="signup/index" />
          <Stack.Screen name="signup/nurse/index" />
        </Stack>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
