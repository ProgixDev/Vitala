import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

import LoadingScreen from "@/components/LoadingScreen";
import PasswordInput from "@/components/PasswordInput";
import { Button, IconButton, Text } from "@/components/ui";
import { resetPassword } from "@/utils/api";
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
      setTimeout(() => router.replace("/(auth)/signin"), 1500);
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
        <IconButton
          icon="chevron-back"
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          className="-ml-2 mb-6"
        />

        <Text variant="h1" color="foreground">
          Set a new password
        </Text>
        <Text variant="bodyLg" color="muted" className="mt-2 mb-8">
          Create a strong password for your account
        </Text>

        <PasswordInput
          label="New password"
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="At least 8 characters"
          showPassword={showPassword}
          setShowPassword={setShowPassword}
        />

        <View className="h-4" />

        <PasswordInput
          label="Confirm password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Re-enter new password"
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          error={passwordsDoNotMatch ? "Passwords do not match" : ""}
        />

        <Button
          label="Reset password"
          onPress={handleResetPassword}
          loading={isLoading}
          disabled={!newPassword || !confirmPassword || passwordsDoNotMatch}
          size="lg"
          className="mt-8"
        />
      </ScrollView>

      <LoadingScreen visible={isLoading} message="Resetting password..." subtitle="Please wait" />
    </KeyboardAvoidingView>
  );
}
