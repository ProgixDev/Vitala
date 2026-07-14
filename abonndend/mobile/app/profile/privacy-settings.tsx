import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getSettings, updateSettings } from "@/utils/api";
import { Badge, Card, Chip, Divider, Header, Screen, Text } from "@/components/ui";
import { useThemeColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Linking, Switch, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

interface PrivacySettings {
  profileVisibility: "public" | "private";
  showMedicalInfo: boolean;
  allowLocationTracking: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
}

export default function PrivacySettingsPage() {
  const { currentUser } = useCurrentUser();
  const colors = useThemeColors();
  const [systemPermissions, setSystemPermissions] = useState({
    location: false,
    notifications: false,
  });
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: "private",
    showMedicalInfo: false,
    allowLocationTracking: true,
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
  });
  const checkSystemPermissions = useCallback(async () => {
    // Check location permission
    const locationStatus = await Location.getForegroundPermissionsAsync();

    // Check notification permission
    const notificationStatus = await Notifications.getPermissionsAsync();

    setSystemPermissions({
      location: locationStatus.granted,
      notifications: notificationStatus.granted,
    });
  }, []);

  const loadSettings = useCallback(async () => {
    if (!currentUser?.token) return;

    try {
      const response = await getSettings(currentUser.token);
      if (response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.log("Failed to load settings:", error);
    }
  }, [currentUser]);

  useEffect(() => {
    loadSettings();
    checkSystemPermissions();
  }, [checkSystemPermissions, loadSettings]);

  const updateSetting = async (key: keyof PrivacySettings, value: any) => {
    if (!currentUser?.token) return;

    // Handle permission-related settings specially
    if (key === "allowLocationTracking" && value) {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        return; // Don't update setting if permission denied
      }
    }

    if (key === "pushNotifications" && value) {
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

      if (status === "granted") {
        setSystemPermissions((prev) => ({ ...prev, location: true }));
        return true;
      } else {
        Alert.alert(
          "Location Permission Required",
          "Please enable location services in your device settings to use this feature.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => Linking.openSettings(),
            },
          ],
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

      if (status === "granted") {
        setSystemPermissions((prev) => ({ ...prev, notifications: true }));
        return true;
      } else {
        Alert.alert(
          "Notification Permission Required",
          "Please enable notifications in your device settings to receive updates.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => Linking.openSettings(),
            },
          ],
        );
        return false;
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  };

  const switchProps = (on: boolean) => ({
    trackColor: { false: colors.border, true: colors.primarySoft },
    thumbColor: on ? colors.primary : colors.surface,
    ios_backgroundColor: colors.border,
  });

  return (
    <Screen scroll>
      <Header title="Privacy Settings" />

      {/* Profile Privacy */}
      <Text variant="h3" color="foreground" className="mt-4 mb-3">
        Profile Privacy
      </Text>

      <Card padded={false}>
        {/* Profile Visibility */}
        <View className="p-4">
          <Text variant="label" color="foreground" className="mb-1">
            Profile Visibility
          </Text>
          <Text variant="caption" color="muted">
            Control who can see your profile information
          </Text>
          <View className="flex-row mt-3 gap-3">
            <Chip
              label="Public"
              selected={settings.profileVisibility === "public"}
              onPress={() => updateSetting("profileVisibility", "public")}
              className="flex-1 justify-center"
            />
            <Chip
              label="Private"
              selected={settings.profileVisibility === "private"}
              onPress={() => updateSetting("profileVisibility", "private")}
              className="flex-1 justify-center"
            />
          </View>
        </View>

        <Divider />

        {/* Show Medical Info */}
        <View className="p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <Text variant="label" color="foreground" className="mb-1">
                Show Medical Information
              </Text>
              <Text variant="caption" color="muted">
                Allow healthcare providers to view your medical profile
              </Text>
            </View>
            <Switch
              value={settings.showMedicalInfo}
              onValueChange={(value) => updateSetting("showMedicalInfo", value)}
              {...switchProps(settings.showMedicalInfo)}
            />
          </View>
        </View>

        <Divider />

        {/* Location Tracking */}
        <View className="p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <View className="flex-row items-center gap-2 mb-1">
                <Text variant="label" color="foreground">
                  Location Tracking
                </Text>
                {!systemPermissions.location &&
                  settings.allowLocationTracking && (
                    <Badge tone="warning" label="No System Permission" />
                  )}
              </View>
              <Text variant="caption" color="muted">
                Allow the app to track your location for better service
              </Text>
              {!systemPermissions.location &&
                settings.allowLocationTracking && (
                  <TouchableOpacity
                    onPress={() => Linking.openSettings()}
                    className="mt-2 flex-row items-center"
                  >
                    <Text variant="caption" color="primary" weight="semibold">
                      Tap to enable in device settings
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={13}
                      color={colors.primary}
                      style={{ marginLeft: 4 }}
                    />
                  </TouchableOpacity>
                )}
            </View>
            <Switch
              value={settings.allowLocationTracking}
              onValueChange={(value) =>
                updateSetting("allowLocationTracking", value)
              }
              {...switchProps(settings.allowLocationTracking)}
            />
          </View>
        </View>
      </Card>

      {/* Notification Preferences */}
      <Text variant="h3" color="foreground" className="mt-6 mb-3">
        Notification Preferences
      </Text>

      <Card padded={false}>
        {/* Email Notifications */}
        <View className="p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <Text variant="label" color="foreground" className="mb-1">
                Email Notifications
              </Text>
              <Text variant="caption" color="muted">
                Receive appointment reminders and updates via email
              </Text>
            </View>
            <Switch
              value={settings.emailNotifications}
              onValueChange={(value) =>
                updateSetting("emailNotifications", value)
              }
              {...switchProps(settings.emailNotifications)}
            />
          </View>
        </View>

        <Divider />

        {/* Push Notifications */}
        <View className="p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <View className="flex-row items-center gap-2 mb-1">
                <Text variant="label" color="foreground">
                  Push Notifications
                </Text>
                {!systemPermissions.notifications &&
                  settings.pushNotifications && (
                    <Badge tone="warning" label="No System Permission" />
                  )}
              </View>
              <Text variant="caption" color="muted">
                Receive push notifications for important updates
              </Text>
              {!systemPermissions.notifications &&
                settings.pushNotifications && (
                  <TouchableOpacity
                    onPress={() => Linking.openSettings()}
                    className="mt-2 flex-row items-center"
                  >
                    <Text variant="caption" color="primary" weight="semibold">
                      Tap to enable in device settings
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={13}
                      color={colors.primary}
                      style={{ marginLeft: 4 }}
                    />
                  </TouchableOpacity>
                )}
            </View>
            <Switch
              value={settings.pushNotifications}
              onValueChange={(value) =>
                updateSetting("pushNotifications", value)
              }
              {...switchProps(settings.pushNotifications)}
            />
          </View>
        </View>

        <Divider />

        {/* SMS Notifications */}
        <View className="p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <Text variant="label" color="foreground" className="mb-1">
                SMS Notifications
              </Text>
              <Text variant="caption" color="muted">
                Receive appointment reminders via SMS
              </Text>
            </View>
            <Switch
              value={settings.smsNotifications}
              onValueChange={(value) =>
                updateSetting("smsNotifications", value)
              }
              {...switchProps(settings.smsNotifications)}
            />
          </View>
        </View>
      </Card>

      {/* Data Privacy Info */}
      <Card
        elevation="none"
        className="mt-6 bg-primary-soft border-0 flex-row items-start"
      >
        <Ionicons
          name="shield-checkmark"
          size={20}
          color={colors.primary}
          style={{ marginTop: 2, marginRight: 12 }}
        />
        <View className="flex-1">
          <Text
            variant="label"
            color="primary"
            weight="semibold"
            className="mb-2"
          >
            Your Privacy Matters
          </Text>
          <Text variant="caption" color="primary" className="leading-5">
            • Your medical information is encrypted and secure{"\n"}• Location
            data is only used for service delivery{"\n"}• You can change these
            settings anytime{"\n"}• We never share your data without permission
          </Text>
        </View>
      </Card>
    </Screen>
  );
}
