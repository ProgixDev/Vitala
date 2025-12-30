const APPOINTMENTS_KEY = "appointments";

export const appointmentStorage = {
  /**
   * Get all appointments
   * @returns Promise<Appointment[]>
   */
  getAppointments: async (): Promise<Appointment[]> => {
    // Removed AsyncStorage - appointments are in MongoDB
    return [];
  },

  /**
   * Get appointments for a specific user
   * @param userEmail Email of the user
   * @returns Promise<Appointment[]>
   */
  getUserAppointments: async (userEmail: string): Promise<Appointment[]> => {
    // Removed AsyncStorage - use API to fetch user appointments
    return [];
  },

  /**
   * Save appointment to storage
   * @param appointment Appointment data to save
   * @returns Promise<void>
   */
  saveAppointment: async (
    appointment: Omit<Appointment, "id" | "createdAt" | "payment">
  ): Promise<void> => {
    // Removed AsyncStorage - use API to save appointment
    throw new Error("Use API to save appointments");
  },

  /**
   * Update appointment payment
   * @param appointmentId ID of appointment to update
   * @param payment Payment data to update
   * @returns Promise<void>
   */
  updateAppointmentPayment: async (
    appointmentId: string,
    payment: Payment
  ): Promise<void> => {
    // TODO: Implement API call to update appointment payment
    throw new Error("Use API to update appointment payment");
  },

  /**
   * Delete appointment by ID
   * @param appointmentId ID of appointment to delete
   * @returns Promise<void>
   */
  deleteAppointment: async (appointmentId: string): Promise<void> => {
    // Removed AsyncStorage - use API to delete appointment
    throw new Error("Use API to delete appointments");
  },

  /**
   * Save all appointments to storage
   * @param appointments Array of appointments to save
   * @returns Promise<void>
   */
  saveAppointments: async (appointments: Appointment[]): Promise<void> => {
    // Removed AsyncStorage - use API to save appointments
    throw new Error("Use API to save appointments");
  },

  /**
   * Clear all appointments from storage
   * @returns Promise<void>
   */
  clearAppointments: async (): Promise<void> => {
    // Removed AsyncStorage - no-op
  },
};
