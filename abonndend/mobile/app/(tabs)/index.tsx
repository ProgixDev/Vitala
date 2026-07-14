import NurseHomeUI from "@/components/NurseHomeUI";
import PatientHomeUI from "@/components/PatientHomeUI";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { BackHandler } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const { currentUser } = useCurrentUser();

  // Handle back button - prevent going back from home screen
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true, // prevent app exit
    );
    return () => backHandler.remove();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background px-6" edges={["top"]}>
      <StatusBar hidden />
      {currentUser?.userType === "nurse" ? <NurseHomeUI /> : <PatientHomeUI />}
    </SafeAreaView>
  );
}
