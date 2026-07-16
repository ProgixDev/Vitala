import { useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { en } from '@/locales/en';
import { fr } from '@/locales/fr';

export type Dict = Record<string, string>;

const dictionaries: Record<string, Dict> = { en, fr };
const listeners = new Set<() => void>();

/**
 * French is the app's language; English is the opt-in, chosen in Settings.
 *
 * This is what an unauthenticated user sees (onboarding, sign-in) — once signed
 * in, SessionProvider applies the language saved on their profile.
 */
export const DEFAULT_LANGUAGE = 'fr';
const STORAGE_KEY = 'vitala.language';
let current: string = DEFAULT_LANGUAGE;

export function isSupported(lang: string | null | undefined): boolean {
  return !!lang && !!dictionaries[lang];
}

export function setLanguage(lang: string): void {
  const next: string = isSupported(lang) ? lang : DEFAULT_LANGUAGE;
  // Remember it even if it isn't a change — the cache may be empty or stale.
  // Persisting is best-effort: losing the cache costs a flash on next launch,
  // and must never stop the language from actually changing.
  try {
    void AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  } catch {
    // Storage unavailable.
  }
  if (next === current) return;
  current = next;
  listeners.forEach((l) => l());
}

/**
 * Apply the last language this device used, before the first paint.
 *
 * The authoritative value lives on the profile and only arrives after auth
 * restore + a /me round-trip. Without this cache an English user watches the
 * app come up in French every cold start and snap over once /me lands — and if
 * /me fails they stay in French for the whole session. Cheap to get wrong in
 * the other direction: worst case the cache is stale and /me corrects it.
 */
export async function restoreLanguage(): Promise<void> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (isSupported(saved)) setLanguage(saved!);
  } catch {
    // No cache, or storage unavailable — DEFAULT_LANGUAGE already applies.
  }
}

export function getLanguage(): string {
  return current;
}

/**
 * Translate a dot-namespaced key. Interpolates {vars}. Missing keys fall back
 * to English, then to the key itself — so nothing ever renders blank.
 */
export function t(key: string, vars?: Record<string, string | number>): string {
  const dict = dictionaries[current] ?? en;
  let str = dict[key] ?? en[key] ?? key;
  if (vars) {
    for (const k of Object.keys(vars)) {
      str = str.split(`{${k}}`).join(String(vars[k]));
    }
  }
  return str;
}

/**
 * Does a key exist in any dictionary? Lets callers pick a role-specific variant
 * ("nurse.status.desc.onway") and fall back to the shared one, instead of
 * rendering the raw key when no variant was written.
 */
export function hasKey(key: string): boolean {
  return key in en || key in (dictionaries[current] ?? en);
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Hook that re-renders the component when the language changes. */
export function useTranslation(): { t: typeof t; language: string } {
  const language = useSyncExternalStore(
    subscribe,
    () => current,
    () => current,
  );
  return { t, language };
}
