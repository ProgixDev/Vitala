// Domain types mirroring the server-nest / Supabase schema.

export type Role = 'patient' | 'nurse' | 'admin';
export type UserStatus = 'active' | 'pending' | 'suspended' | 'rejected';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export type ServiceCategory =
  | 'general-care'
  | 'wound-care'
  | 'elderly-care'
  | 'post-surgery'
  | 'medication-administration'
  | 'vital-monitoring'
  | 'emergency'
  | 'other';

export type AppointmentType = 'normal' | 'emergency';

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'on-the-way'
  | 'in-progress'
  | 'completed'
  | 'cancelled'
  | 'declined';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export type EmergencyType = 'nurse-alert' | 'ambulance' | 'family-alert';
export type EmergencyStatus =
  | 'pending'
  | 'dispatched'
  | 'en-route'
  | 'on-scene'
  | 'completed'
  | 'cancelled';

export type ContactRelationship =
  | 'spouse'
  | 'parent'
  | 'child'
  | 'sibling'
  | 'friend'
  | 'guardian'
  | 'other';

export type NotificationType =
  | 'appointment'
  | 'payment'
  | 'message'
  | 'emergency'
  | 'system'
  | 'promotion'
  | 'verification';

export interface SavedLocation {
  id: string;
  label?: string | null;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  is_default: boolean;
}

export interface UserSettings {
  notify_push: boolean;
  notify_email: boolean;
  notify_sms: boolean;
  share_location: boolean;
  language: string;
  dark_mode: boolean;
  biometric_auth: boolean;
  expo_push_token?: string | null;
}

export interface MedicalProfile {
  gender?: 'male' | 'female' | 'other' | null;
  date_of_birth?: string | null;
  blood_type?: string | null;
  allergies: string[];
  chronic_illnesses: string[];
  height_cm?: number | null;
  weight_kg?: number | null;
}

export interface NurseProfile {
  license_number?: string | null;
  specializations: string[];
  experience_years?: number | null;
  id_doc_front_url?: string | null;
  id_doc_back_url?: string | null;
  selfie_url?: string | null;
  verification_status: VerificationStatus;
  rejection_reason?: string | null;
  rating: number;
  total_reviews: number;
}

export interface Me {
  id: string;
  role: Role;
  status: UserStatus;
  full_name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  settings?: UserSettings | null;
  locations: SavedLocation[];
  medicalProfile?: MedicalProfile | null;
  nurseProfile?: NurseProfile | null;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  price: number;
  duration_min: number;
  is_available: boolean;
  icon?: string | null;
  image_url?: string | null;
  requirements: string[];
}

export interface PersonRef {
  full_name: string;
  avatar_url?: string | null;
}

export interface Appointment {
  id: string;
  patient_id: string;
  nurse_id?: string | null;
  service_id?: string | null;
  appointment_type: AppointmentType;
  status: AppointmentStatus;
  scheduled_date: string; // YYYY-MM-DD
  scheduled_start: string; // HH:mm
  scheduled_end?: string | null;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  location_label?: string | null;
  symptoms?: string | null;
  notes?: string | null;
  price: number;
  duration_min: number;
  nurse_lat?: number | null;
  nurse_lng?: number | null;
  nurse_loc_at?: string | null;
  completion_notes?: string | null;
  cancellation_reason?: string | null;
  created_at: string;
  // joined relations (present depending on the endpoint)
  service?: Partial<Service> | null;
  nurse?: PersonRef | null;
  patient?: PersonRef | null;
  payment?: Payment | null;
}

export interface Payment {
  id: string;
  appointment_id: string;
  user_id?: string;
  amount: number;
  currency: string;
  method?: string | null;
  status: PaymentStatus;
  receipt_url?: string | null;
  receipt_number?: string | null;
  created_at: string;
  appointment?: { service?: { name?: string } | null } | null;
}

export interface EmergencyRequest {
  id: string;
  patient_id: string;
  type: EmergencyType;
  appointment_id?: string | null;
  description: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  status: EmergencyStatus;
  assigned_personnel: string[];
  eta?: string | null;
  created_at: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: ContactRelationship;
  phone: string;
  email?: string | null;
  is_primary: boolean;
  address?: string | null;
  notes?: string | null;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_read: boolean;
  related_appointment?: string | null;
  action_url?: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  nurse_response?: string | null;
  created_at: string;
  patient?: PersonRef | null;
}

/** A resolved coordinate + address from the map picker / GPS. */
export interface GeoPoint {
  latitude: number;
  longitude: number;
  address: string;
  label?: string;
}
