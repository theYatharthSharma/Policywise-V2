import { apiFetch, setToken, clearToken } from "@/lib/api";
import type { User } from "@/types";

const USER_KEY = "lic.auth.user";

interface UserApiShape {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  nominee?: string | null;
  avatar_url?: string | null;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserApiShape;
}

function toUser(u: UserApiShape): User {
  return {
    id: u.id,
    fullName: u.full_name,
    email: u.email,
    phone: u.phone ?? undefined,
    address: u.address ?? undefined,
    nominee: u.nominee ?? undefined,
    avatarUrl: u.avatar_url ?? undefined,
  };
}

function persist(user: User) {
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export const authService = {
  current: (): User | null => {
    if (typeof window === "undefined") return null;
    try {
      const v = window.localStorage.getItem(USER_KEY);
      return v ? (JSON.parse(v) as User) : null;
    } catch {
      return null;
    }
  },

  login: async (email: string, password: string): Promise<User> => {
    const data = await apiFetch<TokenResponse>("/auth/login", {
      method: "POST",
      form: true,
      body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
    });
    setToken(data.access_token);
    const user = toUser(data.user);
    persist(user);
    return user;
  },

  register: async (fullName: string, email: string, password: string): Promise<User> => {
    const data = await apiFetch<TokenResponse>("/auth/register", {
      method: "POST",
      body: { full_name: fullName, email, password },
    });
    setToken(data.access_token);
    const user = toUser(data.user);
    persist(user);
    return user;
  },

  logout: async () => {
    clearToken();
    window.localStorage.removeItem(USER_KEY);
  },

  update: async (patch: Partial<User>): Promise<User> => {
    const body: Record<string, unknown> = {};
    if (patch.fullName !== undefined) body.full_name = patch.fullName;
    if (patch.phone !== undefined) body.phone = patch.phone;
    if (patch.address !== undefined) body.address = patch.address;
    if (patch.nominee !== undefined) body.nominee = patch.nominee;
    if (patch.avatarUrl !== undefined) body.avatar_url = patch.avatarUrl;

    const data = await apiFetch<UserApiShape>("/auth/me", {
      method: "PATCH",
      auth: true,
      body,
    });
    const user = toUser(data);
    persist(user);
    return user;
  },
};
