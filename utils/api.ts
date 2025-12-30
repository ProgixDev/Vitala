import Constants from "expo-constants";

const API_BASE_URL: string =
  (Constants?.expoConfig?.extra as any)?.apiUrl || "http://localhost:5000";

console.log("API_BASE_URL:", API_BASE_URL); // Debug log

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface FetchOptions {
  method?: HttpMethod;
  body?: any;
  token?: string;
  headers?: Record<string, string>;
}

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { method = "GET", body, token, headers = {} } = options;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": body instanceof FormData ? undefined as any : "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body
      ? body instanceof FormData
        ? body
        : JSON.stringify(body)
      : undefined,
  } as any);

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (json && (json.message || json.error)) || `HTTP ${res.status}`;
    throw new Error(message);
  }
  return json as T;
}

// Auth API
export async function login(email: string, password: string) {
  return apiFetch<{ success: boolean; data: { user: any; token: string; refreshToken: string } }>(
    "/api/auth/login",
    {
      method: "POST",
      body: { email, password },
    },
  );
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
    }
  );
}

// Resend email verification
export async function resendEmailVerification(email: string) {
  return apiFetch<{ success: boolean; message: string }>(
    "/api/auth/resend-verification",
    {
      method: "POST",
      body: { email },
    }
  );
}

