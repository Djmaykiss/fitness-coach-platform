import {
  nutritionAssignmentsSeed,
  nutritionPlansSeed,
} from "@/data/nutrition";
import { resolveMock } from "@/repositories/async";
import type { NutritionPlanRepository } from "@/repositories/types";
import {
  STORAGE_KEYS,
  readCollection,
  readRecord,
  writeCollection,
  writeRecord,
} from "@/lib/local-store";
import type {
  CreateNutritionPlanInput,
  CreateNutritionPlanMeal,
  NutritionPlan,
} from "@/types";

function id(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

/** Planes de nutricion, asignaciones y progreso de comidas, en localStorage. */
export class LocalNutritionPlanRepository implements NutritionPlanRepository {
  private readPlans(): NutritionPlan[] {
    return readCollection<NutritionPlan>(
      STORAGE_KEYS.nutritionPlans,
      nutritionPlansSeed,
    );
  }

  private writePlans(plans: NutritionPlan[]): void {
    writeCollection(STORAGE_KEYS.nutritionPlans, plans);
  }

  /** Aplica un cambio sobre un plan por id y persiste; devuelve el actualizado. */
  private mutate(
    planId: string,
    fn: (plan: NutritionPlan) => NutritionPlan,
  ): NutritionPlan | null {
    const plans = this.readPlans();
    const index = plans.findIndex((p) => p.id === planId);
    if (index === -1) return null;
    const updated = fn(plans[index]);
    plans[index] = updated;
    this.writePlans(plans);
    return updated;
  }

  getPlans() {
    return resolveMock(this.readPlans());
  }

  getPlan(planId: string) {
    return resolveMock<NutritionPlan | null>(
      this.readPlans().find((p) => p.id === planId) ?? null,
    );
  }

  createPlan(input: CreateNutritionPlanInput) {
    const plans = this.readPlans();
    const plan: NutritionPlan = {
      id: id("np"),
      name: input.name.trim(),
      objective: input.objective,
      calories: input.calories.trim(),
      protein: input.protein.trim(),
      carbs: input.carbs.trim(),
      fat: input.fat.trim(),
      water: input.water.trim(),
      notes: input.notes.trim(),
      days: [],
    };
    plans.push(plan);
    this.writePlans(plans);
    return resolveMock(plan);
  }

  updatePlan(planId: string, patch: Partial<CreateNutritionPlanInput>) {
    return resolveMock(this.mutate(planId, (p) => ({ ...p, ...patch })));
  }

  deletePlan(planId: string) {
    const plans = this.readPlans();
    const next = plans.filter((p) => p.id !== planId);
    const removed = next.length !== plans.length;
    if (removed) this.writePlans(next);
    return resolveMock(removed);
  }

  addDay(planId: string, name: string) {
    return resolveMock(
      this.mutate(planId, (p) => ({
        ...p,
        days: [...p.days, { id: id("nd"), name: name.trim(), meals: [] }],
      })),
    );
  }

  deleteDay(planId: string, dayId: string) {
    return resolveMock(
      this.mutate(planId, (p) => ({
        ...p,
        days: p.days.filter((d) => d.id !== dayId),
      })),
    );
  }

  addMeal(planId: string, dayId: string, meal: CreateNutritionPlanMeal) {
    return resolveMock(
      this.mutate(planId, (p) => ({
        ...p,
        days: p.days.map((d) =>
          d.id === dayId
            ? { ...d, meals: [...d.meals, { id: id("nm"), ...meal }] }
            : d,
        ),
      })),
    );
  }

  deleteMeal(planId: string, dayId: string, mealId: string) {
    return resolveMock(
      this.mutate(planId, (p) => ({
        ...p,
        days: p.days.map((d) =>
          d.id === dayId
            ? { ...d, meals: d.meals.filter((m) => m.id !== mealId) }
            : d,
        ),
      })),
    );
  }

  /* ---- Asignaciones (clientId -> planId) ---- */
  private readAssignments(): Record<string, string> {
    return readRecord<string>(
      STORAGE_KEYS.nutritionAssignments,
      nutritionAssignmentsSeed,
    );
  }

  assignToClient(clientId: string, planId: string) {
    const record = this.readAssignments();
    record[clientId] = planId;
    writeRecord(STORAGE_KEYS.nutritionAssignments, record);
    return resolveMock<void>(undefined);
  }

  getAssignment(clientId: string) {
    return resolveMock<string | null>(this.readAssignments()[clientId] ?? null);
  }

  /* ---- Progreso de comidas (clientId -> comidas completadas) ---- */
  private readProgress(): Record<string, string[]> {
    return readRecord<string[]>(STORAGE_KEYS.nutritionProgress, {});
  }

  getMealProgress(clientId: string) {
    return resolveMock(this.readProgress()[clientId] ?? []);
  }

  setMealCompleted(clientId: string, mealId: string, done: boolean) {
    const record = this.readProgress();
    const current = new Set(record[clientId] ?? []);
    if (done) current.add(mealId);
    else current.delete(mealId);
    const next = [...current];
    record[clientId] = next;
    writeRecord(STORAGE_KEYS.nutritionProgress, record);
    return resolveMock(next);
  }
}
