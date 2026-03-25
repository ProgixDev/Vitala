import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { BackHandler, Text, TouchableOpacity, View } from "react-native";

/**
 * Screen shown when a nurse logs in with status "pending" (unapproved).
 * Explains that their account is under review and offers logout.
 */
export default function PendingVerification() {
  const { currentUser, logout } = useCurrentUser();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        return true;
      },
    );
    return () => backHandler.remove();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/signin");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <View className="flex-1 bg-[#F9FAFB] justify-center items-center px-8">
      <View className="w-20 h-20 rounded-full bg-[#4461F2]/10 justify-center items-center mb-6">
        <Ionicons name="time-outline" size={48} color="#4461F2" />
      </View>
      <Text className="text-xl font-semibold text-[#1F2937] text-center mb-2">
        Account Pending Verification
      </Text>
      <Text className="text-base text-[#6B7280] text-center mb-8">
        Thank you for registering as a nurse. Your account is under review. We
        will notify you once it has been approved. If you have questions,
        please contact support.
      </Text>
      <TouchableOpacity
        className="bg-[#4461F2] px-8 py-4 rounded-full w-full max-w-xs"
        onPress={handleLogout}
      >
        <Text className="text-white text-center font-semibold text-base">
          Sign out
        </Text>
      </TouchableOpacity>
    </View>
  );
}
