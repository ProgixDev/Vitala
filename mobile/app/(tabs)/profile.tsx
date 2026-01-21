import { useCurrentUser } from "@/hooks/useCurrentUser";
import { authStorage } from "@/utils/auth";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  BackHandler,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
    className={`flex-row items-center justify-between py-4 px-4 rounded-xl mb-2 ${
      isLogout ? "bg-[#FEF2F2] border border-[#FEE2E2]" : "bg-white"
    }`}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View className="flex-row items-center gap-4">
      <View
        className={`w-10 h-10 rounded-lg justify-center items-center ${
          isLogout ? "bg-[#FEE2E2]" : "bg-[#F9FAFB]"
        }`}
      >
        <Ionicons
          name={icon}
          size={24}
          color={isLogout ? "#FF3B30" : "#6B7280"}
        />
      </View>
      <Text
        className={`text-base font-medium ${
          isLogout ? "text-[#FF3B30] font-semibold" : "text-[#374151]"
        }`}
      >
        {title}
      </Text>
    </View>
    {!isLogout && <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />}
  </TouchableOpacity>
);

export default function Profile() {
  const { currentUser } = useCurrentUser();

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
    <View className="flex-1 pt-6 px-4">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="py-5">
          <View>
            <Text className="text-[28px] font-bold text-[#2D3142] mb-1">
              Profile
            </Text>
            <Text className="text-sm text-[#9E9E9E]">Manage your account</Text>
          </View>
        </View>

        {/* User Info Section */}
        {currentUser && (
          <View className="bg-white rounded-[20px] p-6 mb-[30px] items-center">
            <View className="mb-4">
              {currentUser.profilePicture ? (
                <Image
                  source={{ uri: currentUser.profilePicture }}
                  className="w-20 h-20 rounded-full border-3 border-[#E0E7FF]"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-20 h-20 rounded-full bg-[#EEF2FF] items-center justify-center border-3 border-[#E0E7FF]">
                  <Ionicons name="person" size={40} color="#4461F2" />
                </View>
              )}
            </View>
            <Text className="text-xl font-bold text-[#1F2937] mb-1">
              {currentUser.fullName}
            </Text>
            <Text className="text-sm text-[#6B7280] mb-2">
              {currentUser.email}
            </Text>

            {/* User Type Badge */}
            <View
              className={`px-4 py-2 rounded-full ${
                currentUser.userType === "nurse"
                  ? "bg-[#10B981]/10"
                  : "bg-[#4461F2]/10"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  currentUser.userType === "nurse"
                    ? "text-[#10B981]"
                    : "text-[#4461F2]"
                }`}
              >
                {currentUser.userType === "nurse" ? "👨‍⚕️ Nurse" : "👤 Patient"}
              </Text>
            </View>
          </View>
        )}

        {/* Menu Items */}
        <View className="mb-[30px]">
          <Text className="text-xl font-semibold text-[#2D3142] mb-5">
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
        <View className="mb-[30px]">
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
