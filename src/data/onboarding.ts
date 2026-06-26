import type { PlanRecommendation } from "@/types";

/**
 * Datos del onboarding inteligente (wizard de evaluacion inicial).
 * Opciones de cada paso + reglas simples de recomendacion de plan.
 * Sin IA ni calculos complejos: solo mapeos directos.
 */

export const SEXES = ["Hombre", "Mujer"];

/** Tipos de cuerpo (paso 3). `image` queda preparado para ilustraciones futuras. */
export const BODY_TYPES: { key: string; label: string; image: string }[] = [
  { key: "muy-delgado", label: "Muy Delgado", image: "/images/onboarding/body-types/muy-delgado.webp" },
  { key: "delgado", label: "Delgado", image: "/images/onboarding/body-types/delgado.webp" },
  { key: "atletico", label: "Atlético", image: "/images/onboarding/body-types/atletico.webp" },
  { key: "promedio", label: "Promedio", image: "/images/onboarding/body-types/promedio.webp" },
  { key: "sobrepeso", label: "Sobrepeso", image: "/images/onboarding/body-types/sobrepeso.webp" },
  { key: "obesidad", label: "Obesidad", image: "/images/onboarding/body-types/obesidad.webp" },
];

/** Objetivos (paso 4). `image` queda preparado para ilustraciones futuras. */
export const OBJECTIVES: { key: string; label: string; image: string }[] = [
  { key: "perder-grasa", label: "Perder grasa", image: "/images/onboarding/goals/perder-grasa.webp" },
  { key: "ganar-musculo", label: "Ganar músculo", image: "/images/onboarding/goals/ganar-musculo.webp" },
  { key: "recomposicion", label: "Recomposición corporal", image: "/images/onboarding/goals/recomposicion.webp" },
  { key: "tonificar", label: "Tonificar", image: "/images/onboarding/goals/tonificar.webp" },
  { key: "condicion", label: "Mejorar condición física", image: "/images/onboarding/goals/condicion.webp" },
  { key: "rendimiento", label: "Rendimiento deportivo", image: "/images/onboarding/goals/rendimiento.webp" },
];

export const LEVELS = ["Principiante", "Intermedio", "Avanzado"];
export const PLACES = ["Gimnasio", "Casa", "Ambos"];
export const AVAILABILITY_DAYS = ["2", "3", "4", "5", "6", "7"];
export const SLEEP_OPTIONS = ["Menos de 5", "5–6", "7–8", "Más de 8"];
export const NUTRITION_OPTIONS = ["Mala", "Regular", "Buena", "Excelente"];

/** Recomendacion de plan segun objetivo (reglas simples). */
export const PLAN_BY_OBJECTIVE: Record<string, PlanRecommendation> = {
  "Perder grasa": { plan: "Transformación 12 Semanas", weeks: "12 semanas" },
  "Ganar músculo": { plan: "Coaching Performance", weeks: "12 semanas" },
  "Recomposición corporal": { plan: "Transformación 12 Semanas", weeks: "12 semanas" },
  Tonificar: { plan: "Base Fitness", weeks: "8 semanas" },
  "Mejorar condición física": { plan: "Base Fitness", weeks: "8 semanas" },
  "Rendimiento deportivo": { plan: "Coaching Performance", weeks: "12 semanas" },
};

export const DEFAULT_RECOMMENDATION: PlanRecommendation = {
  plan: "Base Fitness",
  weeks: "8 semanas",
};
