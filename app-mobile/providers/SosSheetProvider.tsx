import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { SosSheet } from '@/components/sos/SosSheet';

interface SosSheetValue {
  /** Open the SOS bottom sheet from anywhere (Home CTA, promo card, tab button). */
  open: () => void;
}

const SosSheetContext = createContext<SosSheetValue>({ open: () => {} });

export const useSosSheet = () => useContext(SosSheetContext);

/** Hosts the single, app-wide SOS bottom sheet and exposes `open()` to descendants. */
export function SosSheetProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);

  const value = useMemo<SosSheetValue>(() => ({ open: () => setVisible(true) }), []);
  const close = useCallback(() => setVisible(false), []);

  return (
    <SosSheetContext.Provider value={value}>
      {children}
      <SosSheet visible={visible} onClose={close} />
    </SosSheetContext.Provider>
  );
}
