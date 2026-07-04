import type { NutritionPlanRepository } from "@/repositories/types";
import type {
  CreateNutritionPlanInput,
  CreateNutritionPlanMeal,
  NutritionPlan,
  NutritionPlanDay,
  NutritionPlanMeal,
} from "@/types";
import { getSupabaseClient } from "@/lib/supabase";
import { getCurrentOrgId } from "@/repositories/supabase/org-context";
import { unwrap, unwrapList } from "@/repositories/supabase/query";
import { definedOnly, keysToSnake } from "@/repositories/supabase/mappers";
import { str, type Row } from "@/repositories/supabase/content-crud";

/**
 * SupabaseNutritionPlanRepository (Bloque 6). Planes ANIDADOS
 * (`nutrition_plans`->`nutrition_days`->`nutrition_meals`), asignación via
 * `student_assignments` y progreso de comidas (`nutrition_meal_progress`). Misma
 * interfaz que el `Local*`; cada mutación devuelve el `NutritionPlan` re-ensamblado.
 */

const NUTRITION_ASSIGNMENT = "nutrition_plan";

const rowToMeal = (r: Row): NutritionPlanMeal => ({
  id: str(r, "id"),
  name: str(r, "name"),
  description: str(r, "description"),
});

export class SupabaseNutritionPlanRepository implements NutritionPlanRepository {
  private sb() {
    return getSupabaseClient();
  }

  // ---------- ensamblado ----------

  private async hydrate(planRows: Row[]): Promise<NutritionPlan[]> {
    if (planRows.length === 0) return [];
    const planIds = planRows.map((p) => str(p, "id"));
    const dayRows = unwrapList(
      await this.sb()
        .from("nutrition_days")
        .select("*")
        .in("plan_id", planIds)
        .order("position", { ascending: true })
        .order("created_at", { ascending: true }),
    ) as Row[];
    const dayIds = dayRows.map((d) => str(d, "id"));
    const mealRows =
      dayIds.length === 0
        ? []
        : (unwrapList(
            await this.sb()
              .from("nutrition_meals")
              .select("*")
              .in("day_id", dayIds)
              .order("position", { ascending: true })
              .order("created_at", { ascending: true }),
          ) as Row[]);

    const mealsByDay = new Map<string, NutritionPlanMeal[]>();
    for (const m of mealRows) {
      const dayId = str(m, "day_id");
      if (!mealsByDay.has(dayId)) mealsByDay.set(dayId, []);
      mealsByDay.get(dayId)!.push(rowToMeal(m));
    }
    const daysByPlan = new Map<string, NutritionPlanDay[]>();
    for (const d of dayRows) {
      const pid = str(d, "plan_id");
      if (!daysByPlan.has(pid)) daysByPlan.set(pid, []);
      daysByPlan.get(pid)!.push({
        id: str(d, "id"),
        name: str(d, "name"),
        meals: mealsByDay.get(str(d, "id")) ?? [],
      });
    }
    return planRows.map((p) => ({
      id: str(p, "id"),
      name: str(p, "name"),
      objective: str(p, "objective"),
      calories: str(p, "calories"),
      protein: str(p, "protein"),
      carbs: str(p, "carbs"),
      fat: str(p, "fat"),
      water: str(p, "water"),
      notes: str(p, "notes"),
      days: daysByPlan.get(str(p, "id")) ?? [],
    }));
  }

