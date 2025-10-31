import AsyncStorage from "@react-native-async-storage/async-storage";

const LOGGED_IN_KEY = "loggedIn";

export const authStorage = {
  /**
   * Check if user is logged in
   * @returns Promise<boolean>
   */
  isLoggedIn: async (): Promise<boolean> => {
    try {
      const value = await AsyncStorage.getItem(LOGGED_IN_KEY);
      return value === "true";
    } catch (error) {
      console.error("Error checking login status:", error);
      return false;
    }
  },

  /**
   * Set user as logged in
   * @returns Promise<void>
   */
  setLoggedIn: async (): Promise<void> => {
    try {
      await AsyncStorage.setItem(LOGGED_IN_KEY, "true");
    } catch (error) {
      console.error("Error setting login status:", error);
      throw error;
    }
  },

  /**
   * Set user as logged out
   * @returns Promise<void>
   */
  setLoggedOut: async (): Promise<void> => {
    try {
      await AsyncStorage.setItem(LOGGED_IN_KEY, "false");
    } catch (error) {
      console.error("Error setting logout status:", error);
      throw error;
    }
  },

  /**
   * Clear all auth data
   * @returns Promise<void>
   */
  clearAuth: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(LOGGED_IN_KEY);
    } catch (error) {
      console.error("Error clearing auth data:", error);
      throw error;
    }
  },
};
