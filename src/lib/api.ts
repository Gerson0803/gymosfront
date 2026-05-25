import { clearAuthCookie } from "./auth-cookie";

// Centralized API layer for members management
const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL environment variable is not set");
}

/** Auth token stored in localStorage so it persists across page reloads. */
let authToken: string | null = null;

// Initialize authToken from localStorage on module load
if (typeof window !== "undefined") {
  const stored = localStorage.getItem("authToken");
  if (stored) {
    authToken = stored;
  }
}

export function setAuthToken(token: string) {
  authToken = token;
  if (typeof window !== "undefined") {
    localStorage.setItem("authToken", token);
    window.dispatchEvent(new Event("auth:changed"));
  }
}

export function getAuthToken(): string | null {
  if (authToken) return authToken;
  
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("authToken");
    if (stored) {
      authToken = stored;
      return authToken;
    }
  }
  
  return null;
}

export function clearAuthToken() {
  authToken = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken");
    clearAuthCookie();
    window.dispatchEvent(new Event("auth:changed"));
  }
}

/** Removes any legacy persisted auth from older builds (not used for login). */
export function purgeLegacyAuthStorage() {
  if (typeof window !== "undefined") {
    clearAuthCookie();
  }
}

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
  /** Evita redirigir a /login en 401 (p. ej. contraseña actual incorrecta). */
  skipAuthRedirect?: boolean;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { skipAuthRedirect, headers: customHeaders, ...fetchOptions } = options;
  const url = `${API_URL}${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...customHeaders,
  };

  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  console.log(`[API] ${fetchOptions.method || "GET"} ${url}`);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as {
        message?: string;
        error?: { message?: string };
      };
      console.error(`[API Error] ${response.status}:`, errorData);
      let errorMessage =
        errorData.message ||
        errorData.error?.message ||
        `API error: ${response.status} ${response.statusText}`;

      if (
        response.status === 404 &&
        endpoint.includes("change-password")
      ) {
        errorMessage =
          "El servidor no tiene activo el endpoint de cambio de contraseña. Reinicia el backend (backend-gymos) con npm run start:dev.";
      }

      if (
        response.status === 401 &&
        !skipAuthRedirect &&
        typeof window !== "undefined"
      ) {
        clearAuthToken();
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log(`[API Response] Success`, data);
    return data;
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error);
    throw error;
  }
}

// Members API endpoints
export async function getMembers() {
  return apiRequest("/members");
}

export async function getMemberById(id: string) {
  return apiRequest(`/members/${id}`);
}

export async function createMember(data: Record<string, unknown>) {
  return apiRequest("/members", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateMember(id: string, data: Record<string, unknown>) {
  return apiRequest(`/members/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteMember(id: string) {
  return apiRequest(`/members/${id}`, {
    method: "DELETE",
  });
}

// Extra endpoints
export async function checkinMember(id: string) {
  return apiRequest(`/members/${id}/checkin`, {
    method: "POST",
  });
}

export async function exportMembersCSV() {
  const url = `${API_URL}/members/export/csv`;
  const token = getAuthToken();

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  console.log(`[API] GET ${url}`);

  const response = await fetch(url, { headers });

  if (!response.ok) {
    console.error(`[API Error] ${response.status}:`, response.statusText);
    throw new Error(`Failed to export CSV: ${response.statusText}`);
  }

  return response.blob();
}

export async function GET<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: "GET" });
}

export async function POST<T>(
  endpoint: string,
  data: Record<string, unknown>
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function PATCH<T>(
  endpoint: string,
  data: Record<string, unknown>
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function DELETE<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: "DELETE" });
}

// AUTH endpoints
export async function login(email: string, password: string) {
  try {
    const response = await apiRequest<{
      success: boolean;
      data: { token: string; user: { id: string; email: string; name: string; role: string } };
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data.token) {
      setAuthToken(response.data.token);
      if (typeof window !== "undefined") {
        localStorage.setItem("userData", JSON.stringify(response.data.user));
      }
      return response.data;
    }

    throw new Error(response.data?.token ? "No token received" : "Login failed");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Login failed";
    throw new Error(errorMessage);
  }
}

export async function signup(email: string, password: string, name: string) {
  try {
    const response = await apiRequest<{
      success: boolean;
      data: { token: string; user: { id: string; email: string; name: string; role: string } };
    }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });

    if (response.success && response.data.token) {
      setAuthToken(response.data.token);
      if (typeof window !== "undefined") {
        localStorage.setItem("userData", JSON.stringify(response.data.user));
      }
      return response.data;
    }

    throw new Error(response.data?.token ? "No token received" : "Signup failed");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Signup failed";
    throw new Error(errorMessage);
  }
}

export function logout() {
  clearAuthToken();
  if (typeof window !== "undefined") {
    localStorage.removeItem("userData");
    window.location.href = "/login";
  }
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const response = await apiRequest<{
    success: boolean;
    message?: string;
  }>("/auth/change-password", {
    method: "PATCH",
    body: JSON.stringify({ currentPassword, newPassword }),
    skipAuthRedirect: true,
  });

  if (!response.success) {
    throw new Error(response.message || "No se pudo cambiar la contraseña");
  }

  return response;
}

// LEADS
export async function getLeads() {
  return apiRequest('/leads');
}
export async function createLead(data: Record<string, unknown>) {
  return apiRequest('/leads', { method: 'POST', body: JSON.stringify(data) });
}
export async function updateLeadApi(id: string, data: Record<string, unknown>) {
  return apiRequest(`/leads/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}
export async function deleteLeadApi(id: string) {
  return apiRequest(`/leads/${id}`, { method: 'DELETE' });
}
export async function moveLeadStage(id: string, status: string) {
  return apiRequest(`/leads/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
}

// EQUIPMENT
export async function getEquipment() {
  return apiRequest('/equipment');
}
export async function createEquipment(data: Record<string, unknown>) {
  return apiRequest('/equipment', { method: 'POST', body: JSON.stringify(data) });
}
export async function updateEquipmentApi(id: string, data: Record<string, unknown>) {
  return apiRequest(`/equipment/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}
export async function deleteEquipment(id: string) {
  return apiRequest(`/equipment/${id}`, { method: 'DELETE' });
}
