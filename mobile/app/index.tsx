import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import {
  Onboarding,
  isOnboardingCompleted,
  markOnboardingCompleted,
} from "./onboarding";

export default function Index() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    const completed = await isOnboardingCompleted();
    setHasCompletedOnboarding(completed);

    // If onboarding is completed, navigate to signin
    if (completed) {
      router.push("/signin");
    }
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

  // Show loading or onboarding based on status
  if (hasCompletedOnboarding === null) {
    // Still checking status, could show a loading screen here
    return <View className="flex-1" />;
  }

  if (hasCompletedOnboarding) {
    // User has completed onboarding, navigation will happen in useEffect
    return <View className="flex-1" />;
  }

  // Show onboarding for first-time users
  return (
    <View className="flex-1">
      <Onboarding onComplete={handleComplete} onLogin={handleLogin} />
    </View>
  );
}
