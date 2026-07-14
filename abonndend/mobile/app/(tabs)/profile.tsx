import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Badge, Card, Header, Text } from "@/components/ui";
import { useThemeColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { BackHandler, Image, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
}) => {
  const colors = useThemeColors();
  return (
    <Card
      onPress={onPress}
      padded={false}
      elevation="e1"
      className={`flex-row items-center justify-between py-4 px-4 mb-2 ${
        isLogout ? "bg-emergency-soft border-emergency" : ""
      }`}
    >
      <View className="flex-row items-center gap-4">
        <View
          className={`w-10 h-10 rounded-lg justify-center items-center ${
            isLogout ? "bg-emergency-soft" : "bg-surface-alt"
          }`}
        >
          <Ionicons
            name={icon}
            size={22}
            color={isLogout ? colors.emergency : colors.mutedForeground}
          />
        </View>
        <Text
          variant="body"
          weight={isLogout ? "semibold" : "medium"}
          color={isLogout ? "emergency" : "foreground"}
        >
          {title}
        </Text>
      </View>
      {!isLogout && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.mutedForeground}
        />
      )}
    </Card>
  );
};

export default function Profile() {
  const { currentUser, logout } = useCurrentUser();
  const colors = useThemeColors();

  // Handle back button - go to home tab instead of back
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        router.replace("/(tabs)");
        return true;
      },
    );

    return () => backHandler.remove();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
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
    <SafeAreaView className="flex-1 bg-background px-6" edges={["top"]}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Header */}
        <Header
          title="Profile"
          subtitle="Manage your account"
          showBack={false}
          large
        />

        {/* User Info Section */}
        {currentUser && (
          <Card elevation="e1" className="items-center p-6 mb-7">
            <View className="mb-4">
              {currentUser.profilePicture ? (
                <Image
                  source={{ uri: currentUser.profilePicture }}
                  className="w-20 h-20 rounded-full"
                  resizeMode="cover"
                  style={{ borderWidth: 3, borderColor: colors.primarySoft }}
                />
              ) : (
                <View
                  className="w-20 h-20 rounded-full bg-primary-soft items-center justify-center"
                  style={{ borderWidth: 3, borderColor: colors.primarySoft }}
                >
                  <Ionicons name="person" size={40} color={colors.primary} />
                </View>
              )}
            </View>
            <Text variant="h2" color="foreground" className="mb-1">
              {currentUser.fullName}
            </Text>
            <Text variant="body" color="muted" className="mb-3">
              {currentUser.email}
            </Text>

            {/* User Type Badge */}
            <Badge
              tone={currentUser.userType === "nurse" ? "success" : "primary"}
              icon={
                currentUser.userType === "nurse" ? "medkit" : "person"
              }
              label={currentUser.userType === "nurse" ? "Nurse" : "Patient"}
            />
          </Card>
        )}

        {/* Menu Items */}
        <View className="mb-7">
          <Text variant="h3" color="foreground" className="mb-5">
            Account Settings
          </Text>
          <View className="gap-2">
            {menuItems.map((item, index) => (
              <MenuItem
                key={index}
                icon={item.icon}
                title={item.title}
                onPress={item.onPress}
              />
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <View className="mb-7">
          <MenuItem
            icon="log-out-outline"
            title="Logout"
            onPress={handleLogout}
            isLogout
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
