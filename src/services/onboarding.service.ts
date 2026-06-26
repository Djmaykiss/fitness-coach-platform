import { leadRepository, pendingEvaluationRepository } from "@/repositories";
import { DEFAULT_RECOMMENDATION, PLAN_BY_OBJECTIVE } from "@/data/onboarding";
import type {
  CreateEvaluationLeadInput,
  LeadEvaluation,
  PlanRecommendation,
} from "@/types";

/**
 * Onboarding inteligente. La UI (wizard) consume estos metodos; nunca toca
 * repositorios ni datos directamente.
 */
export const onboardingService = {
  /** Recomienda un plan segun el objetivo (reglas simples, sin IA). */
  recommendPlan(objective: string): PlanRecommendation {
    return PLAN_BY_OBJECTIVE[objective] ?? DEFAULT_RECOMMENDATION;
  },

  /** Guarda la evaluacion completa como un lead (no crea alumno todavia). */
  submitEvaluation(input: CreateEvaluationLeadInput) {
    return leadRepository.createEvaluationLead(input);
  },

  /** Guarda la evaluacion temporalmente para usarla en el registro. */
  savePendingEvaluation(evaluation: LeadEvaluation) {
    return pendingEvaluationRepository.save(evaluation);
  },
};
