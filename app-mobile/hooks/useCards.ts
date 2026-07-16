import { useCallback, useEffect, useState } from 'react';
import { Endpoints } from '@/lib/endpoints';
import type { SavedCard } from '@/types';

/**
 * The patient's cards, as Stripe knows them.
 *
 * This used to be a local wallet in SecureStore holding a brand and last4 that
 * the add-card form typed in by hand. It was decoration: the PAN was collected
 * and thrown away, nothing was ever attached to Stripe, none of it could be
 * charged, and it vanished on reinstall. Worse, collecting a raw card number in
 * our own text field pulled the app into PCI scope for no benefit at all.
 *
 * Now the card lives in Stripe and this just reads it. Stripe is the only source
 * of truth for what is actually chargeable — a mirrored copy drifts into lying
 * the moment a card expires or is detached from another device.
 */
export function useCards() {
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setCards(await Endpoints.cards());
    } catch {
      // No cards is the honest fallback for a read failure: it offers "add a
      // card", which is harmless, rather than showing one that may not exist.
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  /**
   * These return the new list from the server rather than mutating a local copy
   * — the server already re-reads Stripe, so its answer is authoritative and
   * this can't drift out of sync with it.
   */
  const removeCard = useCallback(async (id: string) => {
    setCards(await Endpoints.deleteCard(id));
  }, []);

  const setDefault = useCallback(async (id: string) => {
    setCards(await Endpoints.setDefaultCard(id));
  }, []);

  return { cards, loading, removeCard, setDefault, refresh };
}
