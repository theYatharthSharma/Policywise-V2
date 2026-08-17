import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { authService } from "@/services/auth.service";
import type { User } from "@/types";

interface AuthCtx {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (fullName: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  update: (patch: Partial<User>) => Promise<User>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(authService.current());
    setReady(true);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const u = await authService.login(email, password); setUser(u); return u;
  }, []);
  const register = useCallback(async (fullName: string, email: string, password: string) => {
    const u = await authService.register(fullName, email, password); setUser(u); return u;
  }, []);
  const logout = useCallback(async () => { await authService.logout(); setUser(null); }, []);
  const update = useCallback(async (patch: Partial<User>) => {
    const u = await authService.update(patch); setUser(u); return u;
  }, []);

  return <Ctx.Provider value={{ user, ready, login, register, logout, update }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
