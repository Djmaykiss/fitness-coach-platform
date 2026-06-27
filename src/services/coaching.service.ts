import { clientRepository, coachingRepository } from "@/repositories";
import { metricsService } from "@/services/metrics.service";
import {
  achievements,
  beforeAfter,
  bodyMetricsInput,
  chatDemo,
  checkIn,
  compliance,
  goal,
  history,
  measurements,
  metricSeries,
  nutritionMeals,
  reminders,
  resources,
  todayRoutine,
  waterTarget,
  weeklyGoals,
} from "@/data/coaching";
import type {
  ChecklistItem,
  ChecklistState,
  CoachingDashboard,
  CreateProgressPhoto,
  GoalData,
  NutritionState,
} from "@/types";

function buildChecklist(
  items: ChecklistItem[],
  checks: Record<string, boolean> = {},
): ChecklistState {
  const built = items.map((item) => ({
    key: item.key,
    label: item.label,
    done: Boolean(checks[item.key]),
  }));
  const completed = built.filter((item) => item.done).length;
  const percent = built.length
    ? Math.round((completed / built.length) * 100)
    : 0;
  return { items: built, percent };
}

function buildNutrition(checks: Record<string, boolean> = {}): NutritionState {
  const meals = nutritionMeals.map((meal) => ({
    ...meal,
    done: Boolean(checks[meal.key]),
  }));
  const completed = meals.filter((meal) => meal.done).length;
  const percent = meals.length
    ? Math.round((completed / meals.length) * 100)
    : 0;
  return { meals, waterTarget, percent };
}

function goalPercent(g: GoalData): number {
  const total = g.startWeight - g.targetWeight;
  if (total <= 0) return 100;
  const done = g.startWeight - g.currentWeight;
  return Math.max(0, Math.min(100, Math.round((done / total) * 100)));
}

/**
 * Dashboard premium del alumno. Compone datos demo (seed) con los interactivos
 * persistidos (fotos + checklists). La UI nunca toca datos ni repositorios.
 */
export const coachingService = {
  async getDashboard(userId: string): Promise<CoachingDashboard> {
    const client = await clientRepository.findByUserId(userId);
    const clientId = client?.id ?? "c-demo";

    const [photos, checks] = await Promise.all([
      coachingRepository.getPhotos(clientId),
      coachingRepository.getChecks(clientId),
    ]);

    return {
      clientId,
      metrics: metricSeries,
      compliance,
      measurements,
      goal,
      transformationPct: goalPercent(goal),
      achievements,
      history,
      routine: todayRoutine,
      nutrition: buildNutrition(checks["nutrition"]),
      reminders: buildChecklist(reminders, checks["reminders"]),
      weeklyGoals: buildChecklist(weeklyGoals, checks["weekly-goals"]),
      resources,
      chat: chatDemo,
      checkIn,
      beforeAfter,
      photos,
      bodyMetrics: metricsService.compute(bodyMetricsInput),
    };
  },

  toggleCheck(clientId: string, listKey: string, itemKey: string, done: boolean) {
    return coachingRepository.setCheck(clientId, listKey, itemKey, done);
  },

  addPhoto(clientId: string, photo: CreateProgressPhoto) {
    return coachingRepository.addPhoto(clientId, photo);
  },
};
