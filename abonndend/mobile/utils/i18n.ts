/**
 * Lightweight i18n. English is the default; French is a partial stub that
 * falls back to English per-key. Copy is routed through `t()` so the app is
 * translation-ready without any heavy dependency. A real language switcher
 * can later drive `setLocale`.
 */
import { useSyncExternalStore } from "react";
import en, { type TranslationKey } from "@/locales/en";
import fr from "@/locales/fr";

export type Locale = "en" | "fr";

const dictionaries: Record<Locale, Partial<Record<TranslationKey, string>>> = {
  en,
  fr,
};

let currentLocale: Locale = "en";
const listeners = new Set<() => void>();

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale) {
  if (locale === currentLocale) return;
  currentLocale = locale;
  listeners.forEach((l) => l());
}

/**
 * Translate a key, with optional {placeholder} interpolation.
 * Unknown keys return the key itself (never blank).
 */
export function t(
  key: TranslationKey | string,
  vars?: Record<string, string | number>,
): string {
  const dict = dictionaries[currentLocale];
  let value =
    (dict as Record<string, string>)[key] ??
    (en as Record<string, string>)[key] ??
    key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      value = value.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return value;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Reactive translator hook — re-renders when the locale changes. */
export function useT() {
  useSyncExternalStore(subscribe, getLocale, getLocale);
  return t;
}
