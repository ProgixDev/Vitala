import { StatusBar } from "expo-status-bar";
import React from "react";
import { View } from "react-native";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import PatientHomeUI from "@/components/PatientHomeUI";
import NurseHomeUI from "@/components/NurseHomeUI";
import { useFocusEffect } from "expo-router";

export default function Home() {
  const { currentUser, refreshUser } = useCurrentUser();

  const handleRefreshUser = async () => {
    await refreshUser();
  };

  useFocusEffect(() => {
    handleRefreshUser();
  });

  return (
    <View className="flex-1 pt-6 px-4">
      <StatusBar hidden />
      {currentUser?.userType === "nurse" ? <NurseHomeUI /> : <PatientHomeUI />}
    </View>
  );
}
