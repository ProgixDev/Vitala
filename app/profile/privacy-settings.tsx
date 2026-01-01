import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getSettings, updateSettings } from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Linking,
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
  const [systemPermissions, setSystemPermissions] = useState({
    location: false,
    notifications: false,
  });
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
    checkSystemPermissions();
  }, []);

  const checkSystemPermissions = async () => {
    // Check location permission
    const locationStatus = await Location.getForegroundPermissionsAsync();
    
    // Check notification permission
    const notificationStatus = await Notifications.getPermissionsAsync();
    
    setSystemPermissions({
      location: locationStatus.granted,
      notifications: notificationStatus.granted,
    });
  };

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

    // Handle permission-related settings specially
    if (key === 'allowLocationTracking' && value) {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        return; // Don't update setting if permission denied
      }
    }

    if (key === 'pushNotifications' && value) {
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) {
        return; // Don't update setting if permission denied
      }
    }

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

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        setSystemPermissions(prev => ({ ...prev, location: true }));
        return true;
      } else {
        Alert.alert(
          "Location Permission Required",
          "Please enable location services in your device settings to use this feature.",
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Open Settings", 
              onPress: () => Linking.openSettings() 
            }
          ]
        );
        return false;
      }
    } catch (error) {
      console.error("Error requesting location permission:", error);
      return false;
    }
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      
      if (status === 'granted') {
        setSystemPermissions(prev => ({ ...prev, notifications: true }));
        return true;
      } else {
        Alert.alert(
          "Notification Permission Required",
          "Please enable notifications in your device settings to receive updates.",
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Open Settings", 
              onPress: () => Linking.openSettings() 
            }
          ]
        );
        return false;
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
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
                  <View className="flex-row items-center gap-2 mb-1">
                    <Text className="text-base font-medium text-[#1F2937]">
                      Location Tracking
                    </Text>
                    {!systemPermissions.location && settings.allowLocationTracking && (
                      <View className="bg-orange-100 px-2 py-0.5 rounded-full">
                        <Text className="text-xs text-orange-600 font-medium">
                          No System Permission
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-sm text-[#6B7280]">
                    Allow the app to track your location for better service
                  </Text>
                  {!systemPermissions.location && settings.allowLocationTracking && (
                    <TouchableOpacity 
                      onPress={() => Linking.openSettings()}
                      className="mt-2"
                    >
                      <Text className="text-sm text-[#4461F2] font-medium">
                        Tap to enable in device settings →
                      </Text>
                    </TouchableOpacity>
                  )}
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
                  <View className="flex-row items-center gap-2 mb-1">
                    <Text className="text-base font-medium text-[#1F2937]">
                      Push Notifications
                    </Text>
                    {!systemPermissions.notifications && settings.pushNotifications && (
                      <View className="bg-orange-100 px-2 py-0.5 rounded-full">
                        <Text className="text-xs text-orange-600 font-medium">
                          No System Permission
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-sm text-[#6B7280]">
                    Receive push notifications for important updates
                  </Text>
                  {!systemPermissions.notifications && settings.pushNotifications && (
                    <TouchableOpacity 
                      onPress={() => Linking.openSettings()}
                      className="mt-2"
                    >
                      <Text className="text-sm text-[#4461F2] font-medium">
                        Tap to enable in device settings →
                      </Text>
                    </TouchableOpacity>
                  )}
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