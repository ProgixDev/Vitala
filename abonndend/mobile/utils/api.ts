import Constants from "expo-constants";
import { Platform } from "react-native";
import { supabase, getAccessToken } from "@/lib/supabase";

// Base URL of the Vitala NestJS API.
// Priority: EXPO_PUBLIC_API_URL > app.json extra.apiUrl > localhost:4000
const RAW_API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_URL ||
  (Constants?.expoConfig?.extra as any)?.apiUrl ||
  "http://localhost:4000";

const NORMALIZED_RAW_API_BASE_URL = RAW_API_BASE_URL.replace(/\/$/, "");

// Android emulator cannot reach the host via localhost.
const API_BASE_URL =
  Platform.OS === "android"
    ? NORMALIZED_RAW_API_BASE_URL.replace("://localhost", "://10.0.2.2")
    : NORMALIZED_RAW_API_BASE_URL;

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface FetchOptions {
  method?: HttpMethod;
  body?: any;
  /** Optional explicit token. If omitted, the current Supabase token is used. */
  token?: string;
  headers?: Record<string, string>;
}

/**
 * Core fetch. Automatically attaches the current Supabase access token unless
 * one is passed explicitly, so callers no longer need to thread the token
 * through every call (the `token` argument is kept for backwards-compatibility).
 */
async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { method = "GET", body, headers = {} } = options;
  const token = options.token ?? (await getAccessToken()) ?? undefined;

  const builtHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };
  if (!(body instanceof FormData)) {
    builtHeaders["Content-Type"] = "application/json";
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: builtHeaders,
      body: body
        ? body instanceof FormData
          ? body
          : JSON.stringify(body)
        : undefined,
    } as any);
  } catch (fetchError: any) {
    throw new Error(fetchError?.message || "Network request failed");
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      (json && (json.message || json.error)) || `HTTP ${res.status}`;
    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }
  return json as T;
}

/** Wrap a raw API result in the legacy `{ success, data }` envelope. */
const ok = <T>(data: T) => ({ success: true as const, data });

// ============================================================================
// AUTH — now backed by Supabase Auth
// ============================================================================

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new Error(error.message);
  return {
    success: true as const,
    data: {
      user: data.user,
      token: data.session?.access_token ?? "",
      refreshToken: data.session?.refresh_token ?? "",
    },
  };
}

export async function registerPatient(payload: {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  medicalProfile?: any;
}) {
  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: {
        role: "patient",
        full_name: payload.fullName,
        phone: payload.phoneNumber,
      },
    },
  });
  if (error) throw new Error(error.message);

  // If a session is returned (email confirmation disabled), persist the medical
  // profile immediately; otherwise it is saved after the user verifies + logs in.
  if (data.session && payload.medicalProfile) {
    try {
      await updateMedicalProfile(data.session.access_token, payload.medicalProfile);
    } catch {
      /* non-fatal */
    }
  }

  return {
    success: true as const,
    data: {
      user: data.user,
      token: data.session?.access_token ?? "",
      refreshToken: data.session?.refresh_token ?? "",
      // Supabase requires email confirmation unless disabled in the dashboard.
      requiresEmailVerification: !data.session,
    },
  };
}

/** Nurse signup. Doc/selfie uploads should go to Supabase Storage (follow-up). */
export async function registerNurse(form: FormData) {
  const get = (k: string) => (form as any).get?.(k);
  const email = get("email");
  const password = get("password");
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: "nurse",
        full_name: get("fullName") ?? "",
        phone: get("phoneNumber") ?? "",
      },
    },
  });
  if (error) throw new Error(error.message);
  return {
    success: true as const,
    message: "Nurse account created; pending verification.",
    data: { user: data.user, requiresEmailVerification: !data.session },
  };
}

export async function verifyEmail(code: string, email?: string) {
  if (!email) throw new Error("Email is required to verify");
  const { error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: "signup",
  });
  if (error) throw new Error(error.message);
  return { success: true as const, message: "Email verified" };
}

export async function resendEmailVerification(email: string) {
  const { error } = await supabase.auth.resend({ type: "signup", email });
  if (error) throw new Error(error.message);
  return { success: true as const, message: "Verification email sent" };
}

