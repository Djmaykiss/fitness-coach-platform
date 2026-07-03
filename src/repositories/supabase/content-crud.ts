import { getSupabaseClient } from "@/lib/supabase";
import { getCurrentOrgId } from "@/repositories/supabase/org-context";
import { unwrap, unwrapList } from "@/repositories/supabase/query";
import { definedOnly, keysToSnake } from "@/repositories/supabase/mappers";

/**
 * Fábrica de "entidad de contenido publicable" para los repos Supabase del catálogo
 * (Descubre / Onboarding, Bloque 2). Encapsula el CRUD + publicar/despublicar scoped
 * por organización, replicando el comportamiento de los `Local*`:
 *  - `list()` devuelve lo NO borrado, más nuevo primero (los Local hacen `unshift`).
 *  - `create()` inserta con `published: true` (paridad con los Local).
 *  - `remove()` es SOFT DELETE (`deleted_at`); el item desaparece de las listas.
 */

export type Row = Record<string, unknown>;

export const str = (r: Row, k: string, d = ""): string =>
  typeof r[k] === "string" ? (r[k] as string) : d;
export const bool = (r: Row, k: string, d = false): boolean =>
  typeof r[k] === "boolean" ? (r[k] as boolean) : d;
export const strArr = (r: Row, k: string): string[] =>
  Array.isArray(r[k]) ? (r[k] as unknown[]).map((x) => String(x)) : [];

async function requireOrg(): Promise<string> {
  const orgId = await getCurrentOrgId();
  if (!orgId) throw new Error("No hay una organización activa.");
  return orgId;
}

export function publishableEntity<TDomain extends { id: string }, TCreate>(
  table: string,
  toDomain: (row: Row) => TDomain,
) {
  const sb = () => getSupabaseClient();
  const SELECT = "*";

  return {
    async list(): Promise<TDomain[]> {
      const rows = unwrapList(
        await sb()
          .from(table)
          .select(SELECT)
          .is("deleted_at", null)
          .order("created_at", { ascending: false }),
      );
      return (rows as Row[]).map(toDomain);
    },

    async create(input: TCreate): Promise<TDomain> {
      const organization_id = await requireOrg();
      const row = {
        ...keysToSnake(definedOnly(input as Row)),
        organization_id,
        published: true,
      };
      const data = unwrap(await sb().from(table).insert(row).select(SELECT).single());
      return toDomain(data as Row);
    },

    async update(id: string, patch: Partial<TCreate>): Promise<TDomain | null> {
      const row = keysToSnake(definedOnly(patch as Row));
      if (Object.keys(row).length === 0) {
        const { data } = await sb()
          .from(table)
          .select(SELECT)
          .eq("id", id)
          .is("deleted_at", null)
          .maybeSingle();
        return data ? toDomain(data as Row) : null;
      }
      const { data, error } = await sb()
        .from(table)
        .update(row)
        .eq("id", id)
        .is("deleted_at", null)
        .select(SELECT)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data ? toDomain(data as Row) : null;
    },

    async remove(id: string): Promise<boolean> {
      const { data, error } = await sb()
        .from(table)
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id)
        .is("deleted_at", null)
        .select("id")
        .maybeSingle();
      if (error) throw new Error(error.message);
      return Boolean(data);
    },

    async setPublished(id: string, published: boolean): Promise<TDomain | null> {
      const { data, error } = await sb()
        .from(table)
        .update({ published })
        .eq("id", id)
        .is("deleted_at", null)
        .select(SELECT)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data ? toDomain(data as Row) : null;
    },
  };
}
