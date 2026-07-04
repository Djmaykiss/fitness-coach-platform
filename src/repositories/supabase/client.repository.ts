import type { ClientRepository } from "@/repositories/types";
import type { AccessStatus, Client, CreateClientInput, LeadEvaluation } from "@/types";
import { getSupabaseClient } from "@/lib/supabase";
import { getCurrentOrgId } from "@/repositories/supabase/org-context";
import { unwrap, unwrapList } from "@/repositories/supabase/query";
import { definedOnly, keysToSnake } from "@/repositories/supabase/mappers";
import { str, type Row } from "@/repositories/supabase/content-crud";

/**
 * SupabaseClientRepository (Bloque 4). Alumnos sobre `clients` (+ evaluación en
 * `evaluations` por `client_id`). `createClient` es del STAFF (admin/convertir lead);
 * el auto-registro (register→clients) va por la RPC `register_client` en el servicio
 * de auth. Misma interfaz que `LocalClientRepository`.
 */

function strOrNull(row: Row, key: string): string | null {
  const v = row[key];
  return typeof v === "string" && v !== "" ? v : null;
}

function rowToClient(row: Row, evaluation?: LeadEvaluation): Client {
  const userId = strOrNull(row, "user_id");
  const client: Client = {
    id: str(row, "id"),
    name: str(row, "name"),
    status: str(row, "status"),
    accessStatus: (str(row, "access_status") || "Vencido") as AccessStatus,
    accessExpiresAt: strOrNull(row, "access_expires_at"),
    lastPaymentDate: strOrNull(row, "last_payment_date"),
    paymentMethod: strOrNull(row, "payment_method"),
  };
  if (userId) client.userId = userId;
  if (evaluation) client.evaluation = evaluation;
  return client;
}

export class SupabaseClientRepository implements ClientRepository {
  private sb() {
    return getSupabaseClient();
  }

  private async evaluationsFor(clientIds: string[]): Promise<Map<string, LeadEvaluation>> {
    const map = new Map<string, LeadEvaluation>();
    if (clientIds.length === 0) return map;
    const rows = unwrapList(
      await this.sb().from("evaluations").select("client_id, data").in("client_id", clientIds),
    ) as Row[];
    for (const row of rows) {
      const clientId = str(row, "client_id");
      const data = row["data"];
      if (clientId && data && typeof data === "object") map.set(clientId, data as LeadEvaluation);
    }
    return map;
  }

  private async assembleOne(id: string): Promise<Client | null> {
    const { data, error } = await this.sb()
      .from("clients")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    const evals = await this.evaluationsFor([id]);
    return rowToClient(data as Row, evals.get(id));
  }

  async getClients(): Promise<Client[]> {
    const rows = unwrapList(
      await this.sb()
        .from("clients")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: true }),
    ) as Row[];
    const evals = await this.evaluationsFor(rows.map((r) => str(r, "id")));
    return rows.map((r) => rowToClient(r, evals.get(str(r, "id"))));
  }

  async findByUserId(userId: string): Promise<Client | null> {
    const { data, error } = await this.sb()
      .from("clients")
      .select("*")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    const evals = await this.evaluationsFor([str(data as Row, "id")]);
    return rowToClient(data as Row, evals.get(str(data as Row, "id")));
  }

  async createClient(input: CreateClientInput): Promise<Client> {
    const orgId = await getCurrentOrgId();
    if (!orgId) throw new Error("No hay una organización activa.");
    const row = {
      organization_id: orgId,
      name: input.name.trim(),
      status: input.status,
      access_status: "Vencido",
      ...(input.userId ? { user_id: input.userId } : {}),
    };
    const created = unwrap(
      await this.sb().from("clients").insert(row).select("*").single(),
    ) as Row;
    const clientId = str(created, "id");
    if (input.evaluation) {
      await this.sb()
        .from("evaluations")
        .insert({ organization_id: orgId, client_id: clientId, data: input.evaluation });
    }
    return rowToClient(created, input.evaluation);
  }

  async updateClient(id: string, patch: Partial<Omit<Client, "id">>): Promise<Client | null> {
    const { evaluation, ...scalar } = patch;
    const row = keysToSnake(definedOnly(scalar as Row));

    if (Object.keys(row).length > 0) {
      const { data, error } = await this.sb()
        .from("clients")
        .update(row)
        .eq("id", id)
        .is("deleted_at", null)
        .select("organization_id")
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) return null;
    } else {
      const { data } = await this.sb()
        .from("clients")
        .select("id")
        .eq("id", id)
        .is("deleted_at", null)
        .maybeSingle();
      if (!data) return null;
    }

    if (evaluation !== undefined) {
      const { data: cli } = await this.sb()
        .from("clients")
        .select("organization_id")
        .eq("id", id)
        .maybeSingle();
      const orgId = cli ? str(cli as Row, "organization_id") : "";
      const { data: existing } = await this.sb()
        .from("evaluations")
        .select("id")
        .eq("client_id", id)
        .maybeSingle();
      if (existing) {
        await this.sb().from("evaluations").update({ data: evaluation }).eq("id", str(existing as Row, "id"));
      } else if (orgId) {
        await this.sb().from("evaluations").insert({ organization_id: orgId, client_id: id, data: evaluation });
      }
    }

    return this.assembleOne(id);
  }

  async deleteClient(id: string): Promise<boolean> {
    const { data, error } = await this.sb()
      .from("clients")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .is("deleted_at", null)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return Boolean(data);
  }
}
