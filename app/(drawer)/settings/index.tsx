import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { DrawerToggleButton } from "../../../src/navigation/components/DrawerToggleButton";

export default function SettingsPage() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <DrawerToggleButton />
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerRight} />
      </View>
      <View style={styles.content}>
        <Text style={styles.pageText}>Settings Page</Text>
      </View>
    </SafeAreaView>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
  },
  headerRight: {
    width: 44,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pageText: {
    fontSize: 24,
    color: "#666666",
  },
});
