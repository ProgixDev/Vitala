import NurseHomeUI from "@/components/NurseHomeUI";
import PatientHomeUI from "@/components/PatientHomeUI";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { BackHandler, View } from "react-native";

export default function Home() {
  const { currentUser, refreshUser } = useCurrentUser();

  const handleRefreshUser = async () => {
    await refreshUser();
  };

  useFocusEffect(() => {
    handleRefreshUser();
  });

  // Handle back button - prevent going back from home screen
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        // Return true to prevent default back behavior (exit app)
        return true;
      }
    );

    return () => backHandler.remove();
  }, []);

  return (
    <View className="flex-1 pt-6 px-4">
      <StatusBar hidden />
      {currentUser?.userType === "nurse" ? <NurseHomeUI /> : <PatientHomeUI />}
    </View>
  );
}
