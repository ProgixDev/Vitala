import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  BackHandler,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Notification {
  id: string;
  type: "appointment" | "reminder" | "system" | "emergency";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "appointment",
    title: "Appointment Confirmed",
    message: "Your appointment has been confirmed for tomorrow at 10:00 AM",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "2",
    type: "reminder",
    title: "Upcoming Appointment",
    message: "Reminder: You have an appointment in 24 hours",
    time: "5 hours ago",
    read: false,
  },
  {
    id: "3",
    type: "system",
    title: "Profile Updated",
    message: "Your profile information has been successfully updated",
    time: "1 day ago",
    read: true,
  },
  {
    id: "4",
    type: "emergency",
    title: "Emergency Alert",
    message: "Emergency services have been notified",
    time: "2 days ago",
    read: true,
  },
  {
    id: "5",
    type: "appointment",
    title: "Appointment Cancelled",
    message: "Your appointment scheduled for Dec 20 has been cancelled",
    time: "3 days ago",
    read: true,
  },
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "appointment":
      return "calendar-outline";
    case "reminder":
      return "time-outline";
    case "system":
      return "information-circle-outline";
    case "emergency":
      return "alert-circle-outline";
    default:
      return "notifications-outline";
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case "appointment":
      return "#4461F2";
    case "reminder":
      return "#F59E0B";
    case "system":
      return "#10B981";
    case "emergency":
      return "#EF4444";
    default:
      return "#6B7280";
  }
};

interface NotificationItemProps {
  notification: Notification;
  onPress: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
}) => {
  const iconName = getNotificationIcon(notification.type);
  const iconColor = getNotificationColor(notification.type);

  return (
    <TouchableOpacity
      className={`flex-row bg-white rounded-xl p-4 mb-3 shadow-sm ${
        !notification.read ? "bg-[#F0F9FF] border-l-3 border-l-[#4461F2]" : ""
      }`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        className="w-12 h-12 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: `${iconColor}15` }}
      >
        <Ionicons
          name={iconName as keyof typeof Ionicons.glyphMap}
          size={24}
          color={iconColor}
        />
      </View>
      <View className="flex-1">
        <View className="flex-row items-center mb-1">
          <Text className="text-[15px] font-semibold text-[#1F2937] flex-1">
            {notification.title}
          </Text>
          {!notification.read && (
            <View className="w-2 h-2 rounded-full bg-[#4461F2] ml-2" />
          )}
        </View>
        <Text
          className="text-sm text-[#6B7280] leading-5 mb-1.5"
          numberOfLines={2}
        >
          {notification.message}
        </Text>
        <Text className="text-xs text-[#9CA3AF]">{notification.time}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  // Handle back button - go back to profile page
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        router.replace("/(tabs)/profile");
        return true;
      },
    );

    return () => backHandler.remove();
  }, []);

  const filteredNotifications = notifications.filter((notif) =>
    filter === "all" ? true : !notif.read,
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationPress = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)),
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-[60px] pb-4 bg-white border-b border-[#F3F4F6]">
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center"
          onPress={() => router.replace("/(tabs)/profile")}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-[#1F2937]">
          Notifications
        </Text>
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center"
          onPress={() => console.log("More options")}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* Filter and Actions */}
      <View className="bg-white px-6 py-4 border-b border-[#F3F4F6]">
        <View className="flex-row gap-3 mb-3">
          <TouchableOpacity
            className={`px-4 py-2 rounded-full ${
              filter === "all" ? "bg-[#4461F2]" : "bg-[#F3F4F6]"
            }`}
            onPress={() => setFilter("all")}
          >
            <Text
              className={`text-sm font-medium ${
                filter === "all" ? "text-white" : "text-[#6B7280]"
              }`}
            >
              All ({notifications.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 rounded-full ${
              filter === "unread" ? "bg-[#4461F2]" : "bg-[#F3F4F6]"
            }`}
            onPress={() => setFilter("unread")}
          >
            <Text
              className={`text-sm font-medium ${
                filter === "unread" ? "text-white" : "text-[#6B7280]"
              }`}
            >
              Unread ({unreadCount})
            </Text>
          </TouchableOpacity>
        </View>

        {notifications.length > 0 && (
          <View className="flex-row gap-4">
            {unreadCount > 0 && (
              <TouchableOpacity className="py-1" onPress={handleMarkAllAsRead}>
                <Text className="text-[13px] font-medium text-[#4461F2]">
                  Mark all as read
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity className="py-1" onPress={handleClearAll}>
              <Text className="text-[13px] font-medium text-[#EF4444]">
                Clear all
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <View className="flex-1 items-center justify-center px-12">
          <Ionicons
            name="notifications-off-outline"
            size={64}
            color="#D1D5DB"
          />
          <Text className="text-xl font-semibold text-[#1F2937] mt-4 mb-2">
            No Notifications
          </Text>
          <Text className="text-sm text-[#6B7280] text-center leading-5">
            {filter === "unread"
              ? "You have no unread notifications"
              : "You're all caught up!"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationItem
              notification={item}
              onPress={() => handleNotificationPress(item.id)}
            />
          )}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
