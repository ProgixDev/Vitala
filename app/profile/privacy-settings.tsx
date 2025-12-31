import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getSettings, updateSettings } from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ScrollView,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Toast from "react-native-toast-message";

interface PrivacySettings {
  profileVisibility: 'public' | 'private';
  showMedicalInfo: boolean;
  allowLocationTracking: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
}

export default function PrivacySettings() {
  const { currentUser } = useCurrentUser();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: 'private',
    showMedicalInfo: false,
    allowLocationTracking: true,
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    if (!currentUser?.token) return;

    try {
      const response = await getSettings(currentUser.token);
      if (response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.log('Failed to load settings:', error);
    }
  };

  const updateSetting = async (key: keyof PrivacySettings, value: any) => {
    if (!currentUser?.token) return;

    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    try {
      await updateSettings(currentUser.token, newSettings);
      Toast.show({
        type: "success",
        text1: "Settings Updated",
        text2: "Your privacy settings have been saved",
      });
    } catch (error: any) {
      // Revert on error
      setSettings(settings);
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: error.message || "Failed to update settings",
      });
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
          Privacy Settings
        </Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Privacy */}
        <View className="px-6 mt-6">
          <Text className="text-base font-semibold text-[#1F2937] mb-3">
            Profile Privacy
          </Text>

          <View className="bg-white rounded-2xl shadow-sm">
            {/* Profile Visibility */}
            <View className="p-5 border-b border-[#F3F4F6]">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base font-medium text-[#1F2937] mb-1">
                    Profile Visibility
                  </Text>
                  <Text className="text-sm text-[#6B7280]">
                    Control who can see your profile information
                  </Text>
                </View>
              </View>
              <View className="flex-row mt-3 gap-3">
                <TouchableOpacity
                  className={`flex-1 py-3 px-4 rounded-lg border ${
                    settings.profileVisibility === 'public'
                      ? "border-[#4461F2] bg-[#EEF2FF]"
                      : "border-[#D1D5DB] bg-white"
                  }`}
                  onPress={() => updateSetting('profileVisibility', 'public')}
                >
                  <Text
                    className={`text-center text-sm font-medium ${
                      settings.profileVisibility === 'public'
                        ? "text-[#4461F2]"
                        : "text-[#6B7280]"
                    }`}
                  >
                    Public
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-3 px-4 rounded-lg border ${
                    settings.profileVisibility === 'private'
                      ? "border-[#4461F2] bg-[#EEF2FF]"
                      : "border-[#D1D5DB] bg-white"
                  }`}
                  onPress={() => updateSetting('profileVisibility', 'private')}
                >
                  <Text
                    className={`text-center text-sm font-medium ${
                      settings.profileVisibility === 'private'
                        ? "text-[#4461F2]"
                        : "text-[#6B7280]"
                    }`}
                  >
                    Private
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Show Medical Info */}
            <View className="p-5 border-b border-[#F3F4F6]">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base font-medium text-[#1F2937] mb-1">
                    Show Medical Information
                  </Text>
                  <Text className="text-sm text-[#6B7280]">
                    Allow healthcare providers to view your medical profile
                  </Text>
                </View>
                <Switch
                  value={settings.showMedicalInfo}
                  onValueChange={(value) => updateSetting('showMedicalInfo', value)}
                  trackColor={{ false: '#D1D5DB', true: '#BFDBFE' }}
                  thumbColor={settings.showMedicalInfo ? '#4461F2' : '#F9FAFB'}
                />
              </View>
            </View>

            {/* Location Tracking */}
            <View className="p-5">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base font-medium text-[#1F2937] mb-1">
                    Location Tracking
                  </Text>
                  <Text className="text-sm text-[#6B7280]">
                    Allow the app to track your location for better service
                  </Text>
                </View>
                <Switch
                  value={settings.allowLocationTracking}
                  onValueChange={(value) => updateSetting('allowLocationTracking', value)}
                  trackColor={{ false: '#D1D5DB', true: '#BFDBFE' }}
                  thumbColor={settings.allowLocationTracking ? '#4461F2' : '#F9FAFB'}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Notification Preferences */}
        <View className="px-6 mt-6">
          <Text className="text-base font-semibold text-[#1F2937] mb-3">
            Notification Preferences
          </Text>

          <View className="bg-white rounded-2xl shadow-sm">
            {/* Email Notifications */}
            <View className="p-5 border-b border-[#F3F4F6]">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base font-medium text-[#1F2937] mb-1">
                    Email Notifications
                  </Text>
                  <Text className="text-sm text-[#6B7280]">
                    Receive appointment reminders and updates via email
                  </Text>
                </View>
                <Switch
                  value={settings.emailNotifications}
                  onValueChange={(value) => updateSetting('emailNotifications', value)}
                  trackColor={{ false: '#D1D5DB', true: '#BFDBFE' }}
                  thumbColor={settings.emailNotifications ? '#4461F2' : '#F9FAFB'}
                />
              </View>
            </View>

            {/* Push Notifications */}
            <View className="p-5 border-b border-[#F3F4F6]">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base font-medium text-[#1F2937] mb-1">
                    Push Notifications
                  </Text>
                  <Text className="text-sm text-[#6B7280]">
                    Receive push notifications for important updates
                  </Text>
                </View>
                <Switch
                  value={settings.pushNotifications}
                  onValueChange={(value) => updateSetting('pushNotifications', value)}
                  trackColor={{ false: '#D1D5DB', true: '#BFDBFE' }}
                  thumbColor={settings.pushNotifications ? '#4461F2' : '#F9FAFB'}
                />
              </View>
            </View>

            {/* SMS Notifications */}
            <View className="p-5">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base font-medium text-[#1F2937] mb-1">
                    SMS Notifications
                  </Text>
                  <Text className="text-sm text-[#6B7280]">
                    Receive appointment reminders via SMS
                  </Text>
                </View>
                <Switch
                  value={settings.smsNotifications}
                  onValueChange={(value) => updateSetting('smsNotifications', value)}
                  trackColor={{ false: '#D1D5DB', true: '#BFDBFE' }}
                  thumbColor={settings.smsNotifications ? '#4461F2' : '#F9FAFB'}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Data Privacy Info */}
        <View className="px-6 mt-6">
          <View className="bg-blue-50 rounded-xl p-4">
            <View className="flex-row items-start">
              <Ionicons
                name="shield-checkmark"
                size={20}
                color="#1E40AF"
                className="mt-0.5 mr-3"
              />
              <View className="flex-1">
                <Text className="text-sm font-medium text-[#1E40AF] mb-2">
                  Your Privacy Matters
                </Text>
                <Text className="text-sm text-[#3B82F6] leading-5">
                  • Your medical information is encrypted and secure{"\n"}
                  • Location data is only used for service delivery{"\n"}
                  • You can change these settings anytime{"\n"}
                  • We never share your data without permission
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}