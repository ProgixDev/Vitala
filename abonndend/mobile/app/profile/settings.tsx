import LoadingScreen from "@/components/LoadingScreen";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getSettings, updateSettings } from "@/utils/api";
import { Card, Divider, Header, Screen, Text } from "@/components/ui";
import { useThemeColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { BackHandler, Switch, TouchableOpacity, View } from "react-native";
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
}) => {
  const colors = useThemeColors();
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between py-3 px-4"
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress && !rightElement}
    >
      <View className="flex-row items-center flex-1">
        <View className="w-10 h-10 rounded-md bg-primary-soft items-center justify-center mr-3">
          <Ionicons name={icon} size={22} color={colors.primary} />
        </View>
        <View className="flex-1">
          <Text variant="label" color="foreground">
            {title}
          </Text>
          {subtitle && (
            <Text variant="caption" color="muted" className="mt-0.5">
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightElement ||
        (showArrow && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.mutedForeground}
          />
        ))}
    </TouchableOpacity>
  );
};

export default function Settings() {
  const { currentUser } = useCurrentUser();
  const colors = useThemeColors();
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
        if (currentUser?.token) {
          const response = await getSettings(currentUser.token);
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
  }, [currentUser]);

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
      if (currentUser?.token) {
        await updateSettings(currentUser.token, updates);
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

  const switchProps = (on: boolean) => ({
    trackColor: { false: colors.border, true: colors.primarySoft },
    thumbColor: on ? colors.primary : colors.surface,
    ios_backgroundColor: colors.border,
  });

  return (
    <Screen scroll>
      <LoadingScreen visible={loading} />
      {!loading && (
        <>
          <Header
            title="Settings"
            onBack={() => router.replace("/(tabs)/profile")}
          />

          {/* Notifications */}
          <Text
            variant="caption"
            color="muted"
            weight="semibold"
            className="uppercase tracking-wider mt-4 mb-2"
          >
            Notifications
          </Text>
          <Card padded={false} className="py-1">
            <SettingItem
              icon="notifications-outline"
              title="Push Notifications"
              subtitle="Receive push notifications"
              showArrow={false}
              rightElement={
                <Switch
                  value={pushNotifications}
                  onValueChange={handlePushNotificationsToggle}
                  {...switchProps(pushNotifications)}
                />
              }
            />
            <Divider className="ml-16" />
            <SettingItem
              icon="mail-outline"
              title="Email Notifications"
              subtitle="Receive email updates"
              showArrow={false}
              rightElement={
                <Switch
                  value={emailNotifications}
                  onValueChange={handleEmailNotificationsToggle}
                  {...switchProps(emailNotifications)}
                />
              }
            />
            <Divider className="ml-16" />
            <SettingItem
              icon="chatbubble-outline"
              title="SMS Notifications"
              subtitle="Receive SMS alerts"
              showArrow={false}
              rightElement={
                <Switch
                  value={smsNotifications}
                  onValueChange={handleSmsNotificationsToggle}
                  {...switchProps(smsNotifications)}
                />
              }
            />
          </Card>

          {/* Privacy */}
          <Text
            variant="caption"
            color="muted"
            weight="semibold"
            className="uppercase tracking-wider mt-6 mb-2"
          >
            Privacy
          </Text>
          <Card padded={false} className="py-1">
            <SettingItem
              icon="location-outline"
              title="Location Services"
              subtitle="Allow app to access your location"
              showArrow={false}
              rightElement={
                <Switch
                  value={locationServices}
                  onValueChange={handleLocationServicesToggle}
                  {...switchProps(locationServices)}
                />
              }
            />
            <Divider className="ml-16" />
            <SettingItem
              icon="finger-print-outline"
              title="Biometric Authentication"
              subtitle="Use fingerprint or face ID"
              showArrow={false}
              rightElement={
                <Switch
                  value={biometricAuth}
                  onValueChange={handleBiometricAuthToggle}
                  {...switchProps(biometricAuth)}
                />
              }
            />
          </Card>

          {/* Emergency */}
          <Text
            variant="caption"
            color="muted"
            weight="semibold"
            className="uppercase tracking-wider mt-6 mb-2"
          >
            Emergency
          </Text>
          <Card padded={false} className="py-1">
            <SettingItem
              icon="people-outline"
              title="Emergency Contacts"
              subtitle="Manage emergency contacts"
              onPress={() => router.push("/profile/emergency-contacts")}
            />
          </Card>

          {/* App Settings */}
          <Text
            variant="caption"
            color="muted"
            weight="semibold"
            className="uppercase tracking-wider mt-6 mb-2"
          >
            App Settings
          </Text>
          <Card padded={false} className="py-1">
            <SettingItem
              icon="language-outline"
              title="Language"
              subtitle={language === "en" ? "English" : language}
              onPress={() => console.log("Language")}
            />
            <Divider className="ml-16" />
            <SettingItem
              icon="moon-outline"
              title="Dark Mode"
              subtitle="Toggle dark theme"
              showArrow={false}
              rightElement={
                <Switch
                  value={darkMode}
                  onValueChange={handleDarkModeToggle}
                  {...switchProps(darkMode)}
                />
              }
            />
            <Divider className="ml-16" />
            <SettingItem
              icon="download-outline"
              title="App Updates"
              subtitle="Check for updates"
              onPress={() => console.log("App Updates")}
            />
          </Card>

          {/* Support */}
          <Text
            variant="caption"
            color="muted"
            weight="semibold"
            className="uppercase tracking-wider mt-6 mb-2"
          >
            Support
          </Text>
          <Card padded={false} className="py-1">
            <SettingItem
              icon="help-circle-outline"
              title="Help Center"
              subtitle="Get help and support"
              onPress={() => console.log("Help Center")}
            />
            <Divider className="ml-16" />
            <SettingItem
              icon="document-text-outline"
              title="Terms & Conditions"
              subtitle="Read our terms"
              onPress={() => console.log("Terms & Conditions")}
            />
            <Divider className="ml-16" />
            <SettingItem
              icon="shield-outline"
              title="Privacy Policy"
              subtitle="Read our privacy policy"
              onPress={() => console.log("Privacy Policy")}
            />
          </Card>
        </>
      )}
    </Screen>
  );
}