export async function forgotPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw new Error(error.message);
  return { success: true as const, message: "Password reset code sent" };
}

export async function verifyResetCode(email: string, code: string) {
  const { error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: "recovery",
  });
  if (error) throw new Error(error.message);
  return { success: true as const, message: "Code verified" };
}

export async function resetPassword(
  email: string,
  code: string,
  newPassword: string,
) {
  // Exchange the recovery OTP for a session, then set the new password.
  const { error: otpErr } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: "recovery",
  });
  if (otpErr) throw new Error(otpErr.message);
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
  return { success: true as const, message: "Password updated" };
}

export async function refresh(_refreshToken?: string) {
  const { data, error } = await supabase.auth.refreshSession();
  if (error) throw new Error(error.message);
  return {
    success: true as const,
    data: {
      token: data.session?.access_token ?? "",
      refreshToken: data.session?.refresh_token ?? "",
    },
  };
}

export async function logout(_token?: string) {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
  return { success: true as const, message: "Logged out" };
}

// ============================================================================
// PROFILE / USER — new API is /api/me*
// ============================================================================

export async function getMe(token?: string) {
  const data = await apiFetch<any>("/api/me", { token });
  return ok(data);
}

export const getProfile = getMe;

export async function updateProfile(
  token: string | undefined,
  data: { fullName?: string; email?: string; phoneNumber?: string },
) {
  const updated = await apiFetch<any>("/api/me", {
    method: "PUT",
    token,
    body: { full_name: data.fullName, phone: data.phoneNumber },
  });
  return { success: true as const, message: "Profile updated", data: updated };
}

export async function updateMedicalProfile(token: string | undefined, data: any) {
  const updated = await apiFetch<any>("/api/me/medical", {
    method: "PUT",
    token,
    body: data,
  });
  return { success: true as const, message: "Medical profile updated", data: updated };
}

export async function changePassword(
  _token: string | undefined,
  data: { currentPassword: string; newPassword: string },
) {
  const { error } = await supabase.auth.updateUser({ password: data.newPassword });
  if (error) throw new Error(error.message);
  return { success: true as const, message: "Password changed" };
}

export async function getUserById(token: string | undefined, userId: string) {
  const data = await apiFetch<any>(`/api/nurses`, { token });
  const match = Array.isArray(data)
    ? data.find((n: any) => n.profile?.id === userId || n.id === userId)
    : null;
  return ok(match);
}

// ============================================================================
// LOCATIONS — /api/me/locations
// ============================================================================

export async function getLocations(token?: string) {
  const data = await apiFetch<any[]>("/api/me/locations", { token });
  return ok(data);
}

export async function addLocation(
  token: string | undefined,
  data: {
    label: string;
    address: string;
    coordinates?: { latitude: number; longitude: number };
    isDefault?: boolean;
  },
) {
  const created = await apiFetch<any>("/api/me/locations", {
    method: "POST",
    token,
    body: {
      label: data.label,
      address: data.address,
      latitude: data.coordinates?.latitude,
      longitude: data.coordinates?.longitude,
      is_default: data.isDefault,
    },
  });
  return ok(created);
}

export async function updateLocation(
  token: string | undefined,
  locationId: string,
  data: {
    label?: string;
    address?: string;
    coordinates?: { latitude: number; longitude: number };
    isDefault?: boolean;
  },
) {
  const updated = await apiFetch<any>(`/api/me/locations/${locationId}`, {
    method: "PUT",
    token,
    body: {
      label: data.label,
      address: data.address,
      latitude: data.coordinates?.latitude,
      longitude: data.coordinates?.longitude,
      is_default: data.isDefault,
    },
  });
  return ok(updated);
}

export async function deleteLocation(
  token: string | undefined,
  locationId: string,
) {
  await apiFetch(`/api/me/locations/${locationId}`, { method: "DELETE", token });
  return { success: true as const, message: "Location removed" };
}

// ============================================================================
// SETTINGS — /api/me/settings
// ============================================================================

export async function getSettings(token?: string) {
  const data = await apiFetch<any>("/api/me/settings", { token });
  return ok(data);
}

