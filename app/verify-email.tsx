import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import LoadingScreen from "@/components/LoadingScreen";
import { verifyEmail } from "@/utils/api";
import { router, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";

export default function VerifyEmail() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (token) {
      handleVerifyEmail(token);
    }
  }, [token]);

  const handleVerifyEmail = async (verificationToken: string) => {
    try {
      setIsLoading(true);
      await verifyEmail(verificationToken);
      setIsVerified(true);
      Toast.show({
        type: "success",
        text1: "Email Verified",
        text2: "Your email has been successfully verified. You can now sign in.",
      });
    } catch (error) {
      console.error("Email verification error:", error);
      Toast.show({
        type: "error",
        text1: "Verification Failed",
        text2: "The verification link is invalid or has expired. Please try signing up again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    router.replace("/signin");
  };

  if (isLoading) {
    return (
      <LoadingScreen visible={true} message="Verifying your email..." />
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6">
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
              <Text className="text-3xl">✓</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              {isVerified ? "Email Verified!" : "Verify Your Email"}
            </Text>
            <Text className="text-gray-600 text-center leading-6">
              {isVerified
                ? "Your email has been successfully verified. You can now sign in to your account."
                : "We're verifying your email address. Please wait..."
              }
            </Text>
          </View>

          {isVerified && (
            <TouchableOpacity
              className="bg-[#4461F2] rounded-[28px] h-14 justify-center items-center shadow-lg mb-8"
              onPress={handleSignIn}
            >
              <Text className="text-lg font-semibold text-white">
                Sign In
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}