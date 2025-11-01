import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { authStorage } from "../../utils/auth";
import { useCurrentUser } from "../../hooks/useCurrentUser";

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
  isLogout?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  title,
  onPress,
  isLogout = false,
}) => (
  <TouchableOpacity
    style={[styles.menuItem, isLogout && styles.logoutMenuItem]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.menuItemLeft}>
      <View
        style={[styles.iconContainer, isLogout && styles.logoutIconContainer]}
      >
        <Ionicons
          name={icon}
          size={24}
          color={isLogout ? "#FF3B30" : "#6B7280"}
        />
      </View>
      <Text style={[styles.menuItemText, isLogout && styles.logoutText]}>
        {title}
      </Text>
    </View>
    {!isLogout && <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />}
  </TouchableOpacity>
);

export default function Profile() {
  const { currentUser } = useCurrentUser();

  const handleLogout = async () => {
    try {
      await authStorage.setLoggedOut();
      router.replace("/signin");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const menuItems = [
    {
      icon: "person-outline" as keyof typeof Ionicons.glyphMap,
      title: "My Profile",
      onPress: () => {
        router.push("/profile/my-profile");
      },
    },
    {
      icon: "settings-outline" as keyof typeof Ionicons.glyphMap,
      title: "Settings",
      onPress: () => {
        router.push("/profile/settings");
      },
    },
    {
      icon: "notifications-outline" as keyof typeof Ionicons.glyphMap,
      title: "Notifications",
      onPress: () => {
        router.push("/profile/notifications");
      },
    },
    {
      icon: "document-text-outline" as keyof typeof Ionicons.glyphMap,
      title: "Transaction History",
      onPress: () => {
        router.push("/profile/transaction-history");
      },
    },
    {
      icon: "help-circle-outline" as keyof typeof Ionicons.glyphMap,
      title: "FAQ",
      onPress: () => {
        router.push("/profile/faq");
      },
    },
    {
      icon: "information-circle-outline" as keyof typeof Ionicons.glyphMap,
      title: "About App",
      onPress: () => {
        router.push("/profile/about");
      },
    },
  ];

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
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Section */}
        {currentUser && (
          <View style={styles.userSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={40} color="#4461F2" />
              </View>
            </View>
            <Text style={styles.userName}>{currentUser.fullName}</Text>
            <Text style={styles.userEmail}>{currentUser.email}</Text>
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <MenuItem
              key={index}
              icon={item.icon}
              title={item.title}
              onPress={item.onPress}
            />
          ))}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <MenuItem
            icon="log-out-outline"
            title="Logout"
            onPress={handleLogout}
            isLogout
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
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
  userSection: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#E0E7FF",
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#6B7280",
  },
  menuContainer: {
    paddingHorizontal: 24,
    gap: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  logoutContainer: {
    paddingHorizontal: 24,
    marginTop: 16,
  },
  logoutMenuItem: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  logoutIconContainer: {
    backgroundColor: "#FEE2E2",
  },
  logoutText: {
    color: "#FF3B30",
    fontWeight: "600",
  },
});
