import { Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useThemeColors, fonts } from "@/constants/theme";
import { SosTabButton } from "@/components/ui/SosTabButton";
import { t } from "@/utils/i18n";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { isLoggedIn } = useCurrentUser();

  const checkAuth = useCallback(async () => {
    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
      router.replace("/signin");
    }
  }, [isLoggedIn]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const icon =
    (name: keyof typeof Ionicons.glyphMap, active: keyof typeof Ionicons.glyphMap) =>
    ({ focused, color }: { focused: boolean; color: string }) => (
      <Ionicons name={focused ? active : name} size={24} color={color} />
    );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarLabelStyle: {
          fontFamily: fonts.medium,
          fontSize: 11,
          marginTop: 2,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 62 + insets.bottom,
          paddingBottom: insets.bottom + 6,
          paddingTop: 8,
          shadowColor: "#0F2A33",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tab.home"),
          tabBarIcon: icon("home-outline", "home"),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: t("tab.schedule"),
          tabBarIcon: icon("calendar-outline", "calendar"),
        }}
      />
      <Tabs.Screen
        name="sos"
        options={{
          title: "",
          tabBarIcon: () => <SosTabButton />,
        }}
      />
      <Tabs.Screen
        name="payment"
        options={{
          title: t("tab.payment"),
          tabBarIcon: icon("card-outline", "card"),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tab.profile"),
          tabBarIcon: icon("person-outline", "person"),
        }}
      />
    </Tabs>
  );
}
