import { useCurrentUser } from "@/hooks/useCurrentUser";
import { changePassword } from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function ChangePassword() {
  const { currentUser } = useCurrentUser();
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
    <View className="flex-1 bg-[#F9FAFB]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-[60px] pb-4 bg-white border-b border-[#F3F4F6]">
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-[#1F2937]">
          Change Password
        </Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 mt-6">
          <View className="bg-white rounded-2xl p-5 shadow-sm">
            {/* Current Password */}
            <View className="mb-4">
              <Text className="text-[13px] text-[#6B7280] mb-2">
                Current Password
              </Text>
              <View className="relative">
                <TextInput
                  className="border border-[#D1D5DB] rounded-lg px-4 py-3 pr-12 text-base"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                  secureTextEntry={!showCurrentPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  className="absolute right-3 top-3.5"
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  <Ionicons
                    name={showCurrentPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password */}
            <View className="mb-4">
              <Text className="text-[13px] text-[#6B7280] mb-2">
                New Password
              </Text>
              <View className="relative">
                <TextInput
                  className="border border-[#D1D5DB] rounded-lg px-4 py-3 pr-12 text-base"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  className="absolute right-3 top-3.5"
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <Ionicons
                    name={showNewPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
              <Text className="text-xs text-[#9CA3AF] mt-1">
                Password must be at least 6 characters long
              </Text>
            </View>

            {/* Confirm New Password */}
            <View className="mb-6">
              <Text className="text-[13px] text-[#6B7280] mb-2">
                Confirm New Password
              </Text>
              <View className="relative">
                <TextInput
                  className="border border-[#D1D5DB] rounded-lg px-4 py-3 pr-12 text-base"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  className="absolute right-3 top-3.5"
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Change Password Button */}
            <TouchableOpacity
              className={`w-full py-4 rounded-xl items-center ${
                loading ? "bg-[#9CA3AF]" : "bg-[#4461F2]"
              }`}
              onPress={handleChangePassword}
              disabled={loading}
            >
              <Text className="text-white font-semibold text-base">
                {loading ? "Changing Password..." : "Change Password"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Security Tips */}
          <View className="bg-blue-50 rounded-xl p-4 mt-6">
            <View className="flex-row items-start">
              <Ionicons
                name="information-circle"
                size={20}
                color="#3B82F6"
                className="mt-0.5 mr-3"
              />
              <View className="flex-1">
                <Text className="text-sm font-medium text-[#1E40AF] mb-2">
                  Password Security Tips
                </Text>
                <Text className="text-sm text-[#3B82F6] leading-5">
                  • Use at least 8 characters{"\n"}• Include uppercase and
                  lowercase letters{"\n"}• Add numbers and special characters
                  {"\n"}• Avoid using personal information
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
