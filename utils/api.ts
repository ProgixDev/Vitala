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
export async function verifyEmail(token: string) {
  return apiFetch<{ success: boolean; message: string }>(
    "/api/auth/verify-email",
    {
      method: "POST",
      body: { token },
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
  forgotPassword,
  resetPassword,
  refresh,
  logout,
  getProfile,
  updateProfile,
  registerNurse,
  baseUrl: API_BASE_URL,
};
