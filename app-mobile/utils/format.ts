/**
 * Small formatting helpers used across screens.
 *
 * These follow the *app* language, not the phone's. Passing `undefined` as the
 * Intl locale reads the device locale, which puts "Tue, Jul 14" inside an
 * otherwise-French screen for anyone whose phone is in English — the common
 * case in Montreal.
 */
import { getLanguage, t } from '@/utils/i18n';

/** Quebec French, not France French: "14 h 30", not "14:30". */
function intlLocale(): string {
  return getLanguage() === 'fr' ? 'fr-CA' : 'en-CA';
}

/** Charges are presented in CAD (patients are in Montreal); Stripe settles EUR. */
const CURRENCY_SYMBOLS: Record<string, string> = { CAD: '$', USD: '$', EUR: '€' };

export function formatPrice(amount?: number | null, currency = 'CAD'): string {
  const value = typeof amount === 'number' ? amount : 0;
  const symbol = CURRENCY_SYMBOLS[currency] ?? `${currency} `;
  return `${symbol}${value.toFixed(value % 1 === 0 ? 0 : 2)}`;
}

export function formatDuration(minutes?: number | null): string {
  const m = minutes ?? 0;
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h} h ${rem}` : `${h} h`;
}

/** "2026-07-14" -> "Tue, Jul 14" / "mar. 14 juil.". */
export function formatDate(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(intlLocale(), {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * "14:30" or "14:30:00" -> "2:30 PM" in English, "14 h 30" in French.
 *
 * Quebec runs on the 24-hour clock, so AM/PM can't be hardcoded — a French
 * screen showing "2:30 PM" reads as an untranslated string.
 */
export function formatTime(hhmm?: string | null): string {
  if (!hhmm) return '';
  const [hStr, mStr] = hhmm.split(':');
  const h = Number(hStr);
  const m = Number(mStr ?? 0);
  if (Number.isNaN(h)) return hhmm;
  const mm = String(m).padStart(2, '0');
  if (getLanguage() === 'fr') return `${h} h ${mm}`;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mm} ${period}`;
}

/** Relative "time ago" for feeds. Units and word order come from the locale. */
export function timeAgo(iso?: string | null): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const secs = Math.max(1, Math.floor((Date.now() - then) / 1000));
  if (secs < 60) return t('time.justNow');
  const spans: [number, string][] = [
    [60, 'time.unit.m'],
    [3600, 'time.unit.h'],
    [86400, 'time.unit.d'],
    [604800, 'time.unit.w'],
  ];
  // Largest unit that still yields a count of at least 1.
  let per = 60;
  let unitKey = 'time.unit.m';
  for (const [seconds, key] of spans) {
    if (secs >= seconds) {
      per = seconds;
      unitKey = key;
    }
  }
  return t('time.ago', { value: `${Math.floor(secs / per)}${t(unitKey)}` });
}

export function initialsOf(name?: string | null): string {
  if (!name) return '·';
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '·';
}

export function maskCard(last4?: string | null): string {
  return `•••• •••• •••• ${last4 ?? '····'}`;
}
