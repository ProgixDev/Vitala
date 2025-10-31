import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function SOS() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>SOS Page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  text: {
    fontSize: 24,
    fontWeight: "600",
    color: "#2D3142",
  },
});
