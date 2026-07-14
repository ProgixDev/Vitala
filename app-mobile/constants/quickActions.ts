import type { Href } from 'expo-router';
import type { IconName } from '@/components/ui';
import type { IllustrationKey } from '@/constants/illustrations';
import type { ThemeColors } from '@/constants/theme';

export type QuickActionId =
  | 'sos'
  | 'map'
  | 'schedule'
  | 'payments'
  | 'contacts'
  | 'transactions'
  | 'profile'
  | 'learn'
  | 'faq'
  | 'settings'
  | 'notifications';

type Tone = keyof Pick<
  ThemeColors,
  'primary' | 'accent' | 'emergency' | 'success' | 'warning'
>;

export interface QuickAction {
  id: QuickActionId;
  icon: IconName;
  /** Colorful illustration (shown in its Well) when we have matching art. */
  illustration?: IllustrationKey;
  /** i18n key for the tile label. */
  labelKey: string;
  href: Href;
  tone: Tone;
}

/**
 * Everything a patient can pin as a home-screen shortcut. Feature anchors carry
 * a colorful `illustration`; the rest fall back to a teal line icon in the same
 * Well, so the row reads as one set regardless of which art exists yet.
 */
export const QUICK_ACTIONS: QuickAction[] = [
  { id: 'sos', icon: 'alert-circle', illustration: 'siren', labelKey: 'quick.sos', href: '/(tabs)/sos', tone: 'emergency' },
  { id: 'map', icon: 'map-outline', labelKey: 'quick.map', href: '/booking/map', tone: 'accent' },
  { id: 'schedule', icon: 'calendar-outline', illustration: 'appointment', labelKey: 'quick.schedule', href: '/(tabs)/schedule', tone: 'primary' },
  { id: 'payments', icon: 'card-outline', illustration: 'card', labelKey: 'quick.payments', href: '/(tabs)/payment', tone: 'primary' },
  { id: 'contacts', icon: 'call-outline', labelKey: 'quick.contacts', href: '/profile/emergency-contacts', tone: 'accent' },
  { id: 'transactions', icon: 'receipt-outline', labelKey: 'quick.transactions', href: '/profile/transactions', tone: 'success' },
  { id: 'profile', icon: 'person-outline', labelKey: 'quick.profile', href: '/profile/edit', tone: 'primary' },
  { id: 'learn', icon: 'medical-outline', labelKey: 'quick.learn', href: '/learn', tone: 'warning' },
  { id: 'faq', icon: 'help-circle-outline', labelKey: 'quick.faq', href: '/profile/faq', tone: 'accent' },
  { id: 'settings', icon: 'settings-outline', labelKey: 'quick.settings', href: '/profile/settings', tone: 'primary' },
  { id: 'notifications', icon: 'notifications-outline', labelKey: 'quick.notifications', href: '/profile/notifications', tone: 'warning' },
];

export const DEFAULT_QUICK_ACTIONS: QuickActionId[] = ['sos', 'map', 'schedule', 'payments'];

export const QUICK_ACTION_SLOTS = 4;

export const QUICK_ACTION_MAP: Record<QuickActionId, QuickAction> = Object.fromEntries(
  QUICK_ACTIONS.map((a) => [a.id, a]),
) as Record<QuickActionId, QuickAction>;
