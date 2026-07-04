import type { CrmRepository } from "@/repositories/types";
import type { CrmHistoryEntry, CrmRecord, CrmStage } from "@/types";
import { getSupabaseClient } from "@/lib/supabase";
import { getCurrentOrgId } from "@/repositories/supabase/org-context";
import { unwrap, unwrapList } from "@/repositories/supabase/query";
import { definedOnly, keysToSnake } from "@/repositories/supabase/mappers";
import { str, type Row } from "@/repositories/supabase/content-crud";

/**
 * SupabaseCrmRepository (Bloque 8). Metadatos CRM del pipeline sobre `crm_records`
 * (+ historial en `crm_history`). SOLO staff (RLS). Misma interfaz que el `Local*`:
 * `entityId` (lead o cliente) mapea a `crm_records.entity_id`.
 */

function rowToRecord(row: Row, history: CrmHistoryEntry[]): CrmRecord {
  const stage = str(row, "stage");
  const record: CrmRecord = {
    entityId: str(row, "entity_id"),
    notes: str(row, "notes"),
    nextAction: str(row, "next_action"),
    followUpDate: str(row, "follow_up_date"),
    history,
  };
  if (stage) record.stage = stage as CrmStage;
  return record;
}

export class SupabaseCrmRepository implements CrmRepository {
  private sb() {
    return getSupabaseClient();
  }

  private async requireOrg(): Promise<string> {
    const orgId = await getCurrentOrgId();
    if (!orgId) throw new Error("No hay una organización activa.");
    return orgId;
  }

  /** Mapa record_id -> historial (ordenado por created_at asc). */
  private async historyFor(recordIds: string[]): Promise<Map<string, CrmHistoryEntry[]>> {
    const map = new Map<string, CrmHistoryEntry[]>();
    if (recordIds.length === 0) return map;
    const rows = unwrapList(
      await this.sb()
        .from("crm_history")
        .select("record_id, stage, date")
        .in("record_id", recordIds)
        .order("created_at", { ascending: true }),
    ) as Row[];
    for (const r of rows) {
      const rid = str(r, "record_id");
      if (!map.has(rid)) map.set(rid, []);
      map.get(rid)!.push({ stage: str(r, "stage") as CrmStage, date: str(r, "date") });
    }
    return map;
  }

  async getRecords(): Promise<CrmRecord[]> {
    const rows = unwrapList(
      await this.sb().from("crm_records").select("*").order("created_at", { ascending: true }),
    ) as Row[];
    const history = await this.historyFor(rows.map((r) => str(r, "id")));
    return rows.map((r) => rowToRecord(r, history.get(str(r, "id")) ?? []));
  }

  async getRecord(entityId: string): Promise<CrmRecord | null> {
    const { data, error } = await this.sb()
      .from("crm_records")
      .select("*")
      .eq("entity_id", entityId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    const history = await this.historyFor([str(data as Row, "id")]);
    return rowToRecord(data as Row, history.get(str(data as Row, "id")) ?? []);
  }

  /** Upsert del record (escalares) y devuelve el ensamblado. La `history` no se toca
   *  aquí (se maneja en `setStage`), igual que el `Local*` (el upsert de la UI no la usa). */
  private async upsertRow(entityId: string, patch: Record<string, unknown>): Promise<Row> {
    const org = await this.requireOrg();
    const row = { organization_id: org, entity_id: entityId, ...patch };
    return unwrap(
      await this.sb()
        .from("crm_records")
        .upsert(row, { onConflict: "organization_id,entity_id" })
        .select("*")
        .single(),
    ) as Row;
  }

  async upsert(
    entityId: string,
    patch: Partial<Omit<CrmRecord, "entityId">>,
  ): Promise<CrmRecord> {
    const { history: _history, ...scalar } = patch;
    void _history;
    const row = await this.upsertRow(entityId, keysToSnake(definedOnly(scalar as Row)));
    const history = await this.historyFor([str(row, "id")]);
    return rowToRecord(row, history.get(str(row, "id")) ?? []);
  }

  async setStage(entityId: string, stage: CrmStage): Promise<CrmRecord> {
    const org = await this.requireOrg();
    const row = await this.upsertRow(entityId, { stage });
    await this.sb().from("crm_history").insert({
      organization_id: org,
      record_id: str(row, "id"),
      stage,
      date: new Date().toISOString(),
    });
    const history = await this.historyFor([str(row, "id")]);
    return rowToRecord(row, history.get(str(row, "id")) ?? []);
  }
}
