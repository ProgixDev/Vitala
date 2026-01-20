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
import { resetPassword, verifyResetCode } from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { OtpInput } from "react-native-otp-entry";
import Toast from "react-native-toast-message";
import PasswordStep from "./signup/components/PasswordStep";

type Step = "code" | "password";

export default function ResetPassword() {
  const { email, resetCode } = useLocalSearchParams<{
    email: string;
    resetCode?: string;
  }>();
  const [currentStep, setCurrentStep] = useState<Step>("code");
  const [code, setCode] = useState(resetCode || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      Toast.show({
        type: "error",
        text1: "Invalid Code",
        text2: "Please enter the 6-digit code",
      });
      return;
    }

    try {
      setIsLoading(true);
      await verifyResetCode(email, code);
      setCurrentStep("password");
    } catch (error: any) {
      console.error("Code verification error:", error);
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
    // Validate passwords
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
        text1: "Success",
        text2: "Password reset successfully",
      });

      // Navigate to sign in
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

  const handleResendCode = async () => {
    try {
      setIsLoading(true);
      const { forgotPassword } = await import("@/utils/api");
      await forgotPassword(email);
      setTimer(60); // Start 60 second timer
      Toast.show({
        type: "success",
        text1: "Code Sent",
        text2: "Check your email for a new code",
      });
    } catch {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not send reset code",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    router.replace("/(auth)/signin");
  };

  const handleBackToCode = () => {
    setCurrentStep("code");
  };

  if (currentStep === "password") {
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
          {/* Back Button */}
          <TouchableOpacity
            className="mt-12 ml-6 mb-4"
            onPress={handleBackToCode}
          >
            <Ionicons name="arrow-back" size={28} color="#2D3142" />
          </TouchableOpacity>

          <PasswordStep
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            showNewPassword={showNewPassword}
            setShowNewPassword={setShowNewPassword}
          />

          {/* Reset Button */}
          <View className="px-6">
            <TouchableOpacity
              className="bg-[#4461F2] rounded-[28px] h-14 justify-center items-center shadow-lg mb-8"
              onPress={handleResetPassword}
              disabled={isLoading}
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

  // Code verification step
  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white px-6"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button */}
        <TouchableOpacity className="mt-12 mb-8" onPress={handleBackToSignIn}>
          <Ionicons name="arrow-back" size={28} color="#2D3142" />
        </TouchableOpacity>

        {/* Title */}
        <Text className="text-4xl font-semibold text-[#2D3142] text-center mb-3">
          Verify Code
        </Text>
        <Text className="text-base text-gray-500 text-center mb-8">
          Enter the 6-digit code sent to {email}
        </Text>

        {/* OTP Input */}
        <View className="mb-6">
          <OtpInput
            numberOfDigits={6}
            focusColor="#4461F2"
            onTextChange={setCode}
            onFilled={(text) => setCode(text)}
            theme={{
              containerStyle: {
                marginBottom: 0,
              },
              pinCodeContainerStyle: {
                width: 50,
                height: 60,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#E0E0E0",
                backgroundColor: "#FFFFFF",
              },
              pinCodeTextStyle: {
                fontSize: 24,
                color: "#2D3142",
                fontWeight: "600",
              },
              focusedPinCodeContainerStyle: {
                borderColor: "#4461F2",
                borderWidth: 2,
              },
              filledPinCodeContainerStyle: {
                borderColor: "#4461F2",
              },
            }}
          />
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          className="bg-[#4461F2] rounded-[28px] h-14 justify-center items-center shadow-lg mb-6"
          onPress={handleVerifyCode}
          disabled={isLoading}
        >
          <Text className="text-lg font-semibold text-white">Verify Code</Text>
        </TouchableOpacity>

        {/* Resend Code */}
        <View className="items-center">
          <Text className="text-[15px] text-gray-500 mb-2">
            Didn&apos;t receive the code?
          </Text>
          <TouchableOpacity
            onPress={handleResendCode}
            disabled={timer > 0 || isLoading}
          >
            <Text
              className={`text-[15px] font-medium ${
                timer > 0 ? "text-gray-400" : "text-[#4461F2]"
              }`}
            >
              {timer > 0 ? `Resend in ${timer}s` : "Resend Code"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <LoadingScreen
        visible={isLoading}
        message="Verifying code..."
        subtitle="Please wait"
      />
    </KeyboardAvoidingView>
  );
}
