import { useCurrentUser } from "@/hooks/useCurrentUser";
import { changePassword } from "@/utils/api";
import PasswordInput from "@/components/PasswordInput";
import { Button, Card, Header, Screen, Text } from "@/components/ui";
import { useThemeColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";

export default function ChangePassword() {
  const { currentUser } = useCurrentUser();
  const colors = useThemeColors();
  const [loading, setLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!currentUser?.token) return;

    // Validation
    if (!currentPassword.trim()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter your current password",
      });
      return;
    }

    if (!newPassword.trim()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter a new password",
      });
      return;
    }

    if (newPassword.length < 6) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Password must be at least 6 characters long",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "New passwords do not match",
      });
      return;
    }

    if (currentPassword === newPassword) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "New password must be different from current password",
      });
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentUser.token, {
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      });

      Toast.show({
        type: "success",
        text1: "Password Changed",
        text2: "Your password has been changed successfully",
      });

      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Go back after a short delay
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Change Failed",
        text2: error.message || "Failed to change password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll keyboardAvoiding>
      <Header title="Change Password" onBack={() => router.back()} />

      <View className="mt-4">
        <Card elevation="e1">
          {/* Current Password */}
          <PasswordInput
            label="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Enter current password"
            showIcon
            showPassword={showCurrentPassword}
            setShowPassword={setShowCurrentPassword}
          />

          {/* New Password */}
          <View className="mt-4">
            <PasswordInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              showIcon
              showPassword={showNewPassword}
              setShowPassword={setShowNewPassword}
            />
          </View>

          {/* Confirm New Password */}
          <View className="mt-4 mb-6">
            <PasswordInput
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              showIcon
              showPassword={showConfirmPassword}
              setShowPassword={setShowConfirmPassword}
            />
          </View>

          {/* Change Password Button */}
          <Button
            label={loading ? "Changing Password..." : "Change Password"}
            onPress={handleChangePassword}
            loading={loading}
            size="lg"
          />
        </Card>

        {/* Security Tips */}
        <Card elevation="none" className="bg-primary-soft border-transparent mt-6">
          <View className="flex-row items-start">
            <Ionicons
              name="information-circle"
              size={20}
              color={colors.primary}
              style={{ marginTop: 2, marginRight: 12 }}
            />
            <View className="flex-1">
              <Text variant="label" color="primary" className="mb-2">
                Password Security Tips
              </Text>
              <Text variant="body" color="primary">
                • Use at least 8 characters{"\n"}• Include uppercase and
                lowercase letters{"\n"}• Add numbers and special characters
                {"\n"}• Avoid using personal information
              </Text>
            </View>
          </View>
        </Card>
      </View>
    </Screen>
  );
}
