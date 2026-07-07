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

    // Confirmar que hay una SESIÓN ACTIVA antes de crear el cliente. Sin sesión
    // (p. ej. "Confirm email" activado), la RPC correría sin `auth.uid()` y no
    // persistiría membership/cliente -> NO se declara la cuenta como creada.
    const { data: sessionData } = await sb.auth.getSession();
    if (!sessionData.session) {
      await sb.auth.signOut().catch(() => {});
      return {
        ok: false,
        error:
          "Tu cuenta se creó pero falta confirmar el correo antes de continuar. Revisa tu email o pide al coach que desactive la confirmación de correo.",
      };
    }

    // Cierre register→clients: crea membership(client) + fila `clients` + adjunta la
    // evaluación pendiente. Si la RPC FALLA, se reporta el error REAL (no se traga),
    // NO se dice "cuenta creada" y se cierra la sesión huérfana.
    const pending = await pendingEvaluationRepository.get();
    const fullName = `${input.firstName} ${input.lastName}`.trim();
    const { error: rpcError } = await sb.rpc("register_client", {
      p_name: fullName,
      p_evaluation: pending?.evaluation ?? null,
    });
    if (rpcError) {
      await sb.auth.signOut().catch(() => {});
      clearOrgCache();
      return {
        ok: false,
        error: `No se pudo completar tu registro como alumno: ${rpcError.message}`,
      };
    }
    if (pending) await pendingEvaluationRepository.clear();
    return {
      ok: true,
      user: await buildAuthUser(data.user.id, data.user.email ?? input.email),
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
    const { data } = sb.auth.onAuthStateChange((_event, session) => {
      clearOrgCache();
      // IMPORTANTE: NO usar `await` de llamadas a Supabase DENTRO del callback de
      // onAuthStateChange: el SDK retiene un lock de auth mientras el callback corre y
      // esas consultas esperan el mismo lock -> deadlock (la app se queda "cargando" en
      // un full-page load con sesion). Diferimos el trabajo async fuera del callback.
      const sUser = session?.user;
      if (!sUser) {
        cb(null);
        return;
      }
      setTimeout(() => {
        buildAuthUser(sUser.id, sUser.email ?? "")
          .then(cb)
          .catch(() => cb(null));
      }, 0);
    });
    return () => data.subscription.unsubscribe();
  },
};
