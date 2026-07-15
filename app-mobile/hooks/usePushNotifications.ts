import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Endpoints } from '@/lib/endpoints';
import { useSession } from '@/providers/SessionProvider';
import { palette } from '@/constants/theme';

/** Android channel accent. Matches the expo-notifications plugin colour. */
const PRIMARY = palette.light.primary;

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

/**
 * Routes a notification payload to the relevant screen. Nurses and patients
 * live in different tab stacks, so the same payload lands in different places.
 */
function handleDeepLink(data: NotifData, isNurse: boolean) {
  if (data.appointmentId) router.push(`/appointment/${data.appointmentId}`);
  else if (data.emergencyId) router.push(`/emergency/${data.emergencyId}`);
  else if (data.type === 'payment') router.navigate('/(tabs)/payment');
  else if (data.type === 'appointment')
    router.navigate(isNurse ? '/(nurse)/jobs' : '/(tabs)/schedule');
}

/** Registers the device for push + wires deep-link handling while signed in. */
export function usePushNotifications() {
  const { isLoggedIn, me } = useSession();
  const isNurse = me?.role === 'nurse';
  // Keyed by profile id, not a bare flag: signing out and back in as a
  // different user must re-register this device against the new account.
  const registeredFor = useRef<string | null>(null);
  // The tap listener is mounted once, so read the role through a ref.
  const isNurseRef = useRef(isNurse);
  isNurseRef.current = isNurse;

  useEffect(() => {
    if (!isLoggedIn) {
      registeredFor.current = null;
      return;
    }
    // Wait for `me` — the token must be registered against a known account.
    const profileId = me?.id;
    if (!profileId || registeredFor.current === profileId) return;
    registeredFor.current = profileId;

    (async () => {
      try {
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Default',
            importance: Notifications.AndroidImportance.HIGH,
            lightColor: PRIMARY,
          });
          // Incoming jobs and SOS ride on their own channel so they can bypass
          // Do Not Disturb and use a distinct sound. The server sends
          // channelId 'jobs' for anything it marks urgent.
          await Notifications.setNotificationChannelAsync('jobs', {
            name: 'Incoming requests',
            importance: Notifications.AndroidImportance.MAX,
            lightColor: PRIMARY,
            vibrationPattern: [0, 250, 250, 250],
            bypassDnd: true,
            enableVibrate: true,
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
        await Endpoints.updateSettings({ expo_push_token: token });
      } catch (err) {
        // Push is best-effort; never block the app on it. But a silent failure
        // here means the device never receives anything, so leave a trace.
        registeredFor.current = null; // allow a retry on the next mount
        console.warn('[push] registration failed', err);
      }
    })();
  }, [isLoggedIn, me?.id]);

  // Deep-link on tap (cold start + warm).
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      handleDeepLink(
        (response.notification.request.content.data ?? {}) as NotifData,
        isNurseRef.current,
      );
    });
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response)
        handleDeepLink(
          (response.notification.request.content.data ?? {}) as NotifData,
          isNurseRef.current,
        );
    });
    return () => sub.remove();
  }, []);
}
