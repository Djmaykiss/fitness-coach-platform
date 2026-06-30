import {
  clientRepository,
  nutritionPlanRepository,
} from "@/repositories";
import type {
  AssignedNutrition,
  CreateNutritionPlanInput,
  CreateNutritionPlanMeal,
} from "@/types";

/**
 * Modulo de nutricion. El panel admin consume el CRUD/builder/asignacion; el
 * dashboard del alumno consume la lectura por usuario. La UI no toca repositorios.
 */
export const nutritionService = {
  /* ---- Admin: CRUD + builder ---- */
  getPlans: () => nutritionPlanRepository.getPlans(),
  createPlan: (input: CreateNutritionPlanInput) =>
    nutritionPlanRepository.createPlan(input),
  updatePlan: (id: string, patch: Partial<CreateNutritionPlanInput>) =>
    nutritionPlanRepository.updatePlan(id, patch),
  deletePlan: (id: string) => nutritionPlanRepository.deletePlan(id),
  addDay: (planId: string, name: string) =>
    nutritionPlanRepository.addDay(planId, name),
  deleteDay: (planId: string, dayId: string) =>
    nutritionPlanRepository.deleteDay(planId, dayId),
  addMeal: (planId: string, dayId: string, meal: CreateNutritionPlanMeal) =>
    nutritionPlanRepository.addMeal(planId, dayId, meal),
  deleteMeal: (planId: string, dayId: string, mealId: string) =>
    nutritionPlanRepository.deleteMeal(planId, dayId, mealId),

  /* ---- Admin: asignacion ---- */
  assignToClient: (clientId: string, planId: string) =>
    nutritionPlanRepository.assignToClient(clientId, planId),
  getAssignment: (clientId: string) =>
    nutritionPlanRepository.getAssignment(clientId),

  /* ---- Alumno: lectura por usuario autenticado ---- */
  /** Plan asignado + comidas completadas del alumno (resuelto por su userId). */
  async getAssignedForUser(userId: string): Promise<AssignedNutrition | null> {
    const client = await clientRepository.findByUserId(userId);
    if (!client) return null;
    const planId = await nutritionPlanRepository.getAssignment(client.id);
    if (!planId) return null;
    const plan = await nutritionPlanRepository.getPlan(planId);
    if (!plan) return null;
    const completedMealIds = await nutritionPlanRepository.getMealProgress(
      client.id,
    );
    return { clientId: client.id, plan, completedMealIds };
  },

  /** Marca/desmarca una comida como completada para el alumno autenticado. */
  async toggleMealForUser(userId: string, mealId: string, done: boolean) {
    const client = await clientRepository.findByUserId(userId);
    if (!client) return [];
    return nutritionPlanRepository.setMealCompleted(client.id, mealId, done);
  },
};
