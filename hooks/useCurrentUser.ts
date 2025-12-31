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
          const userWithToken = { ...user, token: accessToken };
          setCurrentUser(userWithToken);
          await authStorage.setCurrentUser(userWithToken);
          return;
        } catch (err: any) {
          // Check if email verification is required
          if (err.message?.includes('Email not verified')) {
            console.log('Email not verified, redirecting to verification');
            // Clear tokens since user needs to verify
            await authStorage.clearTokens();
            // Redirect to verification flow will be handled by the app
            setCurrentUser(null);
            return;
          }
          // Attempt token refresh on other failures
          if (refreshToken) {
            try {
              const res = await refresh(refreshToken);
              await authStorage.setTokens(
                res.data.token,
                res.data.refreshToken
              );
              const me2 = await getMe(res.data.token);
              const user2 = me2.data as CurrentUser;
              const user2WithToken = { ...user2, token: res.data.token };
              setCurrentUser(user2WithToken);
              await authStorage.setCurrentUser(user2WithToken);
              return;
            } catch (e2: any) {
              console.warn("Token refresh failed", e2);
              if (e2.message?.includes('Email not verified')) {
                await authStorage.clearTokens();
                setCurrentUser(null);
                return;
              }
              await authStorage.clearTokens();
            }
          }
        }
      }
      // Fallback to local storage user
      const localUser = await authStorage.getCurrentUser();
      const { accessToken: storedToken } = await authStorage.getTokens();
      if (localUser && storedToken) {
        const userWithToken = { ...localUser, token: storedToken };
        setCurrentUser(userWithToken);
      } else {
        setCurrentUser(localUser);
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
  };
}
