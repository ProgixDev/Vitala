declare global {
  type Payment = {
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
    location: string;
    locationLabel: string;
    status:
      | "pending"
      | "confirmed"
      | "on-the-way"
      | "in-progress"
      | "completed";
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
  };

  type CurrentUser = Omit<User, "password">;
}

export {};