// Forgot password
export async function forgotPassword(email: string) {
  return apiFetch<{ success: boolean; message: string }>("/api/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
}

// Reset password
export async function resetPassword(tokenParam: string, newPassword: string) {
  return apiFetch<{ success: boolean; message: string }>(
    `/api/auth/reset-password/${encodeURIComponent(tokenParam)}`,
    { method: "POST", body: { password: newPassword } },
  );
}

// Refresh token
export async function refresh(refreshToken: string) {
  return apiFetch<{ success: boolean; data: { token: string; refreshToken: string } }>(
    "/api/auth/refresh-token",
    { method: "POST", body: { refreshToken } },
  );
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
  return apiFetch<{ success: boolean; data: any }>("/api/users/profile", { token });
}

// Update user profile
export async function updateProfile(token: string, data: { fullName?: string; phoneNumber?: string; email?: string }) {
  return apiFetch<{ success: boolean; message: string; data: any }>("/api/users/profile", {
    method: "PUT",
    token,
    body: data,
  });
}

// Location management
export async function getLocations(token: string) {
  return apiFetch<{ success: boolean; data: any[] }>("/api/users/locations", { token });
}

export async function addLocation(token: string, data: { label: string; address: string; coordinates?: { latitude: number; longitude: number }; isDefault?: boolean }) {
  return apiFetch<{ success: boolean; message: string; data: any[] }>("/api/users/locations", {
    method: "POST",
    token,
    body: data,
  });
}

export async function updateLocation(token: string, locationId: string, data: { label?: string; address?: string; coordinates?: { latitude: number; longitude: number }; isDefault?: boolean }) {
  return apiFetch<{ success: boolean; message: string; data: any }>(`/api/users/locations/${locationId}`, {
    method: "PUT",
    token,
    body: data,
  });
}

export async function deleteLocation(token: string, locationId: string) {
  return apiFetch<{ success: boolean; message: string }>(`/api/users/locations/${locationId}`, {
    method: "DELETE",
    token,
  });
}

// Geocoding
export async function geocodeAddress(address: string) {
  return apiFetch<{ success: boolean; data: { coordinates: { latitude: number; longitude: number }; formattedAddress: string } }>(`/api/geocoding/geocode?address=${encodeURIComponent(address)}`);
}

export async function reverseGeocode(latitude: number, longitude: number) {
  return apiFetch<{ success: boolean; data: { address: string; coordinates: { latitude: number; longitude: number } } }>(`/api/geocoding/reverse?lat=${latitude}&lng=${longitude}`);
}

// Appointments
export async function createAppointment(token: string, data: {
  service: string;
  appointmentType: 'normal' | 'emergency';
  scheduledDate: string;
  scheduledTime: { start: string; end?: string };
  location: any;
  symptoms?: string;
  notes?: string;
  price: number;
  duration: number;
  nurse?: string;
}) {
  return apiFetch<{ success: boolean; data: any }>(`/api/appointments`, {
    method: "POST",
    token,
    body: data,
  });
}

export async function getAppointments(token: string, filters?: { status?: string; type?: string }) {
  const queryParams = filters ? `?${new URLSearchParams(filters)}` : '';
  return apiFetch<{ success: boolean; count: number; data: any[] }>(`/api/appointments${queryParams}`, { token });
}

export async function getAppointmentById(token: string, appointmentId: string) {
  return apiFetch<{ success: boolean; data: any }>(`/api/appointments/${appointmentId}`, { token });
}

export async function updateAppointmentStatus(token: string, appointmentId: string, status: string) {
  return apiFetch<{ success: boolean; data: any }>(`/api/appointments/${appointmentId}/status`, {
    method: "PUT",
    token,
    body: { status },
  });
}

export async function cancelAppointment(token: string, appointmentId: string, reason?: string) {
  return apiFetch<{ success: boolean; message: string; data: any }>(`/api/appointments/${appointmentId}/cancel`, {
    method: "PUT",
    token,
    body: { reason },
  });
}

export async function acceptAppointment(token: string, appointmentId: string) {
  return apiFetch<{ success: boolean; data: any }>(`/api/appointments/${appointmentId}/accept`, {
    method: "PUT",
    token,
  });
}

export async function declineAppointment(token: string, appointmentId: string, reason?: string) {
  return apiFetch<{ success: boolean; message: string }>(`/api/appointments/${appointmentId}/decline`, {
    method: "PUT",
    token,
    body: { reason },
  });
}

export async function assignNurse(token: string, appointmentId: string, nurseId: string) {
  return apiFetch<{ success: boolean; data: any }>(`/api/appointments/${appointmentId}/assign-nurse`, {
    method: "PUT",
    token,
    body: { nurseId },
  });
}

export async function deleteAppointment(token: string, appointmentId: string) {
  return apiFetch<{ success: boolean; message: string }>(`/api/appointments/${appointmentId}`, {
    method: "DELETE",
    token,
  });
}

export async function getAvailableTimeSlots(token: string, date: string, serviceId?: string, duration?: number) {
  const params = new URLSearchParams({ date });
  if (serviceId) params.append('serviceId', serviceId);
  if (duration) params.append('duration', duration.toString());
  
  return apiFetch<{ success: boolean; data: { time: string; available: boolean }[] }>(`/api/appointments/available-slots?${params}`, { token });
}

export async function checkNurseAvailability(token: string, nurseId: string, date: string, startTime: string, duration?: number) {
  const params = new URLSearchParams({ nurseId, date, startTime });
  if (duration) params.append('duration', duration.toString());
  
  return apiFetch<{ success: boolean; available: boolean; reason?: string }>(`/api/appointments/check-availability?${params}`, { token });
}

// Register nurse with file uploads
export async function registerNurse(form: FormData) {
  const url = `${API_BASE_URL}/api/auth/register/nurse`;
  console.log("Making nurse registration request to:", url);
  
  try {
    const res = await fetch(url, {
      method: "POST",
      body: form,
    });

    console.log("Nurse registration response status:", res.status);

    const json = await res.json().catch(() => ({}));
    
    if (!res.ok) {
      const message = (json && (json.message || json.error)) || `HTTP ${res.status}`;
      console.error("Nurse registration error response:", json);
      throw new Error(message);
    }
    
    console.log("Nurse registration success:", json);
    return json;
  } catch (error) {
    console.error("Nurse registration API error:", error);
    throw error;
  }
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
  registerNurse,
  getLocations,
  addLocation,
  updateLocation,
  deleteLocation,
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
  deleteAppointment,
  getAvailableTimeSlots,
  checkNurseAvailability,
  baseUrl: API_BASE_URL,
};
