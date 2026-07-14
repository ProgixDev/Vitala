import { useCallback, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

/**
 * Local card wallet. The backend keeps cards in Stripe and exposes no card CRUD,
 * so the saved-cards UI is backed by SecureStore. Only non-sensitive display
 * data (brand + last 4 + expiry) is stored — never the full PAN or CVV.
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

export function detectBrand(number: string): string {
  const n = number.replace(/\s/g, '');
  if (/^4/.test(n)) return 'Visa';
  if (/^5[1-5]/.test(n)) return 'Mastercard';
  if (/^3[47]/.test(n)) return 'Amex';
  if (/^6/.test(n)) return 'Discover';
  return 'Card';
}

export function useCards() {
  const [cards, setCards] = useState<StoredCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    SecureStore.getItemAsync(KEY)
      .then((v) => setCards(v ? (JSON.parse(v) as StoredCard[]) : []))
      .catch(() => setCards([]))
      .finally(() => setLoading(false));
  }, []);

  const persist = useCallback(async (next: StoredCard[]) => {
    setCards(next);
    await SecureStore.setItemAsync(KEY, JSON.stringify(next)).catch(() => undefined);
  }, []);

  const addCard = useCallback(
    async (card: Omit<StoredCard, 'id' | 'isDefault'>) => {
      const id = `card_${Date.now()}`;
      const next: StoredCard[] = [
        ...cards.map((c) => ({ ...c, isDefault: cards.length === 0 ? true : c.isDefault })),
        { ...card, id, isDefault: cards.length === 0 },
      ];
      await persist(next);
    },
    [cards, persist],
  );

  const removeCard = useCallback(
    async (id: string) => {
      const filtered = cards.filter((c) => c.id !== id);
      if (filtered.length && !filtered.some((c) => c.isDefault)) filtered[0].isDefault = true;
      await persist(filtered);
    },
    [cards, persist],
  );

  const setDefault = useCallback(
    async (id: string) => {
      await persist(cards.map((c) => ({ ...c, isDefault: c.id === id })));
    },
    [cards, persist],
  );

  return { cards, loading, addCard, removeCard, setDefault };
}
