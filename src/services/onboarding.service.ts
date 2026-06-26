import { leadRepository, pendingEvaluationRepository } from "@/repositories";
import { DEFAULT_RECOMMENDATION, PLAN_BY_OBJECTIVE } from "@/data/onboarding";
import type {
  CreateEvaluationLeadInput,
  PendingOnboarding,
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

  /** Guarda el onboarding (nombre + email + evaluacion) para usarlo en el registro. */
  savePending(data: PendingOnboarding) {
    return pendingEvaluationRepository.save(data);
  },

  /** Lee el onboarding pendiente (para prellenar /register). */
  getPending() {
    return pendingEvaluationRepository.get();
  },

  /** Limpia el onboarding pendiente (al entrar a /login para no adjuntarlo mal). */
  clearPending() {
    return pendingEvaluationRepository.clear();
  },
};
