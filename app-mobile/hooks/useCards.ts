import { useCallback, useSyncExternalStore } from 'react';
import * as SecureStore from 'expo-secure-store';

/**
 * Local card wallet. The backend keeps cards in Stripe and exposes no card CRUD,
 * so the saved-cards UI is backed by SecureStore. Only non-sensitive display
 * data (brand + last 4 + expiry) is stored — never the full PAN or CVV.
 *
 * State lives in a single module-level store (not per-component useState) so that
 * every screen using useCards() stays in sync — e.g. saving a card on /cards/add
 * is immediately reflected on the payment tab when navigating back.
 */
export interface StoredCard {
  id: string;
  brand: string;
  last4: string;
  exp: string;
  name: string;
  isDefault: boolean;
}

const KEY = 'vitala.cards';

// --- Shared store ----------------------------------------------------------
let cache: StoredCard[] = [];
let ready = false; // true once the initial SecureStore read resolves
let started = false; // guards the one-time initial load
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!started) {
    started = true;
    SecureStore.getItemAsync(KEY)
      .then((v) => {
        cache = v ? (JSON.parse(v) as StoredCard[]) : [];
      })
      .catch(() => {
        cache = [];
      })
      .finally(() => {
        ready = true;
        emit();
      });
  }
  return () => {
    listeners.delete(listener);
  };
}

async function persist(next: StoredCard[]) {
  cache = next;
  emit();
  await SecureStore.setItemAsync(KEY, JSON.stringify(next)).catch(() => undefined);
}

// --- Public helpers --------------------------------------------------------
export function detectBrand(number: string): string {
  const n = number.replace(/\s/g, '');
  if (/^4/.test(n)) return 'Visa';
  if (/^5[1-5]/.test(n)) return 'Mastercard';
  if (/^3[47]/.test(n)) return 'Amex';
  if (/^6/.test(n)) return 'Discover';
  return 'Card';
}

export function useCards() {
  const cards = useSyncExternalStore(subscribe, () => cache);
  const loading = useSyncExternalStore(subscribe, () => !ready);

  const addCard = useCallback(async (card: Omit<StoredCard, 'id' | 'isDefault'>) => {
    const first = cache.length === 0;
    const id = `card_${Date.now()}_${Math.round(cache.length)}`;
    const next: StoredCard[] = [...cache, { ...card, id, isDefault: first }];
    await persist(next);
  }, []);

  const removeCard = useCallback(async (id: string) => {
    const filtered = cache.filter((c) => c.id !== id);
    if (filtered.length && !filtered.some((c) => c.isDefault)) filtered[0].isDefault = true;
    await persist(filtered);
  }, []);

  const setDefault = useCallback(async (id: string) => {
    await persist(cache.map((c) => ({ ...c, isDefault: c.id === id })));
  }, []);

  return { cards, loading, addCard, removeCard, setDefault };
}
