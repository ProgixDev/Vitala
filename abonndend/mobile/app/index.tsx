import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useThemeColors } from "@/constants/theme";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import {
  Onboarding,
  isOnboardingCompleted,
  markOnboardingCompleted,
} from "./onboarding";

export default function Index() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<
    boolean | null
  >(null);
  const { currentUser, loading } = useCurrentUser();
  const colors = useThemeColors();

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  // When onboarding is done, wait for auth state then go to tabs or signin (so logged-in users never see signin)
  useEffect(() => {
    if (hasCompletedOnboarding !== true || loading) return;
    if (currentUser) {
      router.replace("/(tabs)");
    } else {
      router.replace("/signin");
    }
  }, [hasCompletedOnboarding, loading, currentUser]);

  const checkOnboardingStatus = async () => {
    const completed = await isOnboardingCompleted();
    setHasCompletedOnboarding(completed);
  };

  const handleComplete = async () => {
    console.log(
      "Create account pressed - marking onboarding as completed and navigating to signup",
    );
    await markOnboardingCompleted();
    router.replace("/signup");
  };

  const handleLogin = async () => {
    console.log(
      "Login pressed - marking onboarding as completed and navigating to login",
    );
    await markOnboardingCompleted();
    router.replace("/signin");
  };

  // Show loading while checking onboarding or auth (so logged-in users never see signin screen)
  if (hasCompletedOnboarding === null) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (hasCompletedOnboarding) {
    // Auth check and navigation happen in useEffect; show loading until we redirect
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Show onboarding for first-time users
  return (
    <View className="flex-1">
      <Onboarding onComplete={handleComplete} onLogin={handleLogin} />
    </View>
  );
}
