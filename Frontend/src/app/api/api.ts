const API_BASE_URL = import.meta.env.VITE_USE_API_PROXY === "true"
  ? ""
  : (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$|^\s+|\s+$/g, "");

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}
 // 
export function getUserIdFromToken(): number | null {
  const token = localStorage.getItem("forsa_token");
  if (!token) return null;

  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    const nameId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || decoded.nameid || decoded.sub;
    return nameId ? parseInt(nameId, 10) : null;
  } catch (e) {
    console.error("Failed to decode token", e);
    return null;
  }
}

async function readResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text || null;
}

function getErrorMessage(status: number, data: unknown) {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (typeof data === "object" && data !== null && "message" in data) {
    const message = (data as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return `Request failed: ${status}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem("forsa_token");
  const headers = new Headers(init?.headers);
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });
  
  const data = await readResponseBody(response);

  if (!response.ok) {
    if (response.status === 401 && !path.toLowerCase().includes("/api/auth/login")) {
      localStorage.removeItem("forsa_token");
      localStorage.removeItem("forsa_refresh_token");
      window.location.href = "/login";
    }
    throw new ApiError(response.status, getErrorMessage(response.status, data), data);
  }

  return data as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  return request<T>(path);
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

export async function apiDelete<T>(path: string): Promise<T> {
  return request<T>(path, {
    method: "DELETE",
  });
}
