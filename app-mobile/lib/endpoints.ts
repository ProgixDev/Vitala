import { api } from '@/utils/api';
import type {
  AppNotification,
  Appointment,
  AppointmentStatus,
  AvailabilitySlot,
  EmergencyContact,
  EmergencyRequest,
  EmergencyType,
  GeoPoint,
  Me,
  Payment,
  Review,
  SavedLocation,
  Service,
} from '@/types';

/** Thin typed wrappers over every server-nest REST route the app uses. */
export const Endpoints = {
  // ---- profile ----
  me: () => api.get<Me>('/me'),
  updateMe: (dto: { full_name?: string; phone?: string; avatar_url?: string }) =>
    api.put<Me>('/me', dto),
  updateMedical: (dto: Record<string, unknown>) => api.put('/me/medical', dto),
  updateNurse: (dto: Record<string, unknown>) => api.put('/me/nurse', dto),
  updateSettings: (dto: Record<string, unknown>) => api.put('/me/settings', dto),

  // ---- nurse availability ----
  availability: () => api.get<AvailabilitySlot[]>('/me/availability'),
  updateAvailability: (slots: { weekday: number; start_time: string; end_time: string }[]) =>
    api.put<AvailabilitySlot[]>('/me/availability', { slots }),

  // ---- locations ----
  listLocations: () => api.get<SavedLocation[]>('/me/locations'),
  addLocation: (dto: Partial<SavedLocation>) => api.post<SavedLocation>('/me/locations', dto),
  updateLocation: (id: string, dto: Partial<SavedLocation>) =>
    api.put<SavedLocation>(`/me/locations/${id}`, dto),
  deleteLocation: (id: string) => api.del(`/me/locations/${id}`),

  // ---- nurses (public directory) ----
  nurses: () =>
    api.get<
      {
        id: string;
        full_name: string;
        avatar_url?: string | null;
        nurseProfile?: {
          specializations?: string[];
          rating?: number;
          total_reviews?: number;
          experience_years?: number | null;
        } | null;
      }[]
    >('/nurses', { public: true }),

  // ---- services (public) ----
  services: () => api.get<Service[]>('/services', { public: true }),
  service: (id: string) => api.get<Service>(`/services/${id}`, { public: true }),

  // ---- appointments ----
  appointments: (status?: AppointmentStatus) =>
    api.get<Appointment[]>(`/appointments${status ? `?status=${status}` : ''}`),
  unassignedAppointments: () => api.get<Appointment[]>('/appointments/unassigned'),
  appointment: (id: string) => api.get<Appointment>(`/appointments/${id}`),
  createAppointment: (dto: Record<string, unknown>) =>
    api.post<Appointment>('/appointments', dto),
  /**
   * Tell the server the payment sheet is done so it can verify the hold with
   * Stripe and open the request to nurses. Safe to call more than once — the
   * server re-checks and only the first call through announces.
   */
  confirmPayment: (id: string) => api.post<Appointment>(`/appointments/${id}/confirm-payment`),
  assignSelf: (id: string) => api.put<Appointment>(`/appointments/${id}/assign-self`),
  /** Pass on an open job — hides it from this nurse, leaves it in the pool. */
  passJob: (id: string) => api.put<{ passed: boolean }>(`/appointments/${id}/pass`),
  updateAppointmentStatus: (
    id: string,
    dto: { status: AppointmentStatus; reason?: string; completion_notes?: string },
  ) => api.put<Appointment>(`/appointments/${id}/status`, dto),
  updateNurseLocation: (id: string, dto: { latitude: number; longitude: number }) =>
    api.put<Appointment>(`/appointments/${id}/location`, dto),

  // ---- emergency ----
  raiseEmergency: (dto: {
    type: EmergencyType;
    description: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  }) => api.post<EmergencyRequest>('/emergency', dto),
  myEmergencies: () => api.get<EmergencyRequest[]>('/emergency'),
  emergencyStatus: (id: string) => api.get<EmergencyRequest>(`/emergency/status/${id}`),

  // ---- emergency contacts ----
  contacts: () => api.get<EmergencyContact[]>('/emergency/contacts'),
  addContact: (dto: Partial<EmergencyContact>) =>
    api.post<EmergencyContact>('/emergency/contacts', dto),
  updateContact: (id: string, dto: Partial<EmergencyContact>) =>
    api.put<EmergencyContact>(`/emergency/contacts/${id}`, dto),
  deleteContact: (id: string) => api.del(`/emergency/contacts/${id}`),

  // ---- notifications ----
  notifications: (unreadOnly = false) =>
    api.get<AppNotification[]>(`/notifications${unreadOnly ? '?unread=true' : ''}`),
  markAllRead: () => api.put('/notifications/read-all'),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  deleteNotification: (id: string) => api.del(`/notifications/${id}`),

  // ---- payments ----
  paymentConfig: () =>
    api.get<{ publishableKey: string | null; enabled: boolean }>('/payments/config', {
      public: true,
    }),
  createIntent: (appointmentId: string) =>
    api.post<{ clientSecret: string; amount: number; currency: string }>(
      '/payments/create-intent',
      { appointment_id: appointmentId },
    ),
  transactions: () => api.get<Payment[]>('/payments/transactions'),

  // ---- reviews ----
  nurseReviews: (nurseId: string) =>
    api.get<Review[]>(`/reviews/nurse/${nurseId}`, { public: true }),
  myReviews: () => api.get<Review[]>('/reviews/me'),
  createReview: (dto: Record<string, unknown>) => api.post<Review>('/reviews', dto),
  respondReview: (id: string, nurse_response: string) =>
    api.put<Review>(`/reviews/${id}/respond`, { nurse_response }),

  // ---- storage ----
  signUpload: (bucket: 'avatars' | 'nurse-docs' | 'receipts', filename: string) =>
    api.post<{ signedUrl: string; path: string; token?: string }>('/storage/sign-upload', {
      bucket,
      filename,
    }),
};

export type { GeoPoint };
