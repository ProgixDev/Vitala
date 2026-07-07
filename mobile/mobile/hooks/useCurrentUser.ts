import { getMe, refresh } from "@/utils/api";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_CACHE_KEY = "cached_user_data";
const USER_CACHE_TIMESTAMP_KEY = "cached_user_timestamp";
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export function useCurrentUser() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentUser();
  });

  const setTokens = async (
    accessToken: string,
    refreshToken?: string,
  ): Promise<void> => {
    try {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
      if (refreshToken) {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      }
    } catch (error) {
      console.error("Error setting tokens:", error);
      throw error;
    }
  };

  const getTokens = async (): Promise<{
    accessToken: string | null;
    refreshToken: string | null;
  }> => {
    try {
      const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      return { accessToken, refreshToken };
    } catch (error) {
      console.error("Error getting tokens:", error);
      return { accessToken: null, refreshToken: null };
    }
  };

  const clearTokens = async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_CACHE_KEY);
      await SecureStore.deleteItemAsync(USER_CACHE_TIMESTAMP_KEY);
    } catch (error) {
      console.error("Error clearing tokens:", error);
      throw error;
    }
  };

  const isLoggedIn = async (): Promise<boolean> => {
    const { accessToken } = await getTokens();
    return !!accessToken;
  };

  const logout = async (): Promise<void> => {
    await clearTokens();
    try {
      await SecureStore.deleteItemAsync(USER_CACHE_KEY);
      await SecureStore.deleteItemAsync(USER_CACHE_TIMESTAMP_KEY);
    } catch (error) {
      console.error("Error clearing cached user on logout:", error);
    }
    setCurrentUser(null);
  };

  const isCacheValid = async (): Promise<boolean> => {
    try {
      const timestamp = await SecureStore.getItemAsync(
        USER_CACHE_TIMESTAMP_KEY,
      );
      if (!timestamp) return false;

      const cacheAge = Date.now() - parseInt(timestamp, 10);
      return cacheAge < CACHE_DURATION_MS;
    } catch (error) {
      console.error("Error checking cache validity:", error);
      return false;
    }
  };

  const getCachedUser = async (): Promise<CurrentUser | null> => {
    try {
      const cachedData = await SecureStore.getItemAsync(USER_CACHE_KEY);
      if (!cachedData) return null;
      return JSON.parse(cachedData);
    } catch (error) {
      console.error("Error getting cached user:", error);
      return null;
    }
  };

  const setCachedUser = async (user: CurrentUser): Promise<void> => {
    try {
      await SecureStore.setItemAsync(USER_CACHE_KEY, JSON.stringify(user));
      await SecureStore.setItemAsync(
        USER_CACHE_TIMESTAMP_KEY,
        Date.now().toString(),
      );
    } catch (error) {
      console.error("Error caching user:", error);
    }
  };

  const clearCachedUser = async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(USER_CACHE_KEY);
      await SecureStore.deleteItemAsync(USER_CACHE_TIMESTAMP_KEY);
    } catch (error) {
      console.error("Error clearing cached user:", error);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const { accessToken, refreshToken } = await getTokens();

      if (!accessToken) {
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      // Check if cache is valid
      const cacheValid = await isCacheValid();
      if (cacheValid) {
        const cachedUser = await getCachedUser();
        if (cachedUser) {
          const userWithToken = { ...cachedUser, token: accessToken };
          setCurrentUser(userWithToken);
          setLoading(false);
          return;
        }
      }

      // Cache invalid or doesn't exist, fetch from API
      try {
        const me = await getMe(accessToken);
        const user = me.data as CurrentUser;
        const userWithToken = { ...user, token: accessToken };
        setCurrentUser(userWithToken);
        await setCachedUser(user);
      } catch (err: any) {
        // Check if email verification is required
        if (err.message?.includes("Email not verified")) {
          console.log("Email not verified, redirecting to verification");
          await clearTokens();
          await clearCachedUser();
          setCurrentUser(null);
          return;
        }

        // Attempt token refresh on other failures
        if (refreshToken) {
          try {
            const res = await refresh(refreshToken);
            await setTokens(res.data.token, res.data.refreshToken);
            const me2 = await getMe(res.data.token);
            const user2 = me2.data as CurrentUser;
            const user2WithToken = { ...user2, token: res.data.token };
            setCurrentUser(user2WithToken);
            await setCachedUser(user2);
            return;
          } catch (e2: any) {
            console.warn("Token refresh failed", e2);
            if (e2.message?.includes("Email not verified")) {
              await clearTokens();
              await clearCachedUser();
              setCurrentUser(null);
              return;
            }
            await clearTokens();
            await clearCachedUser();
          }
        }

        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Error loading current user:", error);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    await clearCachedUser();
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
