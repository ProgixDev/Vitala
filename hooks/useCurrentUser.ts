import { getMe, refresh } from "@/utils/api";
import { authStorage } from "@/utils/auth";
import { useEffect, useState } from "react";

export function useCurrentUser() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      // Prefer backend session
      const { accessToken, refreshToken } = await authStorage.getTokens();
      if (accessToken) {
        try {
          const me = await getMe(accessToken);
          const user = me.data as CurrentUser;
          setCurrentUser(user);
          await authStorage.setCurrentUser(user);
          return;
        } catch (err) {
          // Attempt token refresh on failure
          if (refreshToken) {
            try {
              const res = await refresh(refreshToken);
              await authStorage.setTokens(
                res.data.token,
                res.data.refreshToken
              );
              const me2 = await getMe(res.data.token);
              const user2 = me2.data as CurrentUser;
              setCurrentUser(user2);
              await authStorage.setCurrentUser(user2);
              return;
            } catch (e2) {
              console.warn("Token refresh failed", e2);
              await authStorage.clearTokens();
            }
          }
        }
      }
      // Fallback to local storage user
      const localUser = await authStorage.getCurrentUser();
      setCurrentUser(localUser);
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
  };
}
