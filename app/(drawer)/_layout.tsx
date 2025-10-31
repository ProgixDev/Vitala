import { Stack } from "expo-router";
import React from "react";

export default function DrawerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="home/index" />
      <Stack.Screen name="schedules/index" />
      <Stack.Screen name="family-members/index" />
      <Stack.Screen name="payments/index" />
      <Stack.Screen name="medical-records/index" />
      <Stack.Screen name="privacy-policy/index" />
      <Stack.Screen name="help-center/index" />
      <Stack.Screen name="settings/index" />
    </Stack>
  );
}

