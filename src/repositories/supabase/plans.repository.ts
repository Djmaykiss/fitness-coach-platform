import type { PlansRepository } from "@/repositories/types";
import type { ClientPlan, CreatePlanInput, Plan } from "@/types";
import { getSupabaseClient } from "@/lib/supabase";
import { getCurrentOrgId } from "@/repositories/supabase/org-context";
import { unwrap, unwrapList } from "@/repositories/supabase/query";
import { definedOnly, keysToSnake, omit } from "@/repositories/supabase/mappers";
import { str, bool, type Row } from "@/repositories/supabase/content-crud";

/**
 * SupabasePlansRepository. Planes comerciales sobre `plans` (+ beneficios normalizados
 * en `plan_features`) y plan contratado en `client_plans`. Misma interfaz que el
 * `Local*`. Lectura PÚBLICA (anon) de los planes ACTIVOS (landing); staff-CRUD.
 */

const num = (row: Row, key: string, d = 0): number => {
  const v = row[key];
  if (typeof v === "number") return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

export class SupabasePlansRepository implements PlansRepository {
  private sb() {
    return getSupabaseClient();
  }

  private async requireOrg(): Promise<string> {
    const orgId = await getCurrentOrgId();
    if (!orgId) throw new Error("No hay una organización activa.");
    return orgId;
  }

  /** Beneficios (por plan_id, ordenados por position). */
  private async featuresFor(planIds: string[]): Promise<Map<string, string[]>> {
    const map = new Map<string, string[]>();
    if (planIds.length === 0) return map;
    const rows = unwrapList(
      await this.sb()
        .from("plan_features")
        .select("plan_id, text, position")
        .in("plan_id", planIds)
        .order("position", { ascending: true }),
    ) as Row[];
    for (const r of rows) {
      const pid = str(r, "plan_id");
      if (!map.has(pid)) map.set(pid, []);
      map.get(pid)!.push(str(r, "text"));
    }
    return map;
  }

  private toPlan(row: Row, features: string[]): Plan {
    return {
      id: str(row, "id"),
      name: str(row, "name"),
      priceLabel: str(row, "price_label"),
      modality: str(row, "modality"),
      idealFor: str(row, "ideal_for"),
      features,
      buttonLabel: str(row, "button_label"),
      color: str(row, "color") || "#65ff4f",
      image: str(row, "image"),
      recommended: bool(row, "recommended"),
      active: bool(row, "active"),
      position: num(row, "position"),
    };
  }

  private async hydrate(rows: Row[]): Promise<Plan[]> {
    const features = await this.featuresFor(rows.map((r) => str(r, "id")));
    return rows.map((r) => this.toPlan(r, features.get(str(r, "id")) ?? []));
  }

  async getPlans(): Promise<Plan[]> {
    const rows = unwrapList(
      await this.sb()
        .from("plans")
        .select("*")
        .is("deleted_at", null)
        .order("position", { ascending: true }),
    ) as Row[];
    return this.hydrate(rows);
  }

  async getActivePlans(): Promise<Plan[]> {
    const rows = unwrapList(
      await this.sb()
        .from("plans")
        .select("*")
        .eq("active", true)
        .is("deleted_at", null)
        .order("position", { ascending: true }),
    ) as Row[];
    return this.hydrate(rows);
  }

  private async replaceFeatures(planId: string, org: string, features: string[]): Promise<void> {
    await this.sb().from("plan_features").delete().eq("plan_id", planId);
    if (features.length > 0) {
      await this.sb().from("plan_features").insert(
        features.map((text, i) => ({ organization_id: org, plan_id: planId, text, position: i })),
      );
    }
  }

  private async getPlanById(id: string): Promise<Plan | null> {
    const { data, error } = await this.sb()
      .from("plans")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return (await this.hydrate([data as Row]))[0] ?? null;
  }

  async createPlan(input: CreatePlanInput): Promise<Plan> {
    const org = await this.requireOrg();
    const { count } = await this.sb()
      .from("plans")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null);
    const scalar = keysToSnake(omit(input as Row, ["features"]));
    const created = unwrap(
      await this.sb()
        .from("plans")
        .insert({ ...scalar, organization_id: org, position: count ?? 0 })
        .select("*")
        .single(),
    ) as Row;
    await this.replaceFeatures(str(created, "id"), org, input.features ?? []);
    return this.toPlan(created, input.features ?? []);
  }

  async updatePlan(id: string, patch: Partial<CreatePlanInput>): Promise<Plan | null> {
    const { data: existing, error: exErr } = await this.sb()
      .from("plans")
      .select("organization_id")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();
    if (exErr) throw new Error(exErr.message);
    if (!existing) return null;
    const org = str(existing as Row, "organization_id");

    const scalar = keysToSnake(definedOnly(omit(patch as Row, ["features"])));
    if (Object.keys(scalar).length > 0) {
      const { error } = await this.sb().from("plans").update(scalar).eq("id", id);
      if (error) throw new Error(error.message);
    }
    if (patch.features !== undefined) {
      await this.replaceFeatures(id, org, patch.features);
    }
    return this.getPlanById(id);
  }

  async deletePlan(id: string): Promise<boolean> {
    const { data, error } = await this.sb()
      .from("plans")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .is("deleted_at", null)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return Boolean(data);
  }

  async setActive(id: string, active: boolean): Promise<Plan | null> {
    const { data, error } = await this.sb()
      .from("plans")
      .update({ active })
      .eq("id", id)
      .is("deleted_at", null)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return this.getPlanById(id);
  }

  async setRecommended(id: string): Promise<void> {
    const org = await this.requireOrg();
    await this.sb().from("plans").update({ recommended: false }).eq("organization_id", org);
    await this.sb().from("plans").update({ recommended: true }).eq("id", id);
  }

  async reorder(orderedIds: string[]): Promise<void> {
    for (let i = 0; i < orderedIds.length; i++) {
      await this.sb().from("plans").update({ position: i }).eq("id", orderedIds[i]);
    }
  }

  async getClientPlan(clientId: string): Promise<ClientPlan | null> {
    const { data, error } = await this.sb()
      .from("client_plans")
      .select("plan_id, plan_name, status, start_date, renewal_date")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    const r = data as Row;
    return {
      planId: str(r, "plan_id"),
      planName: str(r, "plan_name"),
      status: str(r, "status"),
      startDate: str(r, "start_date"),
      renewalDate: str(r, "renewal_date"),
    };
  }
}
