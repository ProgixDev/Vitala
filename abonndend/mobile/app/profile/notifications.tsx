import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  clearAllNotifications,
  deleteNotification,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/utils/api";
import {
  Badge,
  Button,
  Card,
  Chip,
  EmptyState,
  Header,
  IconButton,
  Screen,
  SkeletonList,
  Text,
} from "@/components/ui";
import { ThemeColors, useThemeColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { BackHandler, FlatList, RefreshControl, View } from "react-native";
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

const getNotificationIcon = (
  type: string,
): keyof typeof Ionicons.glyphMap => {
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

const getNotificationStyle = (
  type: string,
): { bg: string; iconKey: keyof ThemeColors } => {
  switch (type) {
    case "appointment":
      return { bg: "bg-primary-soft", iconKey: "primary" };
    case "payment":
      return { bg: "bg-accent-soft", iconKey: "accent" };
    case "message":
      return { bg: "bg-primary-soft", iconKey: "primary" };
    case "system":
      return { bg: "bg-surface-alt", iconKey: "mutedForeground" };
    case "emergency":
      return { bg: "bg-emergency-soft", iconKey: "emergency" };
    case "promotion":
      return { bg: "bg-warning-soft", iconKey: "warning" };
    case "verification":
      return { bg: "bg-accent-soft", iconKey: "accent" };
    default:
      return { bg: "bg-surface-alt", iconKey: "mutedForeground" };
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
  const colors = useThemeColors();
  const iconName = getNotificationIcon(notification.type);
  const style = getNotificationStyle(notification.type);
  const unread = !notification.isRead;

  return (
    <Card
      onPress={onPress}
      elevation="e1"
      className={`mb-3 flex-row ${unread ? "border-l-4 border-l-primary" : ""}`}
    >
      <View
        className={`w-12 h-12 rounded-lg items-center justify-center mr-3 ${style.bg}`}
      >
        <Ionicons name={iconName} size={22} color={colors[style.iconKey]} />
      </View>
      <View className="flex-1">
        <View className="flex-row items-center mb-1">
          <Text
            variant="body"
            weight="semibold"
            color="foreground"
            className="flex-1"
          >
            {notification.title}
          </Text>
          {unread && (
            <View className="w-2 h-2 rounded-full bg-primary ml-2" />
          )}
        </View>
        <Text variant="label" color="muted" numberOfLines={2}>
          {notification.message}
        </Text>
        <View className="flex-row items-center justify-between mt-1.5">
          <Text variant="caption" color="muted">
            {formatRelativeTime(notification.createdAt)}
          </Text>
          {notification.priority === "urgent" && (
            <Badge label="Urgent" tone="emergency" icon="warning-outline" />
          )}
        </View>
      </View>
      <IconButton
        icon="close"
        size={18}
        accessibilityLabel="Delete notification"
        onPress={onDelete}
        className="ml-1"
      />
    </Card>
  );
};

export default function Notifications() {
  const { currentUser } = useCurrentUser();
  const colors = useThemeColors();
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
    [currentUser?.token],
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
      },
    );

    return () => backHandler.remove();
  }, []);

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications(false);
  }, [fetchNotifications]);

  const filteredNotifications = notifications.filter((notif) =>
    filter === "all" ? true : !notif.isRead,
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationPress = async (id: string) => {
    if (!currentUser?.token) return;

    // Optimistic update
    setNotifications((prev) =>
      prev.map((notif) =>
        notif._id === id ? { ...notif, isRead: true } : notif,
      ),
    );

    try {
      await markNotificationAsRead(currentUser.token, id);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      // Revert on error
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === id ? { ...notif, isRead: false } : notif,
        ),
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
      prev.map((notif) => ({ ...notif, isRead: true })),
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
    <Screen padded={false} edges={["top"]}>
      <View className="px-5">
        <Header
          title="Notifications"
          showBack
          onBack={() => router.replace("/(tabs)/profile")}
          rightIcon="ellipsis-vertical"
          onRightPress={() => console.log("More options")}
          rightLabel="More options"
        />
      </View>

      {loading ? (
        <View className="px-5 pt-4">
          <SkeletonList count={6} itemHeight={92} />
        </View>
      ) : (
        <>
          {/* Filter and Actions */}
          <View className="px-5 pt-1 pb-3">
            <View className="flex-row gap-3 mb-3">
              <Chip
                label={`All (${notifications.length})`}
                selected={filter === "all"}
                onPress={() => setFilter("all")}
              />
              <Chip
                label={`Unread (${unreadCount})`}
                selected={filter === "unread"}
                onPress={() => setFilter("unread")}
              />
            </View>

            {notifications.length > 0 && (
              <View className="flex-row gap-2">
                {unreadCount > 0 && (
                  <Button
                    label="Mark all as read"
                    onPress={handleMarkAllAsRead}
                    variant="ghost"
                    size="sm"
                    fullWidth={false}
                    leftIcon="checkmark-done-outline"
                  />
                )}
                <Button
                  label="Clear all"
                  onPress={handleClearAll}
                  variant="danger"
                  size="sm"
                  fullWidth={false}
                  leftIcon="trash-outline"
                />
              </View>
            )}
          </View>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <EmptyState
              icon="notifications-off-outline"
              title="No notifications"
              message={
                filter === "unread"
                  ? "You have no unread notifications"
                  : "You're all caught up!"
              }
            />
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
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[colors.primary]}
                  tintColor={colors.primary}
                />
              }
            />
          )}
        </>
      )}
    </Screen>
  );
}
