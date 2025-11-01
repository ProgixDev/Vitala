import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { authStorage } from "../../utils/auth";
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
    style={styles.settingItem}
    onPress={onPress}
    activeOpacity={0.7}
    disabled={!onPress && !rightElement}
  >
    <View style={styles.settingLeft}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={22} color="#4461F2" />
      </View>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
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

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await authStorage.setLoggedOut();
            router.replace("/signin");
          } catch (error) {
            console.error("Error logging out:", error);
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };

  const handleResetOnboarding = async () => {
    Alert.alert(
      "Reset Onboarding",
      "This will reset the onboarding status. You'll see the onboarding flow again next time you open the app. Continue?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await resetOnboardingStatus();
              Alert.alert("Success", "Onboarding status has been reset!");
            } catch (error) {
              console.error("Error resetting onboarding:", error);
              Alert.alert(
                "Error",
                "Failed to reset onboarding. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.settingsCard}>
            <SettingItem
              icon="person-outline"
              title="Edit Profile"
              subtitle="Update your personal information"
              onPress={() => router.push("/profile/my-profile")}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="key-outline"
              title="Change Password"
              subtitle="Update your password"
              onPress={() => console.log("Change Password")}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="shield-checkmark-outline"
              title="Privacy & Security"
              subtitle="Control your privacy settings"
              onPress={() => console.log("Privacy & Security")}
            />
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingsCard}>
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
            <View style={styles.divider} />
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
            <View style={styles.divider} />
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <View style={styles.settingsCard}>
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
            <View style={styles.divider} />
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <View style={styles.settingsCard}>
            <SettingItem
              icon="language-outline"
              title="Language"
              subtitle="English"
              onPress={() => console.log("Language")}
            />
            <View style={styles.divider} />
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
            <View style={styles.divider} />
            <SettingItem
              icon="download-outline"
              title="App Updates"
              subtitle="Check for updates"
              onPress={() => console.log("App Updates")}
            />
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.settingsCard}>
            <SettingItem
              icon="help-circle-outline"
              title="Help Center"
              subtitle="Get help and support"
              onPress={() => console.log("Help Center")}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="document-text-outline"
              title="Terms & Conditions"
              subtitle="Read our terms"
              onPress={() => console.log("Terms & Conditions")}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="shield-outline"
              title="Privacy Policy"
              subtitle="Read our privacy policy"
              onPress={() => console.log("Privacy Policy")}
            />
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          <View style={styles.settingsCard}>
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleResetOnboarding}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="refresh-outline" size={22} color="#DC2626" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.dangerButtonText}>Reset Onboarding</Text>
                  <Text style={styles.settingSubtitle}>
                    Show onboarding flow again
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="log-out-outline" size={22} color="#DC2626" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.dangerButtonText}>Logout</Text>
                  <Text style={styles.settingSubtitle}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  settingsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F0F2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1F2937",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginLeft: 68,
  },
  appInfoSection: {
    alignItems: "center",
    paddingVertical: 32,
  },
  appVersion: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  versionNumber: {
    fontSize: 14,
    color: "#6B7280",
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dangerButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#DC2626",
    marginBottom: 2,
  },
});
