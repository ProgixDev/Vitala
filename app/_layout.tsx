import { Stack } from "expo-router";
import { View } from "react-native";
import "./global.css";

export default function RootLayout() {
  return (
    <View className="flex-1 bg-gray-100">
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "transparent" },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </View>
  );
}
