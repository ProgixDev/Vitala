import React from "react";
import { View, Text } from "react-native";
import PasswordInput from "@/components/PasswordInput";

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
    <>
      <Text className="text-4xl font-semibold text-[#2D3142] text-center my-[15%]">
        Set Password
      </Text>

      <View className="mb-5">
        <PasswordInput
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="New password"
          showPassword={showNewPassword}
          setShowPassword={setShowNewPassword}
        />
      </View>

      <View className="mb-5">
        <PasswordInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm password"
          showPassword={showNewPassword}
          setShowPassword={setShowNewPassword}
          error={passwordsDoNotMatch ? "Passwords do not match" : ""}
        />
      </View>
    </>
  );
}
