"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { authService } from "@/services/auth.service";
import type { AuthResult } from "@/services/auth.service";
import type { AuthUser, Credentials, RegisterInput } from "@/types";

const STORAGE_KEY = "coach-fitness:auth-user";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: Credentials) => Promise<AuthResult>;
  register: (input: RegisterInput) => Promise<AuthResult>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Mantiene la "sesion" local simulada. No hay JWT ni cookies de servidor:
 * solo persistimos el usuario en localStorage para sobrevivir recargas.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehidrata la sesion al montar leyendo el "sistema externo" (localStorage).
  // Es una lectura unica de sincronizacion, no un patron derivado de estado.
  useEffect(() => {
    let restored: AuthUser | null = null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      restored = raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(restored);
    setIsLoading(false);
  }, []);

  const persist = useCallback((next: AuthUser | null) => {
    setUser(next);
    if (next) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const login = useCallback(
    async (credentials: Credentials) => {
      const result = await authService.login(credentials);
      if (result.ok) {
        persist(result.user);
      }
      return result;
    },
    [persist],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const result = await authService.register(input);
      if (result.ok) {
        persist(result.user);
      }
      return result;
    },
    [persist],
  );

  const logout = useCallback(() => {
    persist(null);
  }, [persist]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>.");
  }
  return context;
}
