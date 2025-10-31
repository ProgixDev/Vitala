import { Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet, Text } from "react-native";
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
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <Ionicons name="home" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <Ionicons name="search" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="sos"
        options={{
          tabBarIcon: () => (
            <View style={styles.sosButton}>
              <Text style={styles.sosButtonText}>SOS</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <Ionicons name="calendar" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <Ionicons name="person" size={24} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "gray",
  },
  activeIconContainer: {
    backgroundColor: "#4461F2",
    borderRadius: 25,
  },
  sosButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    marginTop: -70,
    shadowColor: "#FF3B30",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sosButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
