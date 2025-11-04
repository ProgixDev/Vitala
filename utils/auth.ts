import AsyncStorage from "@react-native-async-storage/async-storage";

const LOGGED_IN_KEY = "loggedIn";
const USERS_KEY = "users";
const CURRENT_USER_KEY = "currentUser";

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
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
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
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
    } catch (error) {
      console.error("Error clearing auth data:", error);
      throw error;
    }
  },

  /**
   * Get all users from storage
   * @returns Promise<User[]>
   */
  getUsers: async (): Promise<User[]> => {
    try {
      const usersJson = await AsyncStorage.getItem(USERS_KEY);
      if (!usersJson) return [];
      return JSON.parse(usersJson);
    } catch (error) {
      console.error("Error getting users:", error);
      return [];
    }
  },

  /**
   * Save user to storage
   * @param user User data to save
   * @returns Promise<void>
   */
  saveUser: async (user: User): Promise<void> => {
    try {
      const users = await authStorage.getUsers();

      // Check if email already exists
      const existingUser = users.find((u) => u.email === user.email);
      if (existingUser) {
        throw new Error("Email already registered");
      }

      users.push(user);
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error("Error saving user:", error);
      throw error;
    }
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
    try {
      const users = await authStorage.getUsers();
      const user = users.find(
        (u) => u.email === email && u.password === password,
      );
      return user || null;
    } catch (error) {
      console.error("Error validating credentials:", error);
      return null;
    }
  },

  /**
   * Set current logged-in user
   * @param user User data (without password)
   * @returns Promise<void>
   */
  setCurrentUser: async (user: CurrentUser): Promise<void> => {
    try {
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error("Error setting current user:", error);
      throw error;
    }
  },

  /**
   * Get current logged-in user
   * @returns Promise<CurrentUser | null>
   */
  getCurrentUser: async (): Promise<CurrentUser | null> => {
    try {
      const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (!userJson) return null;
      return JSON.parse(userJson);
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  },

  /**
   * Toggle user type between patient and nurse
   * @returns Promise<void>
   */
  toggleUserType: async (): Promise<void> => {
    try {
      const currentUser = await authStorage.getCurrentUser();
      if (!currentUser) {
        throw new Error("No current user found");
      }

      const newUserType: "patient" | "nurse" =
        currentUser.role === "patient" ? "nurse" : "patient";

      const updatedUser: CurrentUser = {
        ...currentUser,
        role: newUserType,
      };

      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Error toggling user type:", error);
      throw error;
    }
  },
  /**
   * Add a location to user's locations
   * @param location Location object to add
   * @returns Promise<void>
   */
  addUserLocation: async (location: UserLocation): Promise<void> => {
    try {
      const currentUser = await authStorage.getCurrentUser();
      if (!currentUser) {
        throw new Error("No current user found");
      }

      const locations = currentUser.locations || [];
      locations.push(location);

      const updatedUser: CurrentUser = {
        ...currentUser,
        locations,
      };

      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Error adding user location:", error);
      throw error;
    }
  },

  /**
   * Remove a location from user's locations by index
   * @param index Index of the location to remove
   * @returns Promise<void>
   */
  removeUserLocation: async (index: number): Promise<void> => {
    try {
      const currentUser = await authStorage.getCurrentUser();
      if (!currentUser) {
        throw new Error("No current user found");
      }

      const locations = currentUser.locations || [];
      if (index < 0 || index >= locations.length) {
        throw new Error("Invalid location index");
      }

      locations.splice(index, 1);

      const updatedUser: CurrentUser = {
        ...currentUser,
        locations,
      };

      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Error removing user location:", error);
      throw error;
    }
  },

  /**
   * Clear all users from storage
   * @returns Promise<void>
   */
  clearAllUsers: async (): Promise<void> => {
    try {
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify([]));
    } catch (error) {
      console.error("Error clearing all users:", error);
      throw error;
    }
  },
};
