import AsyncStorage from "@react-native-async-storage/async-storage";

const APPOINTMENTS_KEY = "appointments";

export interface Payment {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  amount: number;
  currency: string;
  method: "credit_card" | "paypal" | null;
  reference: string;
  transactionDate: string | null;
  cardDetails?: {
    cardNumber: string;
    cardHolder: string;
    expiryDate: string;
  };
}

export interface Appointment {
  id: string;
  userEmail: string;
  serviceName: string;
  date: string;
  time: string;
  duration: string;
  type: "normal" | "emergency";
  location: string;
  locationLabel: string;
  status: "pending" | "confirmed" | "on-the-way" | "in-progress" | "completed";
  createdAt: string;
  payment: Payment;
}

export const appointmentStorage = {
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
      const appointments = await appointmentStorage.getAppointments();
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
    appointment: Omit<Appointment, "id" | "createdAt" | "payment">,
  ): Promise<void> => {
    try {
      const appointments = await appointmentStorage.getAppointments();

      const appointmentId = Date.now().toString();
      const paymentReference = `PAY${appointmentId}`;

      const newPayment: Payment = {
        id: `payment_${appointmentId}`,
        status: "pending",
        amount: 200, // Default amount, can be customized
        currency: "USD",
        method: null,
        reference: paymentReference,
        transactionDate: null,
      };

      const newAppointment: Appointment = {
        ...appointment,
        id: appointmentId,
        createdAt: new Date().toISOString(),
        payment: newPayment,
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
   * Update appointment payment
   * @param appointmentId ID of appointment to update
   * @param payment Payment data to update
   * @returns Promise<void>
   */
  updateAppointmentPayment: async (
    appointmentId: string,
    payment: Payment,
  ): Promise<void> => {
    try {
      const appointments = await appointmentStorage.getAppointments();
      const appointmentIndex = appointments.findIndex(
        (appt) => appt.id === appointmentId,
      );

      if (appointmentIndex === -1) {
        throw new Error("Appointment not found");
      }

      appointments[appointmentIndex].payment = payment;
      await AsyncStorage.setItem(
        APPOINTMENTS_KEY,
        JSON.stringify(appointments),
      );
    } catch (error) {
      console.error("Error updating appointment payment:", error);
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
      const appointments = await appointmentStorage.getAppointments();
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

  /**
   * Save all appointments to storage
   * @param appointments Array of appointments to save
   * @returns Promise<void>
   */
  saveAppointments: async (appointments: Appointment[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(
        APPOINTMENTS_KEY,
        JSON.stringify(appointments),
      );
    } catch (error) {
      console.error("Error saving appointments:", error);
      throw error;
    }
  },

  /**
   * Clear all appointments from storage
   * @returns Promise<void>
   */
  clearAppointments: async (): Promise<void> => {
    try {
      await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify([]));
    } catch (error) {
      console.error("Error clearing appointments:", error);
      throw error;
    }
  },
};
