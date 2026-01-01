import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import LoadingScreen from "@/components/LoadingScreen";
import PasswordInput from "@/components/PasswordInput";
import { resetPassword } from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";

export default function SetNewPassword() {
  const { email, code } = useLocalSearchParams<{ email: string; code: string }>();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const passwordsDoNotMatch =
    confirmPassword.length > 0 &&
    newPassword.length > 0 &&
    newPassword !== confirmPassword;

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      Toast.show({
        type: "error",
        text1: "Weak Password",
        text2: "Password must be at least 8 characters",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Password Mismatch",
        text2: "Passwords do not match",
      });
      return;
    }

    try {
      setIsLoading(true);
      await resetPassword(email, code, newPassword);

      Toast.show({
        type: "success",
        text1: "Success!",
        text2: "Password reset successfully",
      });

      setTimeout(() => {
        router.replace("/(auth)/signin");
      }, 1500);
    } catch (error: any) {
      console.error("Reset password error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "Failed to reset password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

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
        <View className="flex-1 px-6 pt-12">
          {/* Back Button */}
          <TouchableOpacity
            className="w-12 h-12 -ml-3 justify-center mb-8"
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={28} color="#2D3142" />
          </TouchableOpacity>

          {/* Title */}
          <Text className="text-4xl font-semibold text-[#2D3142] text-center mb-3">
            Set New Password
          </Text>
          <Text className="text-base text-gray-500 text-center mb-12">
            Create a strong password for your account
          </Text>

          {/* New Password Input */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-[#2D3142] mb-2">
              New Password
            </Text>
            <PasswordInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
            <Text className="text-xs text-gray-500 mt-2">
              Must be at least 8 characters
            </Text>
          </View>

          {/* Confirm Password Input */}
          <View className="mb-8">
            <Text className="text-sm font-medium text-[#2D3142] mb-2">
              Confirm Password
            </Text>
            <PasswordInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter new password"
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              error={passwordsDoNotMatch ? "Passwords do not match" : ""}
            />
          </View>

          {/* Reset Button */}
          <TouchableOpacity
            className={`rounded-[28px] h-14 justify-center items-center shadow-lg ${
              !newPassword || !confirmPassword || passwordsDoNotMatch
                ? "bg-[#B8C5E8]"
                : "bg-[#4461F2]"
            }`}
            onPress={handleResetPassword}
            disabled={!newPassword || !confirmPassword || passwordsDoNotMatch || isLoading}
          >
            <Text className="text-lg font-semibold text-white">
              Reset Password
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <LoadingScreen
        visible={isLoading}
        message="Resetting password..."
        subtitle="Please wait"
      />
    </KeyboardAvoidingView>
  );
}
