import { clientRepository, trainingProgramRepository } from "@/repositories";
import { metricsService } from "@/services/metrics.service";
import type { TrainingDay } from "@/types";

/** Resumen del plan del alumno para la pantalla "Obtener mi plan". */
export type PlanSummary = {
  planName: string;
  mainZone: string;
  level: string;
  duration: string;
  weeks: number;
  caloriesEst: string;
  days: TrainingDay[];
  hasProgram: boolean;
};

function num(value: string | undefined): number {
  const n = Number.parseFloat(String(value ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

export const planService = {
  /**
   * Compone el resumen del plan del alumno autenticado (programa asignado +
   * evaluacion + calorias estimadas). Informativo; no promete resultados.
   */
  async getPlanForUser(userId: string): Promise<PlanSummary | null> {
    const client = await clientRepository.findByUserId(userId);
    if (!client) return null;

    const evaluation = client.evaluation;
    const programId = await trainingProgramRepository.getAssignment(client.id);
    const program = programId
      ? await trainingProgramRepository.getProgram(programId)
      : null;

    const planName =
      program?.name ?? evaluation?.recommendedPlan ?? "Tu plan de entrenamiento";
    const level = program?.level || evaluation?.level || "—";
    const duration = program?.duration || "—";
    const weeksParsed = Number.parseInt(duration, 10);
    const weeks = Number.isFinite(weeksParsed) && weeksParsed > 0 ? weeksParsed : 8;
    const mainZone =
      evaluation?.focusZone ||
      evaluation?.objective ||
      program?.days[0]?.name?.split("·").pop()?.trim() ||
      "General";

    const heightCm = num(evaluation?.height);
    const weightKg = num(evaluation?.weight);
    const caloriesEst =
      heightCm > 0 && weightKg > 0
        ? `${
            metricsService.compute({
              weightKg,
              heightCm,
              age: num(evaluation?.age) || 30,
              sex: evaluation?.sex ?? "",
              targetKg: num(evaluation?.targetWeight) || weightKg,
            }).calories
          } kcal/día`
        : "—";

    return {
      planName,
      mainZone,
      level,
      duration,
      weeks,
      caloriesEst,
      days: program?.days ?? [],
      hasProgram: Boolean(program),
    };
  },
};
