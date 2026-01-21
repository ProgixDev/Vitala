import LoadingScreen from "@/components/LoadingScreen";
import { getSettings, updateSettings } from "@/utils/api";
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
  const [language, setLanguage] = useState("en");
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { accessToken } = await authStorage.getTokens();
        if (accessToken) {
          const response = await getSettings(accessToken);
          const settings = response.data;

          setPushNotifications(settings.notifications?.push ?? true);
          setEmailNotifications(settings.notifications?.email ?? true);
          setSmsNotifications(settings.notifications?.sms ?? false);
          setLocationServices(settings.privacy?.shareLocation ?? true);
          setBiometricAuth(settings.preferences?.biometricAuth ?? false);
          setLanguage(settings.preferences?.language ?? "en");
          setDarkMode(settings.preferences?.darkMode ?? false);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to load settings",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

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

  // Helper function to update settings
  const updateUserSettings = async (updates: any) => {
    try {
      const { accessToken } = await authStorage.getTokens();
      if (accessToken) {
        await updateSettings(accessToken, updates);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Settings updated successfully",
        });
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to update settings",
      });
      // Revert the change on error
      throw error;
    }
  };

  // Toggle handlers
  const handlePushNotificationsToggle = async (value: boolean) => {
    setPushNotifications(value);
    try {
      await updateUserSettings({
        notifications: { push: value },
      });
    } catch {
      setPushNotifications(!value); // Revert on error
    }
  };

  const handleEmailNotificationsToggle = async (value: boolean) => {
    setEmailNotifications(value);
    try {
      await updateUserSettings({
        notifications: { email: value },
      });
    } catch {
      setEmailNotifications(!value); // Revert on error
    }
  };

  const handleSmsNotificationsToggle = async (value: boolean) => {
    setSmsNotifications(value);
    try {
      await updateUserSettings({
        notifications: { sms: value },
      });
    } catch {
      setSmsNotifications(!value); // Revert on error
    }
  };

  const handleLocationServicesToggle = async (value: boolean) => {
    setLocationServices(value);
    try {
      await updateUserSettings({
        privacy: { shareLocation: value },
      });
    } catch {
      setLocationServices(!value); // Revert on error
    }
  };

  const handleBiometricAuthToggle = async (value: boolean) => {
    setBiometricAuth(value);
    try {
      await updateUserSettings({
        preferences: { biometricAuth: value },
      });
    } catch {
      setBiometricAuth(!value); // Revert on error
    }
  };

  const handleDarkModeToggle = async (value: boolean) => {
    setDarkMode(value);
    try {
      await updateUserSettings({
        preferences: { darkMode: value },
      });
    } catch {
      setDarkMode(!value); // Revert on error
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <LoadingScreen visible={loading} />
      {!loading && (
        <>
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 pt-[60px] pb-4 bg-white border-b border-gray-100">
            <TouchableOpacity
              className="w-10 h-10 items-center justify-center"
              onPress={() => router.replace("/(tabs)/profile")}
            >
              <Ionicons name="arrow-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-800">
              Settings
            </Text>
            <View className="w-10 h-10" />
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
          >
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
                      onValueChange={handlePushNotificationsToggle}
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
                      onValueChange={handleEmailNotificationsToggle}
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
                      onValueChange={handleSmsNotificationsToggle}
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
                      onValueChange={handleLocationServicesToggle}
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
                      onValueChange={handleBiometricAuthToggle}
                      trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
                      thumbColor={biometricAuth ? "#4461F2" : "#F3F4F6"}
                    />
                  }
                />
              </View>
            </View>
            {/* Emergency */}
            <View className="px-6 mt-6">
              <Text className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">
                Emergency
              </Text>
              <View className="bg-white rounded-2xl py-2 shadow-sm">
                <SettingItem
                  icon="people-outline"
                  title="Emergency Contacts"
                  subtitle="Manage emergency contacts"
                  onPress={() => router.push("/profile/emergency-contacts")}
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
                  subtitle={language === "en" ? "English" : language}
                  onPress={() => console.log("Language")}
                />
                <View className="h-px bg-gray-100 ml-[68px]" />
                <SettingItem
                  icon="moon-outline"
                  title="Dark Mode"
                  subtitle="Toggle dark theme"
                  showArrow={false}
                  rightElement={
                    <Switch
                      value={darkMode}
                      onValueChange={handleDarkModeToggle}
                      trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
                      thumbColor={darkMode ? "#4461F2" : "#F3F4F6"}
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
          </ScrollView>
        </>
      )}
    </View>
  );
}
