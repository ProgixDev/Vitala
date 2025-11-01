import { Stack, router } from "expo-router";
import { View, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { authStorage } from "@/utils/auth";

export default function Layout() {
  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    const isLoggedIn = await authStorage.isLoggedIn();
    if (isLoggedIn) {
      router.replace("/(tabs)");
    }
  };

  return (
    <>
      <StatusBar hidden />
      <View className="flex-1 px-4 py-6">
        {/* Logo */}
        <View className="items-center">
          <Image
            source={require("@/assets/images/Logo.png")}
            className="w-[50%]"
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
          <Stack.Screen name="signup/index" />
        </Stack>
      </View>
    </>
  );
}