  async getPlans(): Promise<NutritionPlan[]> {
    const rows = unwrapList(
      await this.sb()
        .from("nutrition_plans")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: true }),
    ) as Row[];
    return this.hydrate(rows);
  }

  async getPlan(id: string): Promise<NutritionPlan | null> {
    const { data, error } = await this.sb()
      .from("nutrition_plans")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return (await this.hydrate([data as Row]))[0] ?? null;
  }

  async createPlan(input: CreateNutritionPlanInput): Promise<NutritionPlan> {
    const orgId = await getCurrentOrgId();
    if (!orgId) throw new Error("No hay una organización activa.");
    const row = {
      organization_id: orgId,
      name: input.name.trim(),
      objective: input.objective,
      calories: input.calories.trim(),
      protein: input.protein.trim(),
      carbs: input.carbs.trim(),
      fat: input.fat.trim(),
      water: input.water.trim(),
      notes: input.notes.trim(),
    };
    const created = unwrap(
      await this.sb().from("nutrition_plans").insert(row).select("*").single(),
    ) as Row;
    return (await this.hydrate([created]))[0];
  }

  async updatePlan(
    id: string,
    patch: Partial<CreateNutritionPlanInput>,
  ): Promise<NutritionPlan | null> {
    const row = keysToSnake(definedOnly(patch as Row));
    if (Object.keys(row).length > 0) {
      const { data, error } = await this.sb()
        .from("nutrition_plans")
        .update(row)
        .eq("id", id)
        .is("deleted_at", null)
        .select("id")
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) return null;
    }
    return this.getPlan(id);
  }

  async deletePlan(id: string): Promise<boolean> {
    const { data, error } = await this.sb()
      .from("nutrition_plans")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .is("deleted_at", null)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return Boolean(data);
  }

  // ---------- helpers de mutación ----------

  private async planOrg(planId: string): Promise<string | null> {
    const { data } = await this.sb()
      .from("nutrition_plans")
      .select("organization_id")
      .eq("id", planId)
      .is("deleted_at", null)
      .maybeSingle();
    return data ? str(data as Row, "organization_id") : null;
  }

  private async count(table: string, column: string, value: string): Promise<number> {
    const { count } = await this.sb()
      .from(table)
      .select("id", { count: "exact", head: true })
      .eq(column, value);
    return count ?? 0;
  }

  async addDay(planId: string, name: string): Promise<NutritionPlan | null> {
    const org = await this.planOrg(planId);
    if (!org) return null;
    const position = await this.count("nutrition_days", "plan_id", planId);
    await this.sb()
      .from("nutrition_days")
      .insert({ organization_id: org, plan_id: planId, name: name.trim(), position });
    return this.getPlan(planId);
  }

  async deleteDay(planId: string, dayId: string): Promise<NutritionPlan | null> {
    const org = await this.planOrg(planId);
    if (!org) return null;
    await this.sb().from("nutrition_days").delete().eq("id", dayId).eq("plan_id", planId);
    return this.getPlan(planId);
  }

  async addMeal(
    planId: string,
    dayId: string,
    meal: CreateNutritionPlanMeal,
  ): Promise<NutritionPlan | null> {
    const org = await this.planOrg(planId);
    if (!org) return null;
    const position = await this.count("nutrition_meals", "day_id", dayId);
    await this.sb().from("nutrition_meals").insert({
      organization_id: org,
      day_id: dayId,
      name: meal.name,
      description: meal.description,
      position,
    });
    return this.getPlan(planId);
  }

  async deleteMeal(
    planId: string,
    dayId: string,
    mealId: string,
  ): Promise<NutritionPlan | null> {
    const org = await this.planOrg(planId);
    if (!org) return null;
    await this.sb().from("nutrition_meals").delete().eq("id", mealId).eq("day_id", dayId);
    return this.getPlan(planId);
  }

  // ---------- asignación (student_assignments) ----------

  private async clientOrg(clientId: string): Promise<string> {
    const { data } = await this.sb()
      .from("clients")
      .select("organization_id")
      .eq("id", clientId)
      .maybeSingle();
    return data ? str(data as Row, "organization_id") : "";
  }

  async assignToClient(clientId: string, planId: string): Promise<void> {
    const org = (await this.clientOrg(clientId)) || (await getCurrentOrgId()) || "";
    if (!org) throw new Error("No hay organización para la asignación.");
    await this.sb()
      .from("student_assignments")
      .delete()
      .eq("client_id", clientId)
      .eq("resource_type", NUTRITION_ASSIGNMENT);
    await this.sb().from("student_assignments").insert({
      organization_id: org,
      client_id: clientId,
      resource_type: NUTRITION_ASSIGNMENT,
      resource_id: planId,
      status: "active",
    });
  }

  async getAssignment(clientId: string): Promise<string | null> {
    const { data, error } = await this.sb()
      .from("student_assignments")
      .select("resource_id")
      .eq("client_id", clientId)
      .eq("resource_type", NUTRITION_ASSIGNMENT)
      .eq("status", "active")
      .is("deleted_at", null)
      .order("assigned_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? str(data as Row, "resource_id") : null;
  }

  // ---------- progreso de comidas ----------

  async getMealProgress(clientId: string): Promise<string[]> {
    const rows = unwrapList(
      await this.sb().from("nutrition_meal_progress").select("meal_id").eq("client_id", clientId),
    ) as Row[];
    return rows.map((r) => str(r, "meal_id"));
  }

  async setMealCompleted(clientId: string, mealId: string, done: boolean): Promise<string[]> {
    if (done) {
      const org = await this.clientOrg(clientId);
      await this.sb()
        .from("nutrition_meal_progress")
        .upsert(
          { organization_id: org, client_id: clientId, meal_id: mealId },
          { onConflict: "client_id,meal_id", ignoreDuplicates: true },
        );
    } else {
      await this.sb()
        .from("nutrition_meal_progress")
        .delete()
        .eq("client_id", clientId)
        .eq("meal_id", mealId);
    }
    return this.getMealProgress(clientId);
  }
}
