import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import LoadingScreen from "@/components/LoadingScreen";
import { Button, Card, IconButton, OtpInput, Text } from "@/components/ui";
import { useThemeColors } from "@/constants/theme";
import { router, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";

export default function VerifyResetCode() {
  const { email, resetCode } = useLocalSearchParams<{
    email: string;
    resetCode?: string;
  }>();
  const colors = useThemeColors();
  const [code, setCode] = useState<string[]>(
    resetCode ? resetCode.split("") : ["", "", "", "", "", ""],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  const complete = code.every((digit) => !!digit);

  const handleVerifyCode = () => {
    if (!complete) {
      Toast.show({
        type: "error",
        text1: "Incomplete Code",
        text2: "Please enter all 6 digits",
      });
      return;
    }
    router.push({
      pathname: "/(auth)/set-new-password",
      params: { email, code: code.join("") },
    });
  };

  const handleResendCode = async () => {
    try {
      setIsLoading(true);
      const { forgotPassword } = await import("@/utils/api");
      await forgotPassword(email);
      Toast.show({
        type: "success",
        text1: "Code Sent",
        text2: "A new code has been sent to your email",
      });
      setTimer(60);
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "Could not resend code",
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
          onPress={() => router.replace("/(auth)/signin")}
          accessibilityLabel="Back to sign in"
          className="-ml-2 mb-6"
        />

        <Text variant="h1" color="foreground">
          Reset password
        </Text>
        <Text variant="bodyLg" color="muted" className="mt-2 mb-8">
          Enter the 6-digit code we sent to{" "}
          <Text variant="bodyLg" color="foreground" weight="semibold">
            {email}
          </Text>
        </Text>

        <OtpInput value={code} onChange={setCode} />

        <View className="flex-row items-center justify-center mt-6">
          <Text variant="body" color="muted">
            Didn&apos;t get it?{" "}
          </Text>
          <Pressable
            onPress={handleResendCode}
            disabled={timer > 0 || isLoading}
            hitSlop={8}
          >
            <Text
              variant="body"
              color={timer > 0 || isLoading ? "muted" : "primary"}
              weight="semibold"
            >
              {timer > 0 ? `Resend in ${timer}s` : "Resend code"}
            </Text>
          </Pressable>
        </View>

        <Card elevation="none" className="mt-6 bg-primary-soft border-0 flex-row items-start">
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={colors.primary}
            style={{ marginRight: 8, marginTop: 1 }}
          />
          <Text variant="caption" color="primary" className="flex-1">
            Check your inbox and spam folder. The code expires in 30 minutes.
          </Text>
        </Card>

        <Button
          label="Continue"
          onPress={handleVerifyCode}
          disabled={!complete}
          size="lg"
          className="mt-8"
        />
      </ScrollView>

      <LoadingScreen visible={isLoading} message="Sending code..." subtitle="Please wait" />
    </KeyboardAvoidingView>
  );
}
