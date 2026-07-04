import type { ProgressRepository } from "@/repositories/types";
import type { ClientProgress } from "@/types";
import { starterClientProgress } from "@/data/dashboard";
import { getSupabaseClient } from "@/lib/supabase";
import { keysToSnake } from "@/repositories/supabase/mappers";
import { str, strArr, type Row } from "@/repositories/supabase/content-crud";

/**
 * SupabaseProgressRepository (Bloque 4). Progreso básico por cliente sobre
 * `client_progress` (1 fila por `client_id`). Igual que el `Local*`, un cliente sin
 * progreso recibe uno inicial (`starterClientProgress`) que queda persistido.
 */

const num = (row: Row, key: string, d = 0): number => {
  const v = row[key];
  if (typeof v === "number") return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

function rowToProgress(row: Row): ClientProgress {
  return {
    programa: str(row, "programa"),
    semanaActual: num(row, "semana_actual"),
    semanasTotales: num(row, "semanas_totales"),
    progresoPct: num(row, "progreso_pct"),
    pesoInicial: str(row, "peso_inicial"),
    pesoActual: str(row, "peso_actual"),
    objetivo: str(row, "objetivo"),
    adherencia: str(row, "adherencia"),
    tasks: strArr(row, "tasks"),
  };
}

export class SupabaseProgressRepository implements ProgressRepository {
  private sb() {
    return getSupabaseClient();
  }

  /** organization_id del cliente (para INSERT/UPSERT scoped). */
  private async orgOf(clientId: string): Promise<string> {
    const { data } = await this.sb()
      .from("clients")
      .select("organization_id")
      .eq("id", clientId)
      .maybeSingle();
    return data ? str(data as Row, "organization_id") : "";
  }

  async getForClient(clientId: string): Promise<ClientProgress> {
    const { data, error } = await this.sb()
      .from("client_progress")
      .select("*")
      .eq("client_id", clientId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (data) return rowToProgress(data as Row);

    // Sin progreso: sembrar el inicial (persistido, como el Local).
    const orgId = await this.orgOf(clientId);
    if (orgId) {
      const row = { ...keysToSnake(starterClientProgress as unknown as Row), organization_id: orgId, client_id: clientId };
      const ins = await this.sb().from("client_progress").insert(row).select("*").maybeSingle();
      if (!ins.error && ins.data) return rowToProgress(ins.data as Row);
    }
    return starterClientProgress;
  }

  async saveForClient(clientId: string, progress: ClientProgress): Promise<ClientProgress> {
    const orgId = await this.orgOf(clientId);
    if (!orgId) throw new Error("Cliente no encontrado para guardar el progreso.");
    const row = { ...keysToSnake(progress as unknown as Row), organization_id: orgId, client_id: clientId };
    const { data, error } = await this.sb()
      .from("client_progress")
      .upsert(row, { onConflict: "client_id" })
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? rowToProgress(data as Row) : progress;
  }

  async removeForClient(clientId: string): Promise<void> {
    const { error } = await this.sb().from("client_progress").delete().eq("client_id", clientId);
    if (error) throw new Error(error.message);
  }
}
