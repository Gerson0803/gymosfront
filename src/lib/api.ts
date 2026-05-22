// Centralized API layer for members management
const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL environment variable is not set");
}

let authToken: string | null = null;

export function setAuthToken(token: string) {
  authToken = token;
  if (typeof window !== "undefined") {
    localStorage.setItem("authToken", token);
  }
}

export function getAuthToken(): string | null {
  // Try to get from memory first, then from localStorage
  if (authToken) return authToken;

  if (typeof window !== "undefined") {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      authToken = storedToken;
      return storedToken;
    }
  }

  return null;
}

export function clearAuthToken() {
  authToken = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken");
  }
}

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  console.log(`[API] ${options.method || "GET"} ${url}`);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[API Error] ${response.status}:`, errorData);
      throw new Error(
        errorData.message || `API error: ${response.status} ${response.statusText}`
      );
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
    window.location.href = "/login";
  }
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

// USER SETTINGS
// Los ajustes de usuario (nombre personalizado, preferencias) se guardan localmente en el navegador (localStorage)
// No se requieren endpoints en el backend para esta funcionalidad
