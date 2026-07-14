import { getMe } from "@/utils/api";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

/**
 * Central auth/session hook. Session + token are now owned by Supabase
 * (persisted + auto-refreshed); the profile is loaded from the API's /me.
 * The public surface is unchanged so existing screens keep working:
 *   currentUser (with .token), loading, refreshUser, isLoggedIn,
 *   logout, setTokens (compat no-op), getTokens, clearTokens.
 */
export function useCurrentUser() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentUser();
    // Keep the app in sync with Supabase auth changes (login, logout, refresh).
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setCurrentUser(null);
      } else {
        void loadCurrentUser();
      }
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getTokens = async (): Promise<{
    accessToken: string | null;
    refreshToken: string | null;
  }> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return {
      accessToken: session?.access_token ?? null,
      refreshToken: session?.refresh_token ?? null,
    };
  };

  // Supabase persists the session itself after signIn/signUp — kept for compat
  // so existing callers that pass tokens still type-check.
  const setTokens = async (
    _accessToken?: string,
    _refreshToken?: string,
  ): Promise<void> => {};

  const clearTokens = async (): Promise<void> => {
    await supabase.auth.signOut();
  };

  const isLoggedIn = async (): Promise<boolean> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return !!session;
  };

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const loadCurrentUser = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setCurrentUser(null);
        return;
      }
      try {
        const me = await getMe(session.access_token);
        const user = me.data as CurrentUser;
        setCurrentUser({ ...user, token: session.access_token });
      } catch (err) {
        console.warn("Failed to load profile", err);
        // Session exists but profile fetch failed — surface a minimal user so
        // the app still treats them as logged in and can retry.
        setCurrentUser({ token: session.access_token } as CurrentUser);
      }
    } catch (error) {
      console.error("Error loading current user:", error);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    await loadCurrentUser();
  };

  return {
    currentUser,
    loading,
    refreshUser,
    isLoggedIn,
    logout,
    setTokens,
    getTokens,
    clearTokens,
  };
}
