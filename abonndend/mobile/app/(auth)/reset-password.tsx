import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import LoadingScreen from "@/components/LoadingScreen";
import { Button, IconButton, OtpInput, Text } from "@/components/ui";
import { resetPassword, verifyResetCode } from "@/utils/api";
import { router, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import PasswordStep from "./signup/components/PasswordStep";

type Step = "code" | "password";

export default function ResetPassword() {
  const { email, resetCode } = useLocalSearchParams<{
    email: string;
    resetCode?: string;
  }>();
  const [currentStep, setCurrentStep] = useState<Step>("code");
  const [code, setCode] = useState<string[]>(
    resetCode ? resetCode.split("") : ["", "", "", "", "", ""],
  );
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  const codeString = code.join("");
  const codeComplete = code.every((d) => !!d);

  const handleVerifyCode = async () => {
    if (!codeComplete) {
      Toast.show({
        type: "error",
        text1: "Invalid Code",
        text2: "Please enter the 6-digit code",
      });
      return;
    }
    try {
      setIsLoading(true);
      await verifyResetCode(email, codeString);
      setCurrentStep("password");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Invalid Code",
        text2: error?.message || "Code verification failed",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      await resetPassword(email, codeString, newPassword);
      Toast.show({ type: "success", text1: "Success", text2: "Password reset successfully" });
      setTimeout(() => router.replace("/(auth)/signin"), 1500);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "Failed to reset password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setIsLoading(true);
      const { forgotPassword } = await import("@/utils/api");
      await forgotPassword(email);
      setTimer(60);
      Toast.show({ type: "success", text1: "Code Sent", text2: "Check your email for a new code" });
    } catch {
      Toast.show({ type: "error", text1: "Error", text2: "Could not send reset code" });
    } finally {
      setIsLoading(false);
    }
  };

  if (currentStep === "password") {
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
            onPress={() => setCurrentStep("code")}
            accessibilityLabel="Back"
            className="-ml-2 mb-4"
          />
          <PasswordStep
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            showNewPassword={showNewPassword}
            setShowNewPassword={setShowNewPassword}
          />
          <Button
            label="Reset password"
            onPress={handleResetPassword}
            loading={isLoading}
            size="lg"
            className="mt-8"
          />
        </ScrollView>
        <LoadingScreen visible={isLoading} message="Resetting password..." subtitle="Please wait" />
      </KeyboardAvoidingView>
    );
  }

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
          onPress={() => router.replace("/(auth)/signin")}
          accessibilityLabel="Back to sign in"
          className="-ml-2 mb-6"
        />

        <Text variant="h1" color="foreground">
          Verify code
        </Text>
        <Text variant="bodyLg" color="muted" className="mt-2 mb-8">
          Enter the 6-digit code sent to{" "}
          <Text variant="bodyLg" color="foreground" weight="semibold">
            {email}
          </Text>
        </Text>

        <OtpInput value={code} onChange={setCode} />

        <Button
          label="Verify code"
          onPress={handleVerifyCode}
          loading={isLoading}
          disabled={!codeComplete}
          size="lg"
          className="mt-8"
        />

        <View className="flex-row items-center justify-center mt-6">
          <Text variant="body" color="muted">
            Didn&apos;t get it?{" "}
          </Text>
          <Pressable onPress={handleResendCode} disabled={timer > 0 || isLoading} hitSlop={8}>
            <Text
              variant="body"
              color={timer > 0 ? "muted" : "primary"}
              weight="semibold"
            >
              {timer > 0 ? `Resend in ${timer}s` : "Resend code"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <LoadingScreen visible={isLoading} message="Verifying code..." subtitle="Please wait" />
    </KeyboardAvoidingView>
  );
}
