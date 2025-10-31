import { Stack } from "expo-router";
import { DrawerProvider } from "../src/navigation/drawer/DrawerProvider";

export default function RootLayout() {
  return (
    <DrawerProvider
      userName="User Name"
      userID="UID000 000 000"
      // userAvatar="https://example.com/avatar.jpg" // Optional
    >
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Onboarding - NO DRAWER */}
        <Stack.Screen name="index" />

        {/* Auth pages - NO DRAWER */}
        <Stack.Screen name="signin/index" />
        <Stack.Screen name="signup/index" />

        {/* Authenticated pages - HAS TABS + DRAWER */}
        <Stack.Screen name="(tabs)" />
      </Stack>
    </DrawerProvider>
  );
}
