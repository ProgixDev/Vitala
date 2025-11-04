import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ChooseRole() {
  const goPatient = () => router.replace("/signup");
  const goNurse = () => router.replace("/signup/nurse");

  // Handle back button - go back to signin
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        router.replace("/signin");
        return true;
      }
    );

    return () => backHandler.remove();
  }, []);

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 gap-8">
          <Text className="text-4xl font-semibold text-[#2D3142] text-center">
            Create Account
          </Text>
          <Text className="text-base text-gray-500 text-center">
            Choose how you want to use Vitala
          </Text>

          <View className="gap-4">
            <TouchableOpacity
              onPress={goPatient}
              className="bg-[#4461F2] rounded-[28px] h-14 justify-center items-center shadow-lg"
            >
              <Text className="text-lg font-semibold text-white">
                Sign up as Patient
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={goNurse}
              className="bg-white border border-[#4461F2] rounded-[28px] h-14 justify-center items-center shadow-sm"
            >
              <Text className="text-lg font-semibold text-[#4461F2]">
                Sign up as Nurse
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => router.replace("/signin")}
            className="self-center mt-4"
          >
            <Text className="text-[15px] text-[#2D3142] font-medium">Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
