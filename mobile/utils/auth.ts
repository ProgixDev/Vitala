import * as SecureStore from "expo-secure-store";

const LOGGED_IN_KEY = "loggedIn";
const USERS_KEY = "users";
const CURRENT_USER_KEY = "currentUser";
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export const authStorage = {
  /**
   * Check if user is logged in
   * @returns Promise<boolean>
   */
  isLoggedIn: async (): Promise<boolean> => {
    // Check if access token exists
    const { accessToken } = await authStorage.getTokens();
    return !!accessToken;
  },

  /**
   * Set user as logged in
   * @returns Promise<void>
   */
  setLoggedIn: async (): Promise<void> => {
    // Removed local storage - no-op
  },

  /**
   * Set user as logged out
   * @returns Promise<void>
   */
  setLoggedOut: async (): Promise<void> => {
    // Clear tokens on logout
    await authStorage.clearTokens();
  },

  /**
   * Clear all auth data
   * @returns Promise<void>
   */
  clearAuth: async (): Promise<void> => {
    // Removed local storage - no-op
  },

  /**
   * Get all users from storage
   * @returns Promise<User[]>
   */
  getUsers: async (): Promise<User[]> => {
    // Removed local storage - users are now in MongoDB
    return [];
  },

  /**
   * Save user to storage
   * @param user User data to save
   * @returns Promise<void>
   */
  saveUser: async (user: User): Promise<void> => {
    // Removed local storage - use API to save to MongoDB
    throw new Error("Use API to register users");
  },

  /**
   * Validate user credentials
   * @param email User email
   * @param password User password
   * @returns Promise<User | null>
   */
  validateCredentials: async (
    email: string,
    password: string,
  ): Promise<User | null> => {
    // Removed local storage - use API for authentication
    return null;
  },

  /**
   * Set current logged-in user
   * @param user User data (without password)
   * @returns Promise<void>
   */
  setCurrentUser: async (user: CurrentUser): Promise<void> => {
    // Removed local storage - no-op
  },

  /**
   * Get current logged-in user
   * @returns Promise<CurrentUser | null>
   */
  getCurrentUser: async (): Promise<CurrentUser | null> => {
    // Removed local storage - fetch from API if token available
    // For now, return null since no token storage
    return null;
  },

  /**
   * Store access and refresh tokens
   */
  setTokens: async (
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
  },

  /**
   * Retrieve stored tokens
   */
  getTokens: async (): Promise<{
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
  },

  /**
   * Clear stored tokens
   */
  clearTokens: async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error("Error clearing tokens:", error);
      throw error;
    }
  },

  /**
   * Toggle user type between patient and nurse
   * @returns Promise<void>
   */
  toggleUserType: async (): Promise<void> => {
    // Removed local storage - use API to update user
    throw new Error("Use API to update user role");
  },

  /**
   * Add a location to user's locations
   * @param location Location object to add
   * @returns Promise<void>
   */
  addUserLocation: async (location: UserLocation): Promise<void> => {
    // Removed local storage - use API to update user
    throw new Error("Use API to update user locations");
  },

  /**
   * Remove a location from user's locations by index
   * @param index Index of the location to remove
   * @returns Promise<void>
   */
  removeUserLocation: async (index: number): Promise<void> => {
    // Removed local storage - use API to update user
    throw new Error("Use API to update user locations");
  },

  /**
   * Clear all users from storage
   * @returns Promise<void>
   */
  clearAllUsers: async (): Promise<void> => {
    // Removed local storage - no-op
  },
};