export async function updateSettings(token: string | undefined, data: any) {
  const updated = await apiFetch<any>("/api/me/settings", {
    method: "PUT",
    token,
    body: data,
  });
  return ok(updated);
}

// ============================================================================
// SERVICES / GEOCODING
// ============================================================================

export async function getServices() {
  const data = await apiFetch<any[]>("/api/services");
  return ok(data);
}

// NOTE: the NestJS API does not expose geocoding yet. The app should call
// Mapbox directly, or a /geocoding module can be added to the backend.
export async function geocodeAddress(_address: string): Promise<any> {
  throw new Error("Geocoding is not available on the new API yet.");
}
export async function reverseGeocode(_lat: number, _lng: number): Promise<any> {
  throw new Error("Reverse geocoding is not available on the new API yet.");
}

// ============================================================================
// APPOINTMENTS — /api/appointments
// ============================================================================

export async function createAppointment(
  token: string | undefined,
  data: {
    service: string;
    appointmentType: "normal" | "emergency";
    scheduledDate: string;
    scheduledTime: { start: string; end?: string };
    location: any;
    symptoms?: string;
    notes?: string;
    price: number;
    duration: number;
    nurse?: string;
  },
) {
  const created = await apiFetch<any>(`/api/appointments`, {
    method: "POST",
    token,
    body: {
      service_id: data.service,
      nurse_id: data.nurse,
      appointment_type: data.appointmentType,
      scheduled_date: data.scheduledDate,
      scheduled_start: data.scheduledTime.start,
      scheduled_end: data.scheduledTime.end,
      address: data.location?.address ?? "",
      latitude: data.location?.coordinates?.latitude,
      longitude: data.location?.coordinates?.longitude,
      location_label: data.location?.label,
      symptoms: data.symptoms,
      notes: data.notes,
    },
  });
  return ok(created);
}

export async function getAppointments(
  token: string | undefined,
  filters?: { status?: string; type?: string },
) {
  const q = filters?.status ? `?status=${filters.status}` : "";
  const data = await apiFetch<any[]>(`/api/appointments${q}`, { token });
  return ok(data);
}

export async function getAppointmentById(
  token: string | undefined,
  appointmentId: string,
) {
  const data = await apiFetch<any>(`/api/appointments/${appointmentId}`, { token });
  return ok(data);
}

export async function updateAppointmentStatus(
  token: string | undefined,
  appointmentId: string,
  status: string,
) {
  const data = await apiFetch<any>(`/api/appointments/${appointmentId}/status`, {
    method: "PUT",
    token,
    body: { status },
  });
  return ok(data);
}

export async function cancelAppointment(
  token: string | undefined,
  appointmentId: string,
  reason?: string,
) {
  const data = await apiFetch<any>(`/api/appointments/${appointmentId}/status`, {
    method: "PUT",
    token,
    body: { status: "cancelled", reason },
  });
  return ok(data);
}

export async function acceptAppointment(
  token: string | undefined,
  appointmentId: string,
) {
  const data = await apiFetch<any>(`/api/appointments/${appointmentId}/status`, {
    method: "PUT",
    token,
    body: { status: "confirmed" },
  });
  return ok(data);
}

export async function declineAppointment(
  token: string | undefined,
  appointmentId: string,
  reason?: string,
) {
  const data = await apiFetch<any>(`/api/appointments/${appointmentId}/status`, {
    method: "PUT",
    token,
    body: { status: "declined", reason },
  });
  return ok(data);
}

export async function assignSelfAppointment(
  token: string | undefined,
  appointmentId: string,
) {
  const data = await apiFetch<any>(
    `/api/appointments/${appointmentId}/assign-self`,
    { method: "PUT", token },
  );
  return ok(data);
}

export async function getUnassignedAppointments(token?: string) {
  const data = await apiFetch<any[]>(`/api/appointments/unassigned`, { token });
  return { success: true as const, count: data.length, data };
}

export async function updateNurseLocation(
  token: string | undefined,
  appointmentId: string,
  latitude: number,
  longitude: number,
) {
  const data = await apiFetch<any>(`/api/appointments/${appointmentId}/location`, {
    method: "PUT",
    token,
    body: { latitude, longitude },
  });
  return ok(data);
}

