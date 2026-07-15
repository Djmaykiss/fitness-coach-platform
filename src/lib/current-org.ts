import { backendFor } from "@/repositories/backend";

/**
 * Resuelve el `organization_id` activo para construir rutas de Storage (`{org}/…`) y
 * subir por el Media Manager. En supabase lo pide al resolver de org; en local devuelve
 * un sentinel ("local") — allí la ruta no se usa para RLS. Import dinámico del cliente
 * Supabase para no cargarlo en modo local.
 */
export async function currentOrgId(): Promise<string> {
  if (backendFor("media") === "supabase") {
    const { getCurrentOrgId } = await import("@/repositories/supabase/org-context");
    return (await getCurrentOrgId()) ?? "local";
  }
  return "local";
}
