import React from "react";
import { View } from "react-native";
import PasswordInput from "@/components/PasswordInput";
import { Card, Text } from "@/components/ui";

interface PasswordStepProps {
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  showNewPassword: boolean;
  setShowNewPassword: (value: boolean) => void;
}

export default function PasswordStep({
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  showNewPassword,
  setShowNewPassword,
}: PasswordStepProps) {
  const passwordsDoNotMatch =
    confirmPassword.length > 0 &&
    newPassword.length > 0 &&
    newPassword !== confirmPassword;

  return (
    <View>
      <Text variant="h1" color="foreground">
        Set a password
      </Text>
      <Text variant="bodyLg" color="muted" className="mt-2 mb-7">
        Choose a strong password to keep your health data safe
      </Text>

      <PasswordInput
        label="New password"
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="At least 8 characters"
        showPassword={showNewPassword}
        setShowPassword={setShowNewPassword}
      />

      <View className="h-4" />

      <PasswordInput
        label="Confirm password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Re-enter your password"
        showPassword={showNewPassword}
        setShowPassword={setShowNewPassword}
        error={passwordsDoNotMatch ? "Passwords do not match" : ""}
      />

      <Card elevation="none" className="mt-5 bg-primary-soft border-0 flex-row">
        <Text variant="caption" color="primary" className="flex-1">
          Use a mix of letters, numbers and symbols. Avoid reusing a password
          from another account.
        </Text>
      </Card>
    </View>
  );
}
