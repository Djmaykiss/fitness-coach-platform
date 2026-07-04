import { getSupabaseClient } from "@/lib/supabase";
import { clearOrgCache } from "@/repositories/supabase/org-context";
import { pendingEvaluationRepository } from "@/repositories";
import type { AuthResult } from "@/services/auth.service";
import type { AuthUser, Credentials, Role, RegisterInput } from "@/types";

/**
 * Autenticación real con Supabase Auth (Bloque 1 de APP_MIGRATION_PLAN.md). Solo se
 * usa cuando el flag resuelve `supabase` para `auth`; con `local` sigue el mock.
 * Mantiene el MISMO contrato que `authService` (AuthResult / AuthUser), por lo que
 * `useAuth()` no cambia su API. Bloque 4: `register` cierra `register→clients` vía la
 * RPC `register_client` (membership client + fila `clients` + evaluación pendiente).
 */

function str(r: Record<string, unknown>, k: string): string {
  const v = r[k];
  return typeof v === "string" ? v : "";
}

/** Rol de app a partir del rol de membership (owner/admin/coach -> admin; client -> client). */
function appRole(membershipRole: string | undefined): Role {
  return membershipRole === "client" ? "client" : "admin";
}

async function buildAuthUser(userId: string, email: string): Promise<AuthUser> {
  const sb = getSupabaseClient();
  const [profileRes, membershipRes] = await Promise.all([
    sb.from("profiles").select("first_name,last_name").eq("id", userId).maybeSingle(),
    sb
      .from("memberships")
      .select("role")
      .eq("profile_id", userId)
      .eq("status", "active")
      .limit(1)
      .maybeSingle(),
  ]);
  const profile = (profileRes.data ?? {}) as Record<string, unknown>;
  const membership = (membershipRes.data ?? {}) as Record<string, unknown>;
  return {
    id: userId,
    email,
    firstName: str(profile, "first_name"),
    lastName: str(profile, "last_name"),
    role: appRole(str(membership, "role") || undefined),
  };
}

export const supabaseAuthService = {
  /** Usuario de la sesión actual (para rehidratar al montar). */
  async getSessionUser(): Promise<AuthUser | null> {
    const sb = getSupabaseClient();
    const { data } = await sb.auth.getSession();
    const sUser = data.session?.user;
    if (!sUser) return null;
    return buildAuthUser(sUser.id, sUser.email ?? "");
  },

  async login({ email, password }: Credentials): Promise<AuthResult> {
    const sb = getSupabaseClient();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      return { ok: false, error: "Correo o contraseña incorrectos." };
    }
    clearOrgCache();
    return { ok: true, user: await buildAuthUser(data.user.id, data.user.email ?? email) };
  },

  async register(input: RegisterInput): Promise<AuthResult> {
    const sb = getSupabaseClient();
    const { data, error } = await sb.auth.signUp({
      email: input.email,
      password: input.password,
      options: { data: { first_name: input.firstName, last_name: input.lastName } },
    });
    if (error) return { ok: false, error: error.message };
    if (!data.user) return { ok: false, error: "No se pudo crear la cuenta." };
    clearOrgCache();
    // Cierre register→clients (Bloque 4): con sesión activa, la RPC crea la
    // membership(client) + fila `clients` y adjunta la evaluación pendiente.
    if (data.session) {
      const pending = await pendingEvaluationRepository.get();
      const fullName = `${input.firstName} ${input.lastName}`.trim();
      const { error: rpcError } = await sb.rpc("register_client", {
        p_name: fullName,
        p_evaluation: pending?.evaluation ?? null,
      });
      if (!rpcError && pending) await pendingEvaluationRepository.clear();
      return { ok: true, user: await buildAuthUser(data.user.id, data.user.email ?? input.email) };
    }
    // Sin sesión (confirmación de email activada): datos mínimos.
    return {
      ok: true,
      user: {
        id: data.user.id,
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        role: "client",
      },
    };
  },

  async logout(): Promise<void> {
    const sb = getSupabaseClient();
    await sb.auth.signOut();
    clearOrgCache();
  },

  /** Suscribe a cambios de sesión; devuelve el desuscriptor. */
  onAuthChange(cb: (user: AuthUser | null) => void): () => void {
    const sb = getSupabaseClient();
    const { data } = sb.auth.onAuthStateChange(async (_event, session) => {
      clearOrgCache();
      cb(session?.user ? await buildAuthUser(session.user.id, session.user.email ?? "") : null);
    });
    return () => data.subscription.unsubscribe();
  },
};
