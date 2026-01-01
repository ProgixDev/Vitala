import LoadingScreen from "@/components/LoadingScreen";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  clearAllNotifications,
  deleteNotification,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  BackHandler,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

interface Notification {
  _id: string;
  type:
    | "appointment"
    | "payment"
    | "message"
    | "emergency"
    | "system"
    | "promotion"
    | "verification";
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  priority: "low" | "medium" | "high" | "urgent";
  relatedAppointment?: string;
  relatedPayment?: string;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "appointment":
      return "calendar-outline";
    case "payment":
      return "card-outline";
    case "message":
      return "chatbubble-outline";
    case "system":
      return "information-circle-outline";
    case "emergency":
      return "alert-circle-outline";
    case "promotion":
      return "gift-outline";
    case "verification":
      return "checkmark-circle-outline";
    default:
      return "notifications-outline";
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case "appointment":
      return "#4461F2";
    case "payment":
      return "#10B981";
    case "message":
      return "#6366F1";
    case "system":
      return "#6B7280";
    case "emergency":
      return "#EF4444";
    case "promotion":
      return "#F59E0B";
    case "verification":
      return "#10B981";
    default:
      return "#6B7280";
  }
};

// Format relative time
const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
};

interface NotificationItemProps {
  notification: Notification;
  onPress: () => void;
  onDelete: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
  onDelete,
}) => {
  const iconName = getNotificationIcon(notification.type);
  const iconColor = getNotificationColor(notification.type);

  return (
    <TouchableOpacity
      className={`flex-row bg-white rounded-xl p-4 mb-3 shadow-sm ${
        !notification.isRead ? "bg-[#F0F9FF] border-l-3 border-l-[#4461F2]" : ""
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
          {!notification.isRead && (
            <View className="w-2 h-2 rounded-full bg-[#4461F2] ml-2" />
          )}
        </View>
        <Text
          className="text-sm text-[#6B7280] leading-5 mb-1.5"
          numberOfLines={2}
        >
          {notification.message}
        </Text>
        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-[#9CA3AF]">
            {formatRelativeTime(notification.createdAt)}
          </Text>
          {notification.priority === "urgent" && (
            <View className="bg-red-100 px-2 py-0.5 rounded">
              <Text className="text-xs text-red-600 font-medium">Urgent</Text>
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity
        className="w-8 h-8 items-center justify-center"
        onPress={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Ionicons name="close" size={18} color="#9CA3AF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default function Notifications() {
  const { currentUser } = useCurrentUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  // Fetch notifications from API
  const fetchNotifications = useCallback(
    async (showLoader = true) => {
      if (!currentUser?.token) return;

      if (showLoader) setLoading(true);

      try {
        const response = await getNotifications(currentUser.token);
        if (response.success) {
          setNotifications(response.data);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to load notifications",
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentUser?.token]
  );

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Handle back button - go back to profile page
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        router.replace("/(tabs)/profile");
        return true;
      }
    );

    return () => backHandler.remove();
  }, []);

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications(false);
  }, [fetchNotifications]);

  const filteredNotifications = notifications.filter((notif) =>
    filter === "all" ? true : !notif.isRead
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationPress = async (id: string) => {
    if (!currentUser?.token) return;

    // Optimistic update
    setNotifications((prev) =>
      prev.map((notif) =>
        notif._id === id ? { ...notif, isRead: true } : notif
      )
    );

    try {
      await markNotificationAsRead(currentUser.token, id);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      // Revert on error
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === id ? { ...notif, isRead: false } : notif
        )
      );
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (!currentUser?.token) return;

    // Optimistic update
    const prevNotifications = [...notifications];
    setNotifications((prev) => prev.filter((notif) => notif._id !== id));

    try {
      await deleteNotification(currentUser.token, id);
      Toast.show({
        type: "success",
        text1: "Deleted",
        text2: "Notification removed",
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
      // Revert on error
      setNotifications(prevNotifications);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to delete notification",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUser?.token) return;

    // Optimistic update
    const prevNotifications = [...notifications];
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, isRead: true }))
    );

    try {
      await markAllNotificationsAsRead(currentUser.token);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "All notifications marked as read",
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      // Revert on error
      setNotifications(prevNotifications);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to mark notifications as read",
      });
    }
  };

  const handleClearAll = async () => {
    if (!currentUser?.token) return;

    // Optimistic update
    const prevNotifications = [...notifications];
    setNotifications([]);

    try {
      await clearAllNotifications(currentUser.token);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "All notifications cleared",
      });
    } catch (error) {
      console.error("Error clearing notifications:", error);
      // Revert on error
      setNotifications(prevNotifications);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to clear notifications",
      });
    }
  };

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      <LoadingScreen visible={loading} />
      {!loading && (
        <>
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
                  <TouchableOpacity
                    className="py-1"
                    onPress={handleMarkAllAsRead}
                  >
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
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <NotificationItem
                  notification={item}
                  onPress={() => handleNotificationPress(item._id)}
                  onDelete={() => handleDeleteNotification(item._id)}
                />
              )}
              contentContainerStyle={{ padding: 16 }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={["#4461F2"]}
                  tintColor="#4461F2"
                />
              }
            />
          )}
        </>
      )}
    </View>
  );
}
