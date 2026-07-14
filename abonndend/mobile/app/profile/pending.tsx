import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button, Screen, Text } from "@/components/ui";
import { useThemeColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { BackHandler, View } from "react-native";

/**
 * Screen shown when a nurse logs in with status "pending" (unapproved).
 * Explains that their account is under review and offers logout.
 */
export default function PendingVerification() {
  const { currentUser, logout } = useCurrentUser();
  const colors = useThemeColors();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
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

  return (
    <Screen>
      <View className="flex-1 justify-center items-center">
        <View className="w-20 h-20 rounded-full bg-warning-soft justify-center items-center mb-6">
          <Ionicons name="time-outline" size={44} color={colors.warning} />
        </View>
        <Text variant="h2" color="foreground" className="text-center mb-2">
          Account Pending Verification
        </Text>
        <Text variant="body" color="muted" className="text-center mb-8 px-2">
          Thank you for registering as a nurse. Your account is under review. We
          will notify you once it has been approved. If you have questions,
          please contact support.
        </Text>
        <Button
          label="Sign out"
          onPress={handleLogout}
          variant="danger"
          size="lg"
          leftIcon="log-out-outline"
        />
      </View>
    </Screen>
  );
}
