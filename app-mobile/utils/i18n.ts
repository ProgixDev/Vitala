import { useSyncExternalStore } from 'react';
import { en } from '@/locales/en';
import { fr } from '@/locales/fr';

export type Dict = Record<string, string>;

const dictionaries: Record<string, Dict> = { en, fr };
const listeners = new Set<() => void>();
let current = 'en';

export function setLanguage(lang: string): void {
  const next = dictionaries[lang] ? lang : 'en';
  if (next === current) return;
  current = next;
  listeners.forEach((l) => l());
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
