import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Endpoints } from '@/lib/endpoints';
import { setLanguage } from '@/utils/i18n';
import type { Me } from '@/types';

interface SessionContextValue {
  booting: boolean;
  session: Session | null;
  me: Me | null;
  isLoggedIn: boolean;
  loadingMe: boolean;
  refreshMe: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [booting, setBooting] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [loadingMe, setLoadingMe] = useState(false);

  // Restore any persisted session, then keep it in sync.
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setBooting(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const refreshMe = useCallback(async () => {
    setLoadingMe(true);
    try {
      const profile = await Endpoints.me();
      setMe(profile);
      if (profile.settings?.language) setLanguage(profile.settings.language);
    } catch {
      // A failed /me (e.g. row not ready yet) shouldn't crash the app.
    } finally {
      setLoadingMe(false);
    }
  }, []);

  // Load the profile whenever we gain a session; clear it when we lose one.
  useEffect(() => {
    if (session?.access_token) {
      void refreshMe();
    } else {
      setMe(null);
    }
  }, [session?.access_token, refreshMe]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setMe(null);
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      booting,
      session,
      me,
      isLoggedIn: !!session,
      loadingMe,
      refreshMe,
      signIn,
      signOut,
    }),
    [booting, session, me, loadingMe, refreshMe, signIn, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