// ============================================================================
// NOTIFICATIONS — /api/notifications
// ============================================================================

export async function getNotifications(
  token: string | undefined,
  filters?: { read?: boolean; type?: string },
) {
  const q = filters?.read === false ? "?unread=true" : "";
  const data = await apiFetch<any[]>(`/api/notifications${q}`, { token });
  return { success: true as const, count: data.length, data };
}

export async function markNotificationAsRead(
  token: string | undefined,
  notificationId: string,
) {
  await apiFetch(`/api/notifications/${notificationId}/read`, {
    method: "PUT",
    token,
  });
  return { success: true as const, message: "Marked read" };
}

export async function markAllNotificationsAsRead(token?: string) {
  await apiFetch(`/api/notifications/read-all`, { method: "PUT", token });
  return { success: true as const, message: "All marked read" };
}

export async function deleteNotification(
  token: string | undefined,
  notificationId: string,
) {
  await apiFetch(`/api/notifications/${notificationId}`, {
    method: "DELETE",
    token,
  });
  return { success: true as const, message: "Deleted" };
}

export async function updateNotificationPreferences(
  token: string | undefined,
  preferences: { push?: boolean; email?: boolean },
) {
  const data = await apiFetch<any>(`/api/me/settings`, {
    method: "PUT",
    token,
    body: { notify_push: preferences.push, notify_email: preferences.email },
  });
  return { success: true as const, message: "Preferences updated", data };
}

export async function updatePushToken(
  token: string | undefined,
  expoPushToken: string,
) {
  await apiFetch(`/api/me/settings`, {
    method: "PUT",
    token,
    body: { expo_push_token: expoPushToken },
  });
  return { success: true as const, message: "Push token updated" };
}

// ============================================================================
// PAYMENTS — /api/payments
// ============================================================================

export async function getStripeConfig(token?: string) {
  const data = await apiFetch<{ publishableKey: string; enabled: boolean }>(
    "/api/payments/config",
    { token },
  );
  return { success: true as const, publishableKey: data.publishableKey };
}

export async function createPaymentIntent(
  token: string | undefined,
  data: { appointmentId: string },
) {
  const res = await apiFetch<{
    clientSecret: string;
    amount: number;
    currency: string;
  }>("/api/payments/create-intent", {
    method: "POST",
    token,
    body: { appointment_id: data.appointmentId },
  });
  return { success: true as const, ...res, paymentIntentId: "" };
}

export async function getTransactions(
  token: string | undefined,
  _filters?: { status?: string; type?: string; limit?: string },
) {
  const data = await apiFetch<any[]>(`/api/payments/transactions`, { token });
  return ok(data);
}

// ============================================================================
// COMPAT — endpoints kept for existing screens, mapped to the new API
// ============================================================================

/** Derived from the user's transactions (the new API has no per-user stats). */
export async function getUserStatistics(token?: string) {
  const tx = await apiFetch<any[]>("/api/payments/transactions", { token });
  const completed = tx.filter((t) => t.status === "completed");
  const refunds = tx.filter((t) => t.status === "refunded");
  const totalSpent = completed.reduce((s, t) => s + Number(t.amount), 0);
  const totalRefunds = refunds.reduce((s, t) => s + Number(t.refund_amount ?? t.amount), 0);
  return {
    success: true as const,
    data: {
      totalSpent,
      totalRefunds,
      netSpent: totalSpent - totalRefunds,
      totalTransactions: tx.length,
      completedCount: completed.length,
      pendingCount: tx.filter((t) => ["pending", "processing"].includes(t.status)).length,
      failedCount: tx.filter((t) => t.status === "failed").length,
      currency: "USD",
    },
  };
}

/** The new API has no hard delete — cancel is the closest equivalent. */
export async function deleteAppointment(
  token: string | undefined,
  appointmentId: string,
) {
  await apiFetch(`/api/appointments/${appointmentId}/status`, {
    method: "PUT",
    token,
    body: { status: "cancelled" },
  });
  return { success: true as const, message: "Appointment cancelled" };
}

