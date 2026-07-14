declare global {
  // API Response wrapper type
  type ApiResponse<T> = {
    success: boolean;
    data?: T;
    count?: number;
    message?: string;
    error?: string;
  };

  // Transaction data from API responses
  type ApiTransaction = {
    id: string;
    type: "payment" | "refund";
    service: string;
    amount: number;
    currency: string;
    date: string;
    status:
      | "pending"
      | "processing"
      | "completed"
      | "failed"
      | "cancelled"
      | "refunded";
    paymentMethod: string;
    receiptNumber: string;
    appointmentId?: string;
  };

  // Populated user data from API (limited fields for security)
  type PopulatedUser = {
    _id: string;
    fullName: string;
    email: string;
    userType: "patient" | "nurse";
    medicalProfile?: MedicalProfile;
  };

  // Extended patient details for appointment display
  type PatientDetails = PopulatedUser & {
    gender?: string;
    age?: number;
    medicalProfile?: MedicalProfile;
  };

  // Payment data from API responses
  type PopulatedPayment = {
    status: "pending" | "processing" | "completed" | "failed" | "cancelled";
    amount: number;
    currency: string;
    method?: string;
    reference?: string;
    transactionDate?: string;
  };

  // Full Payment object from database (populated)
  type ApiPayment = {
    _id: string;
    appointment: string;
    user: string;
    amount: number;
    currency: string;
    paymentMethod?: string;
    status:
      | "pending"
      | "processing"
      | "completed"
      | "failed"
      | "cancelled"
      | "refunded";
    stripePaymentIntentId?: string;
    stripeChargeId?: string;
    paypalOrderId?: string;
    receiptUrl?: string;
    receiptNumber: string;
    refundAmount?: number;
    refundReason?: string;
    refundedAt?: string;
    savedPaymentMethod?: {
      last4: string;
      brand: string;
      expiryMonth: number;
      expiryYear: number;
      isDefault: boolean;
    };
    metadata?: Record<string, string>;
    createdAt: string;
    updatedAt: string;
  };

  // Appointment data from API responses
  type ApiAppointment = {
    _id: string;
    patient: PopulatedUser;
    nurse?: PopulatedUser;
    service: string;
    appointmentType: "normal" | "emergency";
    status:
      | "pending"
      | "confirmed"
      | "on-the-way"
      | "in-progress"
      | "completed"
      | "cancelled"
      | "declined";
    scheduledDate: string;
    scheduledTime: {
      start: string;
      end?: string;
    };
    location: {
      address: string;
      coordinates?: {
        latitude: number;
        longitude: number;
      };
      label?: string;
    };
    symptoms?: string;
    notes?: string;
    price: number;
    duration: number;
    payment?: PopulatedPayment;
    createdAt: string;
    updatedAt: string;
  };

  type Payment = {
    id: string;
    status: "pending" | "processing" | "completed" | "failed" | "cancelled";
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
  };

  type Appointment = {
    id: string;
    userEmail: string;
    nurseEmail?: string;
    serviceName: string;
    date: string;
    time: string;
    duration: string;
    type: "normal" | "emergency";
    location: UserLocation;
    status:
      | "pending"
      | "confirmed"
      | "on-the-way"
      | "in-progress"
      | "completed"
      | "cancelled";
    createdAt: string;
    payment: Payment;
  };

  type MedicalProfile = {
    gender: "male" | "female" | "other" | null;
    dateOfBirth: string | null;
    bloodType: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | null;
    chronicIllnesses: string[];
    allergies: string[];
    height: number | null; // in cm
    weight: number | null; // in kg
  };

  type User = {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
    userType: "patient" | "nurse";
    medicalProfile?: MedicalProfile;
    locations?: UserLocation[];
    status?: "active" | "pending" | "verified" | "rejected"; // verification status for nurses
    isEmailVerified?: boolean;
    verification?: {
      idFrontUri?: string;
      idBackUri?: string;
      selfieUri?: string;
    };
  };

  type UserLocation = {
    coordinates: {
      latitude: number;
      longitude: number;
    };
    address: string;
    label: string;
    isDefault?: boolean;
  };

  type CurrentUser = Omit<User, "password"> & {
    token?: string;
    profilePicture?: string;
  };
}

export {};
