import type { LeadRepository } from "@/repositories/types";
import type {
  CreateEvaluationLeadInput,
  CreateLeadInput,
  Lead,
  LeadEvaluation,
  LeadStatus,
} from "@/types";
import { getSupabaseClient } from "@/lib/supabase";
import { unwrap, unwrapList } from "@/repositories/supabase/query";
import { definedOnly, keysToSnake } from "@/repositories/supabase/mappers";
import { str, type Row } from "@/repositories/supabase/content-crud";

/**
 * SupabaseLeadRepository (Bloque 3). Leads sobre `leads` + `evaluations`.
 *
 * - `createLead` / `createEvaluationLead` son ANÓNIMOS (landing/onboarding): van por
 *   la RPC `create_lead_public` (SECURITY DEFINER), sin INSERT abierto.
 * - `getLeads` / `updateStatus` / `updateLead` / `deleteLead` son del STAFF (RLS por org).
 * La evaluación se guarda como `jsonb` en `evaluations.data`. Misma interfaz que `Local*`.
 */

function rowToLead(row: Row, evaluation?: LeadEvaluation): Lead {
  const lead: Lead = {
    id: str(row, "id"),
    name: str(row, "name"),
    email: str(row, "email"),
    phone: str(row, "phone"),
    objective: str(row, "objective"),
    message: str(row, "message"),
    source: str(row, "source"),
    status: (str(row, "status") || "Nuevo") as LeadStatus,
    createdAt: str(row, "created_at"),
  };
  if (evaluation) lead.evaluation = evaluation;
  return lead;
}

export class SupabaseLeadRepository implements LeadRepository {
  private sb() {
    return getSupabaseClient();
  }

  /** Mapa lead_id -> evaluación (jsonb) para un conjunto de leads. */
  private async evaluationsFor(leadIds: string[]): Promise<Map<string, LeadEvaluation>> {
    const map = new Map<string, LeadEvaluation>();
    if (leadIds.length === 0) return map;
    const rows = unwrapList(
      await this.sb().from("evaluations").select("lead_id, data").in("lead_id", leadIds),
    ) as Row[];
    for (const row of rows) {
      const leadId = str(row, "lead_id");
      const data = row["data"];
      if (leadId && data && typeof data === "object") {
        map.set(leadId, data as LeadEvaluation);
      }
    }
    return map;
  }

  private async assembleOne(id: string): Promise<Lead | null> {
    const { data, error } = await this.sb().from("leads").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    const evals = await this.evaluationsFor([id]);
    return rowToLead(data as Row, evals.get(id));
  }

  async getLeads(): Promise<Lead[]> {
    const rows = unwrapList(
      await this.sb().from("leads").select("*").order("created_at", { ascending: false }),
    ) as Row[];
    const evals = await this.evaluationsFor(rows.map((r) => str(r, "id")));
    return rows.map((r) => rowToLead(r, evals.get(str(r, "id"))));
  }

  async createLead(input: CreateLeadInput): Promise<Lead> {
    const data = unwrap(
      await this.sb().rpc("create_lead_public", {
        p_name: input.name,
        p_email: input.email,
        p_phone: input.phone,
        p_objective: input.objective,
        p_message: input.message,
        p_source: "Landing",
      }),
    ) as Row;
    return rowToLead(data);
  }

  async createEvaluationLead(input: CreateEvaluationLeadInput): Promise<Lead> {
    const data = unwrap(
      await this.sb().rpc("create_lead_public", {
        p_name: input.name,
        p_email: input.email,
        p_phone: input.phone,
        p_objective: input.evaluation.objective,
        p_message: "",
        p_source: "Evaluación",
        p_evaluation: input.evaluation,
      }),
    ) as Row;
    return rowToLead(data, input.evaluation);
  }

  async updateStatus(id: string, status: LeadStatus): Promise<Lead | null> {
    const { data, error } = await this.sb()
      .from("leads")
      .update({ status })
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return this.assembleOne(id);
  }

  async updateLead(id: string, patch: Partial<Omit<Lead, "id">>): Promise<Lead | null> {
    const { evaluation, ...scalar } = patch;
    const row = keysToSnake(definedOnly(scalar as Row));

    if (Object.keys(row).length > 0) {
      const { data, error } = await this.sb()
        .from("leads")
        .update(row)
        .eq("id", id)
        .select("id")
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) return null;
    } else {
      // Sin escalares que actualizar: confirmar que el lead existe.
      const { data } = await this.sb().from("leads").select("id, organization_id").eq("id", id).maybeSingle();
      if (!data) return null;
    }

    if (evaluation !== undefined) {
      const { data: leadRow } = await this.sb()
        .from("leads")
        .select("organization_id")
        .eq("id", id)
        .maybeSingle();
      const orgId = leadRow ? str(leadRow as Row, "organization_id") : "";
      const { data: existing } = await this.sb()
        .from("evaluations")
        .select("id")
        .eq("lead_id", id)
        .maybeSingle();
      if (existing) {
        await this.sb().from("evaluations").update({ data: evaluation }).eq("id", str(existing as Row, "id"));
      } else if (orgId) {
        await this.sb().from("evaluations").insert({ organization_id: orgId, lead_id: id, data: evaluation });
      }
    }

    return this.assembleOne(id);
  }

  async deleteLead(id: string): Promise<boolean> {
    const { data, error } = await this.sb()
      .from("leads")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return Boolean(data);
  }
}