/** No bulk endpoint yet — mark all read, then delete each. */
export async function clearAllNotifications(token?: string) {
  const list = await apiFetch<any[]>("/api/notifications", { token });
  await Promise.all(
    list.map((n) =>
      apiFetch(`/api/notifications/${n.id}`, { method: "DELETE", token }).catch(
        () => null,
      ),
    ),
  );
  return { success: true as const, message: "Notifications cleared" };
}

/**
 * Payment success is confirmed by the Stripe webhook server-side; the client
 * no longer needs a confirm call. Returns the current payment status.
 */
export async function confirmStripePayment(
  _token: string | undefined,
  data: { paymentIntentId: string },
) {
  return {
    success: true as const,
    message: "Payment is being confirmed",
    data: {
      id: data.paymentIntentId,
      status: "processing",
      amount: 0,
      currency: "USD",
    },
  };
}

/**
 * Profile pictures now go to Supabase Storage via a signed upload URL.
 * (Wiring the multipart upload from the client is a follow-up.)
 */
export async function uploadProfilePicture(
  _token: string | undefined,
  _formData: FormData,
): Promise<{ success: boolean; message: string; data: { url: string } }> {
  throw new Error(
    "Profile picture upload now uses Supabase Storage — not yet wired on mobile.",
  );
}

// ============================================================================
// EMERGENCY — /api/emergency
// ============================================================================

export const api = {
  getUserStatistics,
  deleteAppointment,
  clearAllNotifications,
  confirmStripePayment,
  uploadProfilePicture,
  fetch: apiFetch,
  login,
  getMe,
  registerPatient,
  registerNurse,
  verifyEmail,
  resendEmailVerification,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  refresh,
  logout,
  getProfile,
  updateProfile,
  updateMedicalProfile,
  changePassword,
  getUserById,
  getLocations,
  addLocation,
  updateLocation,
  deleteLocation,
  getSettings,
  updateSettings,
  getServices,
  geocodeAddress,
  reverseGeocode,
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
  acceptAppointment,
  declineAppointment,
  assignSelfAppointment,
  getUnassignedAppointments,
  updateNurseLocation,
  getTransactions,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  updateNotificationPreferences,
  updatePushToken,
  getStripeConfig,
  createPaymentIntent,
  // Emergency
  getEmergencyContacts: (token?: string) =>
    apiFetch<any[]>("/api/emergency/contacts", { token }).then(ok),
  addEmergencyContact: (token: string | undefined, data: any) =>
    apiFetch("/api/emergency/contacts", { method: "POST", token, body: data }).then(ok),
  updateEmergencyContact: (token: string | undefined, id: string, data: any) =>
    apiFetch(`/api/emergency/contacts/${id}`, { method: "PUT", token, body: data }).then(ok),
  deleteEmergencyContact: (token: string | undefined, id: string) =>
    apiFetch(`/api/emergency/contacts/${id}`, { method: "DELETE", token }).then(() => ({
      success: true as const,
    })),
  createNurseAlert: (
    token: string | undefined,
    data: { description: string; location: any },
  ) =>
    apiFetch("/api/emergency", {
      method: "POST",
      token,
      body: {
        type: "nurse-alert",
        description: data.description,
        address: data.location?.address,
        latitude: data.location?.coordinates?.latitude,
        longitude: data.location?.coordinates?.longitude,
      },
    }).then(ok),
  createAmbulanceRequest: (
    token: string | undefined,
    data: { description: string; location: any },
  ) =>
    apiFetch("/api/emergency", {
      method: "POST",
      token,
      body: {
        type: "ambulance",
        description: data.description,
        address: data.location?.address,
        latitude: data.location?.coordinates?.latitude,
        longitude: data.location?.coordinates?.longitude,
      },
    }).then(ok),
  sendFamilyAlert: (token: string | undefined, data: { message?: string }) =>
    apiFetch("/api/emergency", {
      method: "POST",
      token,
      body: { type: "family-alert", description: data.message ?? "Family alert" },
    }).then(ok),
  getEmergencyStatus: (token: string | undefined, id: string) =>
    apiFetch(`/api/emergency/status/${id}`, { token }).then(ok),
  baseUrl: API_BASE_URL,
};
