import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Endpoints } from '@/lib/endpoints';
import { useSession } from '@/providers/SessionProvider';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

type NotifData = {
  type?: string;
  appointmentId?: string;
  emergencyId?: string;
};

/** Routes a notification payload to the relevant screen. */
function handleDeepLink(data: NotifData) {
  if (data.appointmentId) router.push(`/appointment/${data.appointmentId}`);
  else if (data.emergencyId) router.push(`/emergency/${data.emergencyId}`);
  else if (data.type === 'payment') router.navigate('/(tabs)/payment');
  else if (data.type === 'appointment') router.navigate('/(tabs)/schedule');
}

/** Registers the device for push + wires deep-link handling while signed in. */
export function usePushNotifications() {
  const { isLoggedIn } = useSession();
  const registered = useRef(false);

  // Register token once per session.
  useEffect(() => {
    if (!isLoggedIn || registered.current) return;
    registered.current = true;

    (async () => {
      try {
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Default',
            importance: Notifications.AndroidImportance.HIGH,
            lightColor: '#1D4ED8',
          });
        }
        if (!Device.isDevice) return;

        const { status: existing } = await Notifications.getPermissionsAsync();
        let status = existing;
        if (status !== 'granted') {
          status = (await Notifications.requestPermissionsAsync()).status;
        }
        if (status !== 'granted') return;

        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId ??
          Constants.easConfig?.projectId;
        if (!projectId) return; // needs an EAS project to mint a token

        const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        await Endpoints.updateSettings({ expo_push_token: token }).catch(() => undefined);
      } catch {
        // Push is best-effort; never block the app on it.
      }
    })();
  }, [isLoggedIn]);

  // Deep-link on tap (cold start + warm).
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      handleDeepLink((response.notification.request.content.data ?? {}) as NotifData);
    });
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) handleDeepLink((response.notification.request.content.data ?? {}) as NotifData);
    });
    return () => sub.remove();
  }, []);
}
