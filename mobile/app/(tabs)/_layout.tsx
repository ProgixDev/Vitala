import { Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text } from "react-native";
import { useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { auth } from "@/hooks/useCurrentUser";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const isLoggedIn = await auth.isLoggedIn();
    if (!isLoggedIn) {
      router.replace("/signin");
    }
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1F1F1F",
          borderTopWidth: 0,
          height: insets.bottom,
          paddingBottom: 45 + insets.bottom,
          paddingTop: 20,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#FFFFFF",
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              className={`w-12 h-12 justify-center items-center rounded-full ${
                focused
                  ? "bg-[#4461F2]"
                  : "bg-transparent border-2 border-gray-600"
              }`}
            >
              <Ionicons name="home-outline" size={22} color="#FFFFFF" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              className={`w-12 h-12 justify-center items-center rounded-full ${
                focused
                  ? "bg-[#4461F2]"
                  : "bg-transparent border-2 border-gray-600"
              }`}
            >
              <Ionicons name="calendar-outline" size={22} color="#FFFFFF" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="sos"
        options={{
          tabBarIcon: () => (
            <View className="w-17 h-17 justify-center items-center -mt-10">
              {/* Outer glow layers */}
              <View className="absolute w-17 h-17 rounded-full bg-[#FF3B30] opacity-15" />
              <View className="absolute w-15 h-15 rounded-full bg-[#FF3B30] opacity-30" />

              {/* Main SOS button */}
              <View className="w-12 h-12 rounded-full bg-[#FF3B30] justify-center items-center shadow-2xl">
                <Text className="text-white text-base font-bold tracking-wider">
                  SOS
                </Text>
              </View>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="payment"
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              className={`w-12 h-12 justify-center items-center rounded-full ${
                focused
                  ? "bg-[#4461F2]"
                  : "bg-transparent border-2 border-gray-600"
              }`}
            >
              <Ionicons name="card-outline" size={22} color="#FFFFFF" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              className={`w-12 h-12 justify-center items-center rounded-full ${
                focused
                  ? "bg-[#4461F2]"
                  : "bg-transparent border-2 border-gray-600"
              }`}
            >
              <Ionicons name="person-outline" size={22} color="#FFFFFF" />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
