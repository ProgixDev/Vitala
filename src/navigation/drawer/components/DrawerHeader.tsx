import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface DrawerHeaderProps {
  userName?: string;
  userID?: string;
  userAvatar?: string;
  onClose?: () => void;
}

export const DrawerHeader: React.FC<DrawerHeaderProps> = ({
  userName = "User Name",
  userID = "UID000 000 000",
  userAvatar,
  onClose,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          {userAvatar ? (
            <Image source={{ uri: userAvatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={32} color="#FFFFFF" />
            </View>
          )}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userID}>{userID}</Text>
        </View>
      </View>
      {onClose && (
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: "#2D59F0",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  userID: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
  },
  closeButton: {
    padding: 8,
    marginLeft: 8,
  },
});
