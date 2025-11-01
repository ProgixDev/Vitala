import { Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text } from "react-native";
import { useEffect } from "react";
import { authStorage } from "../../utils/auth";

export default function TabLayout() {
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const isLoggedIn = await authStorage.isLoggedIn();
    if (!isLoggedIn) {
      router.replace("/signin");
    }
  };
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1A1A1A",
          borderTopWidth: 0,
          height: 90,
          paddingBottom: 20,
          paddingTop: 30,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarActiveTintColor: "#4461F2",
        tabBarInactiveTintColor: "#9E9E9E",
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => (
            <View className="w-[50px] h-[50px] justify-center items-center p-2.5 rounded-full border border-gray-500">
              <Ionicons name="home" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ color }) => (
            <View className="w-[50px] h-[50px] justify-center items-center p-2.5 rounded-full border border-gray-500">
              <Ionicons name="search" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="sos"
        options={{
          tabBarIcon: () => (
            <View className="w-20 h-20 rounded-full bg-[#FF3B30] justify-center items-center -mt-[70px] shadow-lg">
              <Text className="text-white text-base font-bold">SOS</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          tabBarIcon: ({ color }) => (
            <View className="w-[50px] h-[50px] justify-center items-center p-2.5 rounded-full border border-gray-500">
              <Ionicons name="calendar" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color }) => (
            <View className="w-[50px] h-[50px] justify-center items-center p-2.5 rounded-full border border-gray-500">
              <Ionicons name="person" size={24} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
