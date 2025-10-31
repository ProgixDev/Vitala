import AsyncStorage from "@react-native-async-storage/async-storage";

const LOGGED_IN_KEY = "loggedIn";
const USERS_KEY = "users";
const CURRENT_USER_KEY = "currentUser";
const APPOINTMENTS_KEY = "appointments";

export interface User {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface CurrentUser {
  fullName: string;
  email: string;
  phoneNumber: string;
}

export interface Appointment {
  id: string;
  userEmail: string;
  serviceName: string;
  date: string;
  time: string;
  type: "normal" | "emergency";
  location: string;
  createdAt: string;
}

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
   * Get all appointments
   * @returns Promise<Appointment[]>
   */
  getAppointments: async (): Promise<Appointment[]> => {
    try {
      const appointmentsJson = await AsyncStorage.getItem(APPOINTMENTS_KEY);
      if (!appointmentsJson) return [];
      return JSON.parse(appointmentsJson);
    } catch (error) {
      console.error("Error getting appointments:", error);
      return [];
    }
  },

  /**
   * Get appointments for a specific user
   * @param userEmail Email of the user
   * @returns Promise<Appointment[]>
   */
  getUserAppointments: async (userEmail: string): Promise<Appointment[]> => {
    try {
      const appointments = await authStorage.getAppointments();
      return appointments.filter((appt) => appt.userEmail === userEmail);
    } catch (error) {
      console.error("Error getting user appointments:", error);
      return [];
    }
  },

  /**
   * Save appointment to storage
   * @param appointment Appointment data to save
   * @returns Promise<void>
   */
  saveAppointment: async (
    appointment: Omit<Appointment, "id" | "createdAt">,
  ): Promise<void> => {
    try {
      const appointments = await authStorage.getAppointments();

      const newAppointment: Appointment = {
        ...appointment,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };

      appointments.push(newAppointment);
      await AsyncStorage.setItem(
        APPOINTMENTS_KEY,
        JSON.stringify(appointments),
      );
    } catch (error) {
      console.error("Error saving appointment:", error);
      throw error;
    }
  },

  /**
   * Delete appointment by ID
   * @param appointmentId ID of appointment to delete
   * @returns Promise<void>
   */
  deleteAppointment: async (appointmentId: string): Promise<void> => {
    try {
      const appointments = await authStorage.getAppointments();
      const filteredAppointments = appointments.filter(
        (appt) => appt.id !== appointmentId,
      );
      await AsyncStorage.setItem(
        APPOINTMENTS_KEY,
        JSON.stringify(filteredAppointments),
      );
    } catch (error) {
      console.error("Error deleting appointment:", error);
      throw error;
    }
  },
};
