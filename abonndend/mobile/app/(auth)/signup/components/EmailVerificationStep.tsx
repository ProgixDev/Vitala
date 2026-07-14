import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button, Card, OtpInput, Text } from "@/components/ui";
import { useThemeColors } from "@/constants/theme";

interface EmailVerificationStepProps {
  code: string[];
  setCode: (value: string[]) => void;
  timer: number;
  onResend: () => void;
  onVerify: () => void;
  email: string;
  isLoading?: boolean;
}

export default function EmailVerificationStep({
  code,
  setCode,
  timer,
  onResend,
  onVerify,
  email,
  isLoading = false,
}: EmailVerificationStepProps) {
  const colors = useThemeColors();
  const safeCode = Array.isArray(code) ? code : ["", "", "", "", "", ""];
  const complete = safeCode.every((d) => !!d);

  return (
    <View className="pt-4">
      <View className="w-14 h-14 rounded-lg bg-primary-soft items-center justify-center mb-5">
        <Ionicons name="mail-open-outline" size={26} color={colors.primary} />
      </View>

      <Text variant="h1" color="foreground">
        Verify your email
      </Text>
      <Text variant="bodyLg" color="muted" className="mt-2 mb-7">
        Enter the 6-digit code we sent to{" "}
        <Text variant="bodyLg" color="foreground" weight="semibold">
          {email}
        </Text>
      </Text>

      <OtpInput value={safeCode} onChange={setCode} />

      {/* Resend */}
      <View className="flex-row items-center justify-center mt-6">
        <Text variant="body" color="muted">
          Didn&apos;t get it?{" "}
        </Text>
        <Pressable onPress={onResend} disabled={timer > 0} hitSlop={8}>
          <Text
            variant="body"
            color={timer > 0 ? "muted" : "primary"}
            weight="semibold"
          >
            {timer > 0 ? `Resend in ${timer}s` : "Resend code"}
          </Text>
        </Pressable>
      </View>

      {/* Info */}
      <Card elevation="none" className="mt-6 bg-primary-soft border-0 flex-row items-start">
        <Ionicons
          name="information-circle-outline"
          size={18}
          color={colors.primary}
          style={{ marginRight: 8, marginTop: 1 }}
        />
        <Text variant="caption" color="primary" className="flex-1">
          Check your inbox and spam folder. The code expires in 10 minutes.
        </Text>
      </Card>

      <Button
        label={isLoading ? "Verifying…" : "Verify email"}
        onPress={onVerify}
        loading={isLoading}
        disabled={!complete}
        size="lg"
        className="mt-6"
      />
    </View>
  );
}
