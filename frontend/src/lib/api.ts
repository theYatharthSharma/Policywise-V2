const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const TOKEN_KEY = "policywise.token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

type RequestOptions = Omit<RequestInit, "body"> & {
  auth?: boolean; // attach Authorization header
  form?: boolean; // send body as x-www-form-urlencoded instead of JSON
  body?: BodyInit | Record<string, unknown> | null;
};

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth, form, headers, body, ...rest } = options;
  const finalHeaders: Record<string, string> = { ...(headers as Record<string, string>) };

  if (auth) {
    const token = getToken();
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  let finalBody: BodyInit | undefined;
  if (body && !form && typeof body !== "string") {
    finalHeaders["Content-Type"] = "application/json";
    finalBody = JSON.stringify(body);
  } else if (form) {
    finalHeaders["Content-Type"] = "application/x-www-form-urlencoded";
    finalBody = body as BodyInit;
  } else if (typeof body === "string") {
    finalBody = body;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...rest, headers: finalHeaders, body: finalBody });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const errJson = await res.json();
      detail = errJson.detail || detail;
    } catch {
      /* ignore parse errors */
    }
    throw new Error(detail);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
