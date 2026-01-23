import { getSettings, updatePushToken } from "@/utils/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  addNotificationReceivedListener,
  addNotificationResponseListener,
  getLastNotificationResponse,
  isPushNotificationsSupported,
  NotificationData,
  parseNotificationData,
  registerForPushNotificationsAsync,
} from "@/utils/notifications";
import type { EventSubscription, Notification } from "expo-notifications";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";

interface UseNotificationsReturn {
  expoPushToken: string | null;
  notification: Notification | null;
  registerPushNotifications: () => Promise<string | null>;
}

export function useNotifications(): UseNotificationsReturn {
  const { currentUser } = useCurrentUser();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);
  const notificationListener = useRef<EventSubscription | null>(null);
  const responseListener = useRef<EventSubscription | null>(null);

  // Handle notification navigation
  const handleNotificationNavigation = (data: NotificationData) => {
    if (data.url) {
      // If there's a direct URL, navigate to it
      router.push(data.url as any);
      return;
    }

    // Navigate based on notification type
    switch (data.type) {
      case "appointment":
        if (data.appointmentId) {
          router.push(`/appointment/${data.appointmentId}` as any);
        } else {
          router.push("/(tabs)/" as any);
        }
        break;
      case "payment":
        if (data.paymentId) {
          router.push(`/appointment/${data.appointmentId}/payment` as any);
        } else {
          router.push("/profile/transaction-history" as any);
        }
        break;
      case "emergency":
        router.push("/(tabs)/sos" as any);
        break;
      case "message":
      case "system":
      case "promotion":
      case "verification":
      default:
        router.push("/profile/notifications" as any);
        break;
    }
  };

  // Register for push notifications and update server
  const registerPushNotifications = async (): Promise<string | null> => {
    try {
      // Check user settings first
      if (currentUser?.token) {
        try {
          const settingsResponse = await getSettings(currentUser.token);
          const settings = settingsResponse.data;

          // If push notifications are disabled in settings, don't register
          if (settings.notifications?.push === false) {
            console.log("Push notifications disabled in user settings");
            return null;
          }
        } catch (error) {
          console.error("Failed to fetch settings:", error);
          // Continue with registration if we can't fetch settings
        }
      }

      const token = await registerForPushNotificationsAsync();

      if (token) {
        setExpoPushToken(token);

        // Update token on server if user is logged in
        if (currentUser?.token) {
          try {
            await updatePushToken(currentUser.token, token);
            console.log("Push token updated on server");
          } catch (error) {
            console.error("Failed to update push token on server:", error);
          }
        }
      }

      return token;
    } catch (error) {
      console.error("Error registering for push notifications:", error);
      return null;
    }
  };

  useEffect(() => {
    // Skip if notifications not supported (e.g., Expo Go)
    if (!isPushNotificationsSupported()) {
      return;
    }

    // Register for push notifications on mount
    registerPushNotifications();

    // Check for initial notification response (app opened from notification)
    getLastNotificationResponse().then((response) => {
      if (response) {
        const data = parseNotificationData(response.notification);
        // Small delay to ensure navigation is ready
        setTimeout(() => handleNotificationNavigation(data), 100);
      }
    });

    // Listen for incoming notifications while app is foregrounded
    notificationListener.current = addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
        console.log("Notification received:", notification);
      },
    );

    // Listen for user interaction with notification
    responseListener.current = addNotificationResponseListener((response) => {
      const data = parseNotificationData(response.notification);
      handleNotificationNavigation(data);
    });

    // Cleanup
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return {
    expoPushToken,
    notification,
    registerPushNotifications,
  };
}
