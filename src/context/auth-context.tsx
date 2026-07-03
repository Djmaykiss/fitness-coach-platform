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
import { supabaseAuthService } from "@/services/supabase-auth.service";
import { backendFor } from "@/repositories/backend";
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

/** Con `local` (default) la sesion es la simulada de siempre; con `supabase` (flag
 *  `NEXT_PUBLIC_DATA_BACKEND=supabase` o `NEXT_PUBLIC_SUPABASE_REPOS` incluye "auth")
 *  usa Supabase Auth. Solo cambia el INTERIOR del provider; `useAuth()` no cambia. */
const USE_SUPABASE_AUTH = backendFor("auth") === "supabase";

/**
 * Mantiene la "sesion" del usuario. En modo local no hay JWT ni cookies de servidor:
 * solo persistimos el usuario en localStorage para sobrevivir recargas. En modo
 * supabase la sesion la gestiona Supabase Auth (el SDK persiste el token).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehidrata la sesion al montar. Modo supabase: sesion del SDK + suscripcion a
  // cambios. Modo local: lectura unica de localStorage (sistema externo).
  useEffect(() => {
    if (USE_SUPABASE_AUTH) {
      let active = true;
      supabaseAuthService.getSessionUser().then((sessionUser) => {
        if (!active) return;
        setUser(sessionUser);
        setIsLoading(false);
      });
      const unsubscribe = supabaseAuthService.onAuthChange((nextUser) => {
        if (active) setUser(nextUser);
      });
      return () => {
        active = false;
        unsubscribe();
      };
    }
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

  // Persistencia de la sesion local (no aplica en modo supabase: el SDK persiste).
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
      if (USE_SUPABASE_AUTH) {
        const result = await supabaseAuthService.login(credentials);
        if (result.ok) setUser(result.user);
        return result;
      }
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
      if (USE_SUPABASE_AUTH) {
        const result = await supabaseAuthService.register(input);
        if (result.ok) setUser(result.user);
        return result;
      }
      const result = await authService.register(input);
      if (result.ok) {
        persist(result.user);
      }
      return result;
    },
    [persist],
  );

  const logout = useCallback(() => {
    if (USE_SUPABASE_AUTH) {
      void supabaseAuthService.logout();
      setUser(null);
      return;
    }
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
