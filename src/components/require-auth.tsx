"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { useAuth } from "@/context/auth-context";
import type { Role } from "@/types";

/**
 * Protege rutas usando la sesion mock. Si no hay usuario (o el rol no coincide)
 * redirige al login. No reemplaza seguridad real: es coherente con el login
 * simulado de esta etapa.
 */
export function RequireAuth({
  role,
  children,
}: {
  role?: Role;
  children: ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (role && user.role !== role) {
      router.replace(user.role === "admin" ? "/admin" : "/dashboard");
    }
  }, [user, isLoading, role, router]);

  if (isLoading || !user || (role && user.role !== role)) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#050706] text-sm font-bold uppercase tracking-[0.24em] text-[#65ff4f]">
        Cargando...
      </main>
    );
  }

  return <>{children}</>;
}
