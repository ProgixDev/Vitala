import { usePushNotifications } from '@/hooks/usePushNotifications';

/** Headless component that registers push + deep-linking (must sit under SessionProvider). */
export function NotificationsBridge() {
  usePushNotifications();
  return null;
}
