import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import LoadingScreen from "@/components/LoadingScreen";
import { Button, Text } from "@/components/ui";
import { verifyEmail } from "@/utils/api";
import { useThemeColors } from "@/constants/theme";
import { router, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";

export default function VerifyEmail() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const colors = useThemeColors();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (token) handleVerifyEmail(token);
  }, [token]);

  const handleVerifyEmail = async (verificationToken: string) => {
    try {
      setIsLoading(true);
      await verifyEmail(verificationToken);
      setIsVerified(true);
      Toast.show({
        type: "success",
        text1: "Email Verified",
        text2: "Your email has been verified. You can now sign in.",
      });
    } catch (error) {
      console.error("Email verification error:", error);
      Toast.show({
        type: "error",
        text1: "Verification Failed",
        text2: "The link is invalid or has expired. Please try signing up again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen visible message="Verifying your email..." />;
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center mb-8">
          <View
            className={`w-20 h-20 rounded-full items-center justify-center mb-4 ${
              isVerified ? "bg-accent-soft" : "bg-primary-soft"
            }`}
          >
            <Ionicons
              name={isVerified ? "checkmark-circle" : "mail-open-outline"}
              size={40}
              color={isVerified ? colors.accent : colors.primary}
            />
          </View>
          <Text variant="h1" color="foreground" className="text-center">
            {isVerified ? "Email verified" : "Verify your email"}
          </Text>
          <Text variant="body" color="muted" className="text-center mt-2 px-4">
            {isVerified
              ? "Your email has been verified. You can now sign in to your account."
              : "We're verifying your email address. Please wait…"}
          </Text>
        </View>

        {isVerified && (
          <Button
            label="Sign in"
            onPress={() => router.replace("/signin")}
            size="lg"
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
