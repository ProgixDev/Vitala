import { appointmentStorage } from "@/utils/appointments";
import { authStorage } from "@/utils/auth";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  BackHandler,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { resetOnboardingStatus } from "../onboarding";

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
  rightElement?: React.ReactNode;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  showArrow = true,
  rightElement,
}) => (
  <TouchableOpacity
    className="flex-row items-center justify-between py-3 px-4"
    onPress={onPress}
    activeOpacity={0.7}
    disabled={!onPress && !rightElement}
  >
    <View className="flex-row items-center flex-1">
      <View className="w-10 h-10 rounded-[10px] bg-[#F0F2FF] items-center justify-center mr-3">
        <Ionicons name={icon} size={22} color="#4461F2" />
      </View>
      <View className="flex-1">
        <Text className="text-[15px] font-medium text-gray-800 mb-0.5">
          {title}
        </Text>
        {subtitle && (
          <Text className="text-[13px] text-gray-500">{subtitle}</Text>
        )}
      </View>
    </View>
    {rightElement ||
      (showArrow && (
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      ))}
  </TouchableOpacity>
);

export default function Settings() {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [locationServices, setLocationServices] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(false);

  // Handle back button - go back to profile page
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        router.replace("/(tabs)/profile");
        return true;
      },
    );

    return () => backHandler.remove();
  }, []);

  const handleLogout = async () => {
    Toast.show({
      type: "info",
      text1: "Logout",
      text2: "Are you sure you want to logout?",
      position: "bottom",
      visibilityTime: 4000,
      onPress: async () => {
        try {
          await authStorage.setLoggedOut();
          router.replace("/signin");
        } catch (error) {
          console.error("Error logging out:", error);
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Failed to logout. Please try again.",
          });
        }
      },
    });
  };

  const handleResetOnboarding = async () => {
    try {
      await resetOnboardingStatus();
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Onboarding status has been reset!",
      });
    } catch (error) {
      console.error("Error resetting onboarding:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to reset onboarding. Please try again.",
      });
    }
  };

  const handleClearAllUsers = async () => {
    try {
      await authStorage.clearAllUsers();
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "All users have been cleared!",
      });
    } catch (error) {
      console.error("Error clearing users:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to clear users. Please try again.",
      });
    }
  };

  const handleClearAllAppointments = async () => {
    try {
      await appointmentStorage.clearAppointments();
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "All appointments have been cleared!",
      });
    } catch (error) {
      console.error("Error clearing appointments:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to clear appointments. Please try again.",
      });
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-[60px] pb-4 bg-white border-b border-gray-100">
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center"
          onPress={() => router.replace("/(tabs)/profile")}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-800">Settings</Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Settings */}
        <View className="px-6 mt-6">
          <Text className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">
            Account
          </Text>
          <View className="bg-white rounded-2xl py-2 shadow-sm">
            <SettingItem
              icon="person-outline"
              title="Edit Profile"
              subtitle="Update your personal information"
              onPress={() => router.push("/profile/my-profile")}
            />
            <View className="h-px bg-gray-100 ml-[68px]" />
            <SettingItem
              icon="key-outline"
              title="Change Password"
              subtitle="Update your password"
              onPress={() => console.log("Change Password")}
            />
            <View className="h-px bg-gray-100 ml-[68px]" />
            <SettingItem
              icon="shield-checkmark-outline"
              title="Privacy & Security"
              subtitle="Control your privacy settings"
              onPress={() => console.log("Privacy & Security")}
            />
          </View>
        </View>
        {/* Notifications */}
        <View className="px-6 mt-6">
          <Text className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">
            Notifications
          </Text>
          <View className="bg-white rounded-2xl py-2 shadow-sm">
            <SettingItem
              icon="notifications-outline"
              title="Push Notifications"
              subtitle="Receive push notifications"
              showArrow={false}
              rightElement={
                <Switch
                  value={pushNotifications}
                  onValueChange={setPushNotifications}
                  trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
                  thumbColor={pushNotifications ? "#4461F2" : "#F3F4F6"}
                />
              }
            />
            <View className="h-px bg-gray-100 ml-[68px]" />
            <SettingItem
              icon="mail-outline"
              title="Email Notifications"
              subtitle="Receive email updates"
              showArrow={false}
              rightElement={
                <Switch
                  value={emailNotifications}
                  onValueChange={setEmailNotifications}
                  trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
                  thumbColor={emailNotifications ? "#4461F2" : "#F3F4F6"}
                />
              }
            />
            <View className="h-px bg-gray-100 ml-[68px]" />
            <SettingItem
              icon="chatbubble-outline"
              title="SMS Notifications"
              subtitle="Receive SMS alerts"
              showArrow={false}
              rightElement={
                <Switch
                  value={smsNotifications}
                  onValueChange={setSmsNotifications}
                  trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
                  thumbColor={smsNotifications ? "#4461F2" : "#F3F4F6"}
                />
              }
            />
          </View>
        </View>
        {/* Privacy */}
        <View className="px-6 mt-6">
          <Text className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">
            Privacy
          </Text>
          <View className="bg-white rounded-2xl py-2 shadow-sm">
            <SettingItem
              icon="location-outline"
              title="Location Services"
              subtitle="Allow app to access your location"
              showArrow={false}
              rightElement={
                <Switch
                  value={locationServices}
                  onValueChange={setLocationServices}
                  trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
                  thumbColor={locationServices ? "#4461F2" : "#F3F4F6"}
                />
              }
            />
            <View className="h-px bg-gray-100 ml-[68px]" />
            <SettingItem
              icon="finger-print-outline"
              title="Biometric Authentication"
              subtitle="Use fingerprint or face ID"
              showArrow={false}
              rightElement={
                <Switch
                  value={biometricAuth}
                  onValueChange={setBiometricAuth}
                  trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
                  thumbColor={biometricAuth ? "#4461F2" : "#F3F4F6"}
                />
              }
            />
          </View>
        </View>
        {/* App Settings */}
        <View className="px-6 mt-6">
          <Text className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">
            App Settings
          </Text>
          <View className="bg-white rounded-2xl py-2 shadow-sm">
            <SettingItem
              icon="language-outline"
              title="Language"
              subtitle="English"
              onPress={() => console.log("Language")}
            />
            <View className="h-px bg-gray-100 ml-[68px]" />
            <SettingItem
              icon="moon-outline"
              title="Dark Mode"
              subtitle="Coming soon"
              showArrow={false}
              rightElement={
                <Switch
                  value={false}
                  disabled={true}
                  trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
                  thumbColor="#F3F4F6"
                />
              }
            />
            <View className="h-px bg-gray-100 ml-[68px]" />
            <SettingItem
              icon="download-outline"
              title="App Updates"
              subtitle="Check for updates"
              onPress={() => console.log("App Updates")}
            />
          </View>
        </View>
        {/* Support */}
        <View className="px-6 mt-6">
          <Text className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">
            Support
          </Text>
          <View className="bg-white rounded-2xl py-2 shadow-sm">
            <SettingItem
              icon="help-circle-outline"
              title="Help Center"
              subtitle="Get help and support"
              onPress={() => console.log("Help Center")}
            />
            <View className="h-px bg-gray-100 ml-[68px]" />
            <SettingItem
              icon="document-text-outline"
              title="Terms & Conditions"
              subtitle="Read our terms"
              onPress={() => console.log("Terms & Conditions")}
            />
            <View className="h-px bg-gray-100 ml-[68px]" />
            <SettingItem
              icon="shield-outline"
              title="Privacy Policy"
              subtitle="Read our privacy policy"
              onPress={() => console.log("Privacy Policy")}
            />
          </View>
        </View>
        {/* Developer Tools */}
        <View className="px-6 mt-6">
          <Text className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">
            Developer Tools
          </Text>
          <View className="bg-white rounded-2xl py-2 shadow-sm">
            <TouchableOpacity
              className="flex-row items-center justify-between py-3 px-4"
              onPress={handleClearAllUsers}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-[10px] bg-[#FEF3C7] items-center justify-center mr-3">
                  <Ionicons name="people-outline" size={22} color="#F97316" />
                </View>
                <View className="flex-1">
                  <Text className="text-[15px] font-medium text-orange-600 mb-0.5">
                    Clear All Users
                  </Text>
                  <Text className="text-[13px] text-gray-500">
                    Delete all user accounts
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
            <View className="h-px bg-gray-100 ml-[68px]" />
            <TouchableOpacity
              className="flex-row items-center justify-between py-3 px-4"
              onPress={handleClearAllAppointments}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-[10px] bg-[#FEF3C7] items-center justify-center mr-3">
                  <Ionicons name="calendar-outline" size={22} color="#F97316" />
                </View>
                <View className="flex-1">
                  <Text className="text-[15px] font-medium text-orange-600 mb-0.5">
                    Clear All Appointments
                  </Text>
                  <Text className="text-[13px] text-gray-500">
                    Delete all appointments
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Actions */}
        <View className="px-6 mt-6">
          <Text className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">
            Account Actions
          </Text>
          <View className="bg-white rounded-2xl py-2 shadow-sm">
            <TouchableOpacity
              className="flex-row items-center justify-between py-3 px-4"
              onPress={handleResetOnboarding}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-[10px] bg-[#F0F2FF] items-center justify-center mr-3">
                  <Ionicons name="refresh-outline" size={22} color="#DC2626" />
                </View>
                <View className="flex-1">
                  <Text className="text-[15px] font-medium text-red-600 mb-0.5">
                    Reset Onboarding
                  </Text>
                  <Text className="text-[13px] text-gray-500">
                    Show onboarding flow again
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
            <View className="h-px bg-gray-100 ml-[68px]" />
            <TouchableOpacity
              className="flex-row items-center justify-between py-3 px-4"
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-[10px] bg-[#F0F2FF] items-center justify-center mr-3">
                  <Ionicons name="log-out-outline" size={22} color="#DC2626" />
                </View>
                <View className="flex-1">
                  <Text className="text-[15px] font-medium text-red-600 mb-0.5">
                    Logout
                  </Text>
                  <Text className="text-[13px] text-gray-500">
                    Sign out of your account
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
