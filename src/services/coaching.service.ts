import {
  clientRepository,
  coachingRepository,
  nutritionPlanRepository,
  progressRepository,
  trainingProgramRepository,
} from "@/repositories";
import { metricsService } from "@/services/metrics.service";
import { isDemoContent } from "@/lib/demo";
import { starterClientProgress } from "@/data/dashboard";
import {
  beforeAfter,
  bodyMetricsInput,
  checkIn,
  compliance,
  goal,
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
  Achievement,
  ChatMessage,
  ChecklistChecks,
  ChecklistItem,
  ChecklistState,
  CoachingDashboard,
  CreateProgressPhoto,
  GoalData,
  HistoryEvent,
  MetricSeries,
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

/** Extrae el primer numero de un texto ("86 kg" -> 86). */
function parseNum(value: string): number {
  const n = Number.parseFloat(String(value).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

/**
 * Dashboard premium del alumno. Compone datos demo (seed) con los interactivos
 * persistidos (fotos, checklists, calendario, rutina, chat) y DERIVA los logros y
 * el historial a partir de acciones reales (entrenamientos, comidas, fotos, etc.).
 * La UI nunca toca datos ni repositorios.
 */
export const coachingService = {
  async getDashboard(userId: string): Promise<CoachingDashboard> {
    // Producción sin demo: nada de datos falsos. El fallback `c-demo` y los seeds demo
    // (gráficas, recursos, Antes/Después, chat demo) solo se muestran con isDemoContent().
    const demo = isDemoContent();
    const client = await clientRepository.findByUserId(userId);
    const clientId = client?.id ?? (demo ? "c-demo" : "");

    // Sin ficha de cliente resuelta (p. ej. producción: alumno sin `clients`): NO se
    // consulta (un id vacío rompería las queries de Supabase). Dashboard vacío/seguro.
    const [
      photos,
      checks,
      chat,
      workoutProgress,
      mealProgress,
      progress,
      trainingAssignment,
      nutritionAssignment,
    ] = clientId
      ? await Promise.all([
          coachingRepository.getPhotos(clientId),
          coachingRepository.getChecks(clientId),
          coachingRepository.getChat(clientId),
          trainingProgramRepository.getWorkoutProgress(clientId),
          nutritionPlanRepository.getMealProgress(clientId),
          progressRepository.getForClient(clientId),
          trainingProgramRepository.getAssignment(clientId),
          nutritionPlanRepository.getAssignment(clientId),
        ])
      : [[], {} as ChecklistChecks, [], [], [], starterClientProgress, null, null];

    const completedWorkouts = workoutProgress.length;
    const completedMeals = mealProgress.length;
    const weightLost = parseNum(progress.pesoInicial) - parseNum(progress.pesoActual);
    const goalPct = progress.progresoPct ?? 0;
    const hasEvaluation = Boolean(client?.evaluation);

    // Logros derivados de acciones reales (se desbloquean solos).
    const achievements: Achievement[] = [
      { key: "primer-entreno", label: "Primer entrenamiento", unlocked: completedWorkouts >= 1 },
      { key: "primera-semana", label: "Primera semana", unlocked: completedWorkouts >= 3 },
      { key: "5kg", label: "5 kg perdidos", unlocked: weightLost >= 5 },
      { key: "30-dias", label: "30 días entrenando", unlocked: completedWorkouts >= 30 },
      { key: "meta", label: "Objetivo alcanzado", unlocked: goalPct >= 100 },
    ];

    // Historial derivado (se actualiza con las acciones del alumno).
    const history: HistoryEvent[] = [];
    if (hasEvaluation) history.push({ date: "", label: "Evaluación inicial completada", done: true });
    if (client) history.push({ date: "", label: "Cuenta de alumno creada", done: true });
    if (trainingAssignment) history.push({ date: "", label: "Programa de entrenamiento asignado", done: true });
    if (nutritionAssignment) history.push({ date: "", label: "Plan de nutrición asignado", done: true });
    if (completedWorkouts > 0) history.push({ date: "", label: `Entrenamientos completados: ${completedWorkouts}`, done: true });
    if (completedMeals > 0) history.push({ date: "", label: `Comidas completadas: ${completedMeals}`, done: true });
    [...photos]
      .sort((a, b) => a.date.localeCompare(b.date))
      .forEach((p) => history.push({ date: p.date, label: "Foto de progreso agregada", done: true }));
    achievements
      .filter((a) => a.unlocked)
      .forEach((a) => history.push({ date: "", label: `Logro: ${a.label}`, done: true }));

    // Gráficas demo -> vacías en producción (la sección muestra placeholder).
    const emptyMetrics: MetricSeries = { weight: [], waist: [], fat: [], muscle: [] };

    return {
      clientId,
      metrics: demo ? metricSeries : emptyMetrics,
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
      resources: demo ? resources : [],
      chat,
      checkIn,
      beforeAfter: demo ? beforeAfter : { before: "", after: "" },
      photos,
      bodyMetrics: metricsService.compute(bodyMetricsInput),
      calendar: {
        trained: checks["calendar-trained"] ?? {},
        full: checks["calendar-full"] ?? {},
      },
      routineStatus: {
        started: Boolean(checks["routine"]?.["started"]),
        completed: Boolean(checks["routine"]?.["completed"]),
      },
    };
  },

  toggleCheck(clientId: string, listKey: string, itemKey: string, done: boolean) {
    return coachingRepository.setCheck(clientId, listKey, itemKey, done);
  },

  addPhoto(clientId: string, photo: CreateProgressPhoto) {
    return coachingRepository.addPhoto(clientId, photo);
  },

  /** Envia un mensaje del alumno al chat (persistido). */
  addChatMessage(clientId: string, text: string): Promise<ChatMessage[]> {
    const time = new Date().toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return coachingRepository.addChatMessage(clientId, {
      from: "alumno",
      text: text.trim(),
      time,
    });
  },
};
