/**
 * Selector del backend de datos (feature flag) — Bloque 0 de APP_MIGRATION_PLAN.md.
 *
 * - `NEXT_PUBLIC_DATA_BACKEND=local|supabase` (global; default `local`).
 * - `NEXT_PUBLIC_SUPABASE_REPOS=exerciseLibrary,discover,…` (override por-repo, útil en
 *   desarrollo para migrar/probar repos de a uno sin cambiar el backend global).
 *
 * `pickRepository()` devuelve la implementación de Supabase SOLO si el backend
 * resuelto para ese repo es `supabase` Y se provee una factoría. Mientras no exista
 * factoría Supabase (Bloque 0), SIEMPRE devuelve la implementación `Local` → sin
 * cambio de comportamiento; todo sigue en localStorage.
 *
 * Rollback: volver `local` (global) o quitar el repo de `NEXT_PUBLIC_SUPABASE_REPOS`.
 */
export type DataBackend = "local" | "supabase";

/** Backend global (default `local`). */
export function getDataBackend(): DataBackend {
  return process.env.NEXT_PUBLIC_DATA_BACKEND === "supabase"
    ? "supabase"
    : "local";
}

/** Conjunto de repos con override a Supabase (lista separada por comas). */
function supabaseRepoOverrides(): Set<string> {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_REPOS ?? "";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

/** Backend efectivo para un repositorio concreto (global u override por-repo). */
export function backendFor(repoKey: string): DataBackend {
  if (getDataBackend() === "supabase") return "supabase";
  return supabaseRepoOverrides().has(repoKey) ? "supabase" : "local";
}

/**
 * Elige la implementación de un repositorio según el flag. Devuelve la de Supabase
 * solo si corresponde y se pasa una factoría; si no, la `Local`. La factoría es lazy
 * (no se instancia Supabase salvo que se use ese backend).
 */
export function pickRepository<T>(
  repoKey: string,
  local: T,
  supabase?: () => T,
): T {
  if (supabase && backendFor(repoKey) === "supabase") {
    return supabase();
  }
  return local;
}
