/**
 * Mapeadores puros para los repositorios Supabase — Bloque 0 de APP_MIGRATION_PLAN.md.
 *
 * Convierten entre el dominio de la app (camelCase, ids string opacos) y las filas de
 * Postgres (snake_case). Son utilidades genéricas y sin dependencias; el ensamblado
 * anidado (programas→días→ejercicios, etc.) lo hace cada repo con estos helpers.
 *
 * No se usan todavía (ningún repo migrado en el Bloque 0).
 */

/** `businessName` -> `business_name`. */
export function toSnake(key: string): string {
  return key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

/** `business_name` -> `businessName`. */
export function toCamel(key: string): string {
  return key.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

type AnyRecord = Record<string, unknown>;

/** Convierte las claves de un objeto plano a snake_case (para INSERT/UPDATE). */
export function keysToSnake<T extends AnyRecord>(obj: T): AnyRecord {
  const out: AnyRecord = {};
  for (const [k, v] of Object.entries(obj)) out[toSnake(k)] = v;
  return out;
}

/** Convierte las claves de una fila a camelCase (para exponer al dominio). */
export function keysToCamel<T extends AnyRecord>(row: T): AnyRecord {
  const out: AnyRecord = {};
  for (const [k, v] of Object.entries(row)) out[toCamel(k)] = v;
  return out;
}

/** Omite claves de un objeto (p. ej. quitar `id`/campos derivados antes de insertar). */
export function omit<T extends AnyRecord>(obj: T, keys: string[]): AnyRecord {
  const drop = new Set(keys);
  const out: AnyRecord = {};
  for (const [k, v] of Object.entries(obj)) if (!drop.has(k)) out[k] = v;
  return out;
}

/** Solo las claves definidas (para PATCH parciales sin pisar con undefined). */
export function definedOnly<T extends AnyRecord>(obj: T): AnyRecord {
  const out: AnyRecord = {};
  for (const [k, v] of Object.entries(obj)) if (v !== undefined) out[k] = v;
  return out;
}
