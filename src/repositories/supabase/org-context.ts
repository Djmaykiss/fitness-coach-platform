import { getSupabaseClient } from "@/lib/supabase";

/**
 * Resolver de la organización actual (Bloque 1 de APP_MIGRATION_PLAN.md).
 *
 * Los `Supabase*Repository` usan `getCurrentOrgId()` para fijar `organization_id`
 * en los INSERT/UPDATE y para scopear lecturas cuando hace falta (las políticas RLS
 * ya restringen por org, pero necesitamos el id concreto de la org "activa").
 *
 * Se resuelve por: `profiles.default_organization_id` del usuario de la sesión y,
 * como respaldo, su primera membership `active`. Se cachea en memoria hasta que la
 * sesión cambie (`clearOrgCache()` lo llama el servicio de auth en login/logout).
 */

// `undefined` = aún no resuelto; `null` = resuelto sin org (anónimo / sin membership).
let cachedOrgId: string | null | undefined;

export async function getCurrentOrgId(): Promise<string | null> {
  if (cachedOrgId !== undefined) return cachedOrgId;

  const sb = getSupabaseClient();
  const { data: sessionData } = await sb.auth.getSession();
  const uid = sessionData.session?.user?.id;
  if (!uid) {
    cachedOrgId = null;
    return null;
  }

  const { data: profile } = await sb
    .from("profiles")
    .select("default_organization_id")
    .eq("id", uid)
    .maybeSingle();
  let orgId = (profile?.default_organization_id as string | null | undefined) ?? null;

  if (!orgId) {
    const { data: membership } = await sb
      .from("memberships")
      .select("organization_id")
      .eq("profile_id", uid)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();
    orgId = (membership?.organization_id as string | null | undefined) ?? null;
  }

  cachedOrgId = orgId;
  return orgId;
}

/** Invalida la caché de org (llamar al cambiar de sesión). */
export function clearOrgCache(): void {
  cachedOrgId = undefined;
}
