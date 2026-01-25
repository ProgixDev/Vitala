import Constants from "expo-constants";

// Get API URL from environment variable or app config
// Priority: EXPO_PUBLIC_API_URL > app.json extra.apiUrl > localhost
const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_URL ||
  (Constants?.expoConfig?.extra as any)?.apiUrl ||
  "http://localhost:5000";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface FetchOptions {
  method?: HttpMethod;
  body?: any;
  token?: string;
  headers?: Record<string, string>;
}

async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { method = "GET", body, token, headers = {} } = options;

  // Build headers without setting Content-Type when sending FormData
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
    // Network-level error (DNS, CORS/cleartext, device network)
    const msg = fetchError?.message || "Network request failed";
    throw new Error(msg);
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      (json && (json.message || json.error)) || `HTTP ${res.status}`;
    throw new Error(message);
  }
  return json as T;
}

// Auth API
export async function login(email: string, password: string) {
  return apiFetch<{
    success: boolean;
    data: { user: any; token: string; refreshToken: string };
  }>("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export async function getMe(token: string) {
  return apiFetch<{ success: boolean; data: any }>("/api/auth/me", { token });
}

// Register patient
export async function registerPatient(payload: {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  medicalProfile?: any;
}) {
  return apiFetch<{
    success: boolean;
    data: {
      user: any;
      token: string;
      refreshToken: string;
      requiresEmailVerification: boolean;
    };
  }>("/api/auth/register/patient", { method: "POST", body: payload });
}

// Verify email
export async function verifyEmail(code: string) {
  return apiFetch<{ success: boolean; message: string }>(
    "/api/auth/verify-email",
    {
      method: "POST",
      body: { code },
    },
  );
}

// Resend email verification
export async function resendEmailVerification(email: string) {
  return apiFetch<{ success: boolean; message: string }>(
    "/api/auth/resend-verification",
    {
      method: "POST",
      body: { email },
    },
  );
}

// Forgot password
export async function forgotPassword(email: string) {
  return apiFetch<{ success: boolean; message: string; resetCode?: string }>(
    "/api/auth/forgot-password",
    {
      method: "POST",
      body: { email },
    },
  );
}

// Reset password with code
export async function resetPassword(
  email: string,
  code: string,
  newPassword: string,
) {
  return apiFetch<{ success: boolean; message: string }>(
    "/api/auth/reset-password",
    {
      method: "POST",
      body: { email, code, newPassword },
    },
  );
}

// Verify reset code
export async function verifyResetCode(email: string, code: string) {
  return apiFetch<{ success: boolean; message: string }>(
    "/api/auth/verify-reset-code",
    {
      method: "POST",
      body: { email, code },
    },
  );
}

// Refresh token
export async function refresh(refreshToken: string) {
  return apiFetch<{
    success: boolean;
    data: { token: string; refreshToken: string };
  }>("/api/auth/refresh-token", { method: "POST", body: { refreshToken } });
}

// Logout
export async function logout(token: string) {
  return apiFetch<{ success: boolean; message: string }>("/api/auth/logout", {
    method: "POST",
    token,
  });
}

// Get user profile
export async function getProfile(token: string) {
  return apiFetch<{ success: boolean; data: any }>("/api/users/profile", {
    token,
  });
}

// Update user profile
export async function updateProfile(
  token: string,
  data: { fullName?: string; email?: string; phoneNumber?: string },
) {
  return apiFetch<{ success: boolean; message: string; data: any }>(
    "/api/users/profile",
    {
      method: "PUT",
      token,
      body: data,
    },
  );
}

// Update medical profile
export async function updateMedicalProfile(token: string, data: any) {
  return apiFetch<{ success: boolean; message: string; data: any }>(
    "/api/users/medical-profile",
    {
      method: "PUT",
      token,
      body: data,
    },
  );
}

// Change password
export async function changePassword(
  token: string,
  data: { currentPassword: string; newPassword: string },
) {
  return apiFetch<{ success: boolean; message: string }>(
    "/api/users/change-password",
    {
      method: "PUT",
      token,
      body: data,
    },
  );
}

// Get user by ID
export async function getUserById(token: string, userId: string) {
  return apiFetch<{ success: boolean; data: any }>(`/api/users/${userId}`, {
    token,
  });
}

// Upload profile picture
export async function uploadProfilePicture(token: string, formData: FormData) {
  return apiFetch<{ success: boolean; message: string; data: { url: string } }>(
    "/api/users/profile-picture",
    {
      method: "POST",
      token,
      body: formData,
    },
  );
}

// Location management
export async function getLocations(token: string) {
  return apiFetch<{ success: boolean; data: any[] }>("/api/users/locations", {
    token,
  });
}

export async function addLocation(
  token: string,
  data: {
    label: string;
    address: string;
    coordinates?: { latitude: number; longitude: number };
    isDefault?: boolean;
  },
) {
  return apiFetch<{ success: boolean; message: string; data: any[] }>(
    "/api/users/locations",
    {
      method: "POST",
      token,
      body: data,
    },
  );
}

export async function updateLocation(
  token: string,
  locationId: string,
  data: {
    label?: string;
    address?: string;
    coordinates?: { latitude: number; longitude: number };
    isDefault?: boolean;
  },
) {
  return apiFetch<{ success: boolean; message: string; data: any }>(
    `/api/users/locations/${locationId}`,
    {
      method: "PUT",
      token,
      body: data,
    },
  );
}

export async function deleteLocation(token: string, locationId: string) {
  return apiFetch<{ success: boolean; message: string }>(
    `/api/users/locations/${locationId}`,
    {
      method: "DELETE",
      token,
    },
  );
}

// Settings
export async function getSettings(token: string) {
  return apiFetch<{ success: boolean; data: any }>("/api/users/settings", {
    token,
  });
}

export async function updateSettings(token: string, data: any) {
  return apiFetch<{ success: boolean; message: string; data: any }>(
    "/api/users/settings",
    {
      method: "PUT",
      token,
      body: data,
    },
  );
}

// Geocoding
export async function geocodeAddress(address: string) {
  return apiFetch<{
    success: boolean;
    data: {
      coordinates: { latitude: number; longitude: number };
      formattedAddress: string;
    };
  }>(`/api/geocoding/geocode?address=${encodeURIComponent(address)}`);
}

export async function reverseGeocode(latitude: number, longitude: number) {
  return apiFetch<{
    success: boolean;
    data: {
      address: string;
      coordinates: { latitude: number; longitude: number };
    };
  }>(`/api/geocoding/reverse?lat=${latitude}&lng=${longitude}`);
}

// Appointments
export async function createAppointment(
  token: string,
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
  return apiFetch<{ success: boolean; data: any }>(`/api/appointments`, {
    method: "POST",
    token,
    body: data,
  });
}

export async function getAppointments(
  token: string,
  filters?: { status?: string; type?: string },
) {
  const queryParams = filters ? `?${new URLSearchParams(filters)}` : "";
  return apiFetch<ApiResponse<ApiAppointment[]>>(
    `/api/appointments${queryParams}`,
    { token },
  );
}

export async function getAppointmentById(token: string, appointmentId: string) {
  return apiFetch<ApiResponse<ApiAppointment>>(
    `/api/appointments/${appointmentId}`,
    { token },
  );
}

export async function updateAppointmentStatus(
  token: string,
  appointmentId: string,
  status: string,
) {
  return apiFetch<{ success: boolean; data: any }>(
    `/api/appointments/${appointmentId}/status`,
    {
      method: "PUT",
      token,
      body: { status },
    },
  );
}

export async function cancelAppointment(
  token: string,
  appointmentId: string,
  reason?: string,
) {
  return apiFetch<{ success: boolean; message: string; data: any }>(
    `/api/appointments/${appointmentId}/cancel`,
    {
      method: "PUT",
      token,
      body: { reason },
    },
  );
}

export async function acceptAppointment(token: string, appointmentId: string) {
  return apiFetch<{ success: boolean; data: any }>(
    `/api/appointments/${appointmentId}/accept`,
    {
      method: "PUT",
      token,
    },
  );
}

export async function declineAppointment(
  token: string,
  appointmentId: string,
  reason?: string,
) {
  return apiFetch<{ success: boolean; message: string }>(
    `/api/appointments/${appointmentId}/decline`,
    {
      method: "PUT",
      token,
      body: { reason },
    },
  );
}

export async function assignNurse(
  token: string,
  appointmentId: string,
  nurseId: string,
) {
  return apiFetch<{ success: boolean; data: any }>(
    `/api/appointments/${appointmentId}/assign-nurse`,
    {
      method: "PUT",
      token,
      body: { nurseId },
    },
  );
}

export async function deleteAppointment(token: string, appointmentId: string) {
  return apiFetch<{ success: boolean; message: string }>(
    `/api/appointments/${appointmentId}`,
    {
      method: "DELETE",
      token,
    },
  );
}

export async function getAvailableTimeSlots(
  token: string,
  date: string,
  serviceId?: string,
  duration?: number,
) {
  const params = new URLSearchParams({ date });
  if (serviceId) params.append("serviceId", serviceId);
  if (duration) params.append("duration", duration.toString());

  return apiFetch<{
    success: boolean;
    data: { time: string; available: boolean }[];
  }>(`/api/appointments/available-slots?${params}`, { token });
}

export async function checkNurseAvailability(
  token: string,
  nurseId: string,
  date: string,
  startTime: string,
  duration?: number,
) {
  const params = new URLSearchParams({ nurseId, date, startTime });
  if (duration) params.append("duration", duration.toString());

  return apiFetch<{ success: boolean; available: boolean; reason?: string }>(
    `/api/appointments/check-availability?${params}`,
    { token },
  );
}

export async function getUnassignedAppointments(token: string) {
  return apiFetch<{ success: boolean; count: number; data: any[] }>(
    `/api/appointments/unassigned`,
    { token },
  );
}

export async function assignSelfAppointment(
  token: string,
  appointmentId: string,
) {
  return apiFetch<{ success: boolean; data: any }>(
    `/api/appointments/${appointmentId}/assign-self`,
    {
      method: "PUT",
      token,
    },
  );
}

// Transactions
export async function getTransactions(
  token: string,
  filters?: { status?: string; type?: string; limit?: string },
) {
  const queryParams = filters ? `?${new URLSearchParams(filters as any)}` : "";
  return apiFetch<ApiResponse<ApiTransaction[]>>(
    `/api/payments/transactions${queryParams}`,
    { token },
  );
}

export async function getTransactionById(token: string, transactionId: string) {
  return apiFetch<{ success: boolean; data: any }>(
    `/api/payments/transactions/${transactionId}`,
    { token },
  );
}

export async function getUserStatistics(token: string) {
  return apiFetch<{
    success: boolean;
    data: {
      totalSpent: number;
      totalRefunds: number;
      netSpent: number;
      totalTransactions: number;
      completedCount: number;
      pendingCount: number;
      failedCount: number;
      currency: string;
    };
  }>(`/api/payments/statistics`, { token });
}

// Notifications
export async function getNotifications(
  token: string,
  filters?: { read?: boolean; type?: string },
) {
  const queryParams = filters ? `?${new URLSearchParams(filters as any)}` : "";
  return apiFetch<{ success: boolean; count: number; data: any[] }>(
    `/api/notifications${queryParams}`,
    { token },
  );
}

export async function markNotificationAsRead(
  token: string,
  notificationId: string,
) {
  return apiFetch<{ success: boolean; message: string }>(
    `/api/notifications/${notificationId}/read`,
    {
      method: "PUT",
      token,
    },
  );
}

export async function markAllNotificationsAsRead(token: string) {
  return apiFetch<{ success: boolean; message: string }>(
    `/api/notifications/read-all`,
    {
      method: "PUT",
      token,
    },
  );
}

export async function deleteNotification(
  token: string,
  notificationId: string,
) {
  return apiFetch<{ success: boolean; message: string }>(
    `/api/notifications/${notificationId}`,
    {
      method: "DELETE",
      token,
    },
  );
}

export async function clearAllNotifications(token: string) {
  return apiFetch<{ success: boolean; message: string }>(
    `/api/notifications/clear-all`,
    {
      method: "DELETE",
      token,
    },
  );
}

// Update notification preferences
export async function updateNotificationPreferences(
  token: string,
  preferences: { push?: boolean; email?: boolean },
) {
  return apiFetch<{ success: boolean; data: any; message: string }>(
    `/api/notifications/preferences`,
    {
      method: "PUT",
      token,
      body: preferences,
    },
  );
}

// Update push token
export async function updatePushToken(token: string, expoPushToken: string) {
  return apiFetch<{ success: boolean; message: string }>(
    `/api/notifications/push-token`,
    {
      method: "PUT",
      token,
      body: { expoPushToken },
    },
  );
}

// Get notification delivery status
export async function getNotificationDeliveryStatus(
  token: string,
  notificationId: string,
) {
  return apiFetch<{ success: boolean; data: any }>(
    `/api/notifications/${notificationId}/delivery-status`,
    { token },
  );
}

// Register nurse with file uploads
export async function registerNurse(form: FormData) {
  const url = `${API_BASE_URL}/api/auth/register/nurse`;

  try {
    const res = await fetch(url, {
      method: "POST",
      body: form,
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message =
        (json && (json.message || json.error)) || `HTTP ${res.status}`;
      throw new Error(message);
    }

    return json;
  } catch (error) {
    throw error;
  }
}

// Process payment
export async function processPayment(
  token: string,
  data: { appointmentId: string; paymentMethod: string; amount: number },
) {
  return apiFetch<{ success: boolean; message: string; payment: any }>(
    "/api/payments/process",
    {
      method: "POST",
      token,
      body: data,
    },
  );
}

// Get payment by appointment
export async function getPaymentByAppointment(
  token: string,
  appointmentId: string,
) {
  return apiFetch<{ success: boolean; data: any }>(
    `/api/payments/appointment/${appointmentId}`,
    {
      token,
    },
  );
}

export const api = {
  fetch: apiFetch,
  login,
  getMe,
  registerPatient,
  resendEmailVerification,
  forgotPassword,
  resetPassword,
  refresh,
  logout,
  getProfile,
  updateProfile,
  updateMedicalProfile,
  changePassword,
  getUserById,
  uploadProfilePicture,
  registerNurse,
  getLocations,
  addLocation,
  updateLocation,
  deleteLocation,
  getSettings,
  updateSettings,
  geocodeAddress,
  reverseGeocode,
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
  acceptAppointment,
  declineAppointment,
  assignNurse,
  assignSelfAppointment,
  deleteAppointment,
  getAvailableTimeSlots,
  checkNurseAvailability,
  getUnassignedAppointments,
  getTransactions,
  getTransactionById,
  getUserStatistics,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
  updateNotificationPreferences,
  updatePushToken,
  getNotificationDeliveryStatus,
  processPayment,
  getPaymentByAppointment,
  // Emergency services
  getEmergencyContacts: (token: string) =>
    apiFetch("/api/emergency-contacts", { token }),
  addEmergencyContact: (token: string, data: any) =>
    apiFetch("/api/emergency-contacts", { method: "POST", token, body: data }),
  updateEmergencyContact: (token: string, id: string, data: any) =>
    apiFetch(`/api/emergency-contacts/${id}`, {
      method: "PUT",
      token,
      body: data,
    }),
  deleteEmergencyContact: (token: string, id: string) =>
    apiFetch(`/api/emergency-contacts/${id}`, { method: "DELETE", token }),
  createNurseAlert: (
    token: string,
    data: { description: string; location: any },
  ) =>
    apiFetch("/api/emergency/nurse-alert", {
      method: "POST",
      token,
      body: data,
    }),
  createAmbulanceRequest: (
    token: string,
    data: { description: string; location: any },
  ) =>
    apiFetch("/api/emergency/ambulance", { method: "POST", token, body: data }),
  sendFamilyAlert: (token: string, data: { message?: string }) =>
    apiFetch("/api/emergency/family-alert", {
      method: "POST",
      token,
      body: data,
    }),
  getEmergencyStatus: (token: string, appointmentId: string) =>
    apiFetch(`/api/emergency/status/${appointmentId}`, { token }),
  baseUrl: API_BASE_URL,
};
