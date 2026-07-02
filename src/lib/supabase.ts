import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase para el navegador (anon key + sesión del usuario). Es LAZY: no se
 * crea ni lanza error al importar el módulo; solo al pedirlo con `getSupabaseClient()`.
 * Por eso, mientras `NEXT_PUBLIC_DATA_BACKEND` sea `local`, la app funciona sin
 * credenciales de Supabase (nadie llama a esta función todavía).
 *
 * Bloque 0 de APP_MIGRATION_PLAN.md: solo prepara la infraestructura; ningún
 * repositorio lo usa aún.
 */
let client: SupabaseClient | null = null;

/** True si hay URL + anon key configuradas (para no intentar Supabase sin credenciales). */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/** Devuelve el cliente Supabase (singleton). Lanza si faltan credenciales. */
export function getSupabaseClient(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase no está configurado. Define NEXT_PUBLIC_SUPABASE_URL y " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY, o usa NEXT_PUBLIC_DATA_BACKEND=local.",
    );
  }

  client = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return client;
}
