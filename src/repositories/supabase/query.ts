import type { PostgrestError } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase";
import { backendFor } from "@/repositories/backend";

/**
 * Utilidades de respuesta para los repositorios Supabase — Bloque 0.
 *
 * Traducen las respuestas de PostgREST al contrato de las interfaces (never throw
 * fuera de contrato; `null`/`[]` donde se espera). No se usan todavía.
 */

/** Cliente Supabase (atajo). */
export const db = getSupabaseClient;

/** Código PostgREST para "0 filas" en `.single()`. */
const NO_ROWS = "PGRST116";

type Res<T> = { data: T; error: PostgrestError | null };
type MaybeRes<T> = { data: T | null; error: PostgrestError | null };

/** Devuelve `data` o lanza con el mensaje del error. */
export function unwrap<T>(res: Res<T>): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

/** Devuelve `data` o `null` (incluye el caso "no encontrado" de `.single()`). */
export function unwrapMaybe<T>(res: MaybeRes<T>): T | null {
  if (res.error) {
    if (res.error.code === NO_ROWS) return null;
    throw new Error(res.error.message);
  }
  return res.data ?? null;
}

/** Devuelve la lista o `[]` si `data` es null. */
export function unwrapList<T>(res: MaybeRes<T[]>): T[] {
  if (res.error) throw new Error(res.error.message);
  return res.data ?? [];
}

/** Lanza si hubo error (para operaciones sin retorno de datos). */
export function assertOk(res: { error: PostgrestError | null }): void {
  if (res.error) throw new Error(res.error.message);
}

/** Helper de conveniencia: ¿este repo debe usar Supabase? (para wiring/tests). */
export function usesSupabase(repoKey: string): boolean {
  return backendFor(repoKey) === "supabase";
}
