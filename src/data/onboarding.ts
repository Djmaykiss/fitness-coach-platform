import type { PlanRecommendation } from "@/types";

/**
 * Datos del onboarding inteligente (wizard de evaluacion inicial).
 * Opciones de cada paso + reglas simples de recomendacion de plan.
 * Sin IA ni calculos complejos: solo mapeos directos.
 */

export const SEXES = ["Hombre", "Mujer"];

/** Tipos de cuerpo (paso 3). `image` -> ilustracion vectorial (con fallback). */
export const BODY_TYPES: { key: string; label: string; image: string }[] = [
  { key: "muy-delgado", label: "Muy Delgado", image: "/images/onboarding/body-types/muy-delgado.svg" },
  { key: "delgado", label: "Delgado", image: "/images/onboarding/body-types/delgado.svg" },
  { key: "atletico", label: "Atlético", image: "/images/onboarding/body-types/atletico.svg" },
  { key: "promedio", label: "Promedio", image: "/images/onboarding/body-types/promedio.svg" },
  { key: "sobrepeso", label: "Sobrepeso", image: "/images/onboarding/body-types/sobrepeso.svg" },
  { key: "obesidad", label: "Obesidad", image: "/images/onboarding/body-types/obesidad.svg" },
];

/** Objetivos (paso 4). `image` -> ilustracion vectorial (con fallback). */
export const OBJECTIVES: { key: string; label: string; image: string }[] = [
  { key: "perder-grasa", label: "Perder grasa", image: "/images/onboarding/goals/perder-grasa.svg" },
  { key: "ganar-musculo", label: "Ganar músculo", image: "/images/onboarding/goals/ganar-musculo.svg" },
  { key: "recomposicion", label: "Recomposición corporal", image: "/images/onboarding/goals/recomposicion.svg" },
  { key: "tonificar", label: "Tonificar", image: "/images/onboarding/goals/tonificar.svg" },
  { key: "condicion", label: "Mejorar condición física", image: "/images/onboarding/goals/condicion.svg" },
  { key: "rendimiento", label: "Rendimiento deportivo", image: "/images/onboarding/goals/rendimiento.svg" },
];

export const LEVELS = ["Principiante", "Intermedio", "Avanzado"];
export const PLACES = ["Gimnasio", "Casa", "Ambos"];

/** Niveles (paso 5) con ilustracion. El valor guardado sigue siendo `label`. */
export const LEVEL_OPTIONS: { key: string; label: string; image: string }[] = [
  { key: "principiante", label: "Principiante", image: "/images/onboarding/levels/principiante.svg" },
  { key: "intermedio", label: "Intermedio", image: "/images/onboarding/levels/intermedio.svg" },
  { key: "avanzado", label: "Avanzado", image: "/images/onboarding/levels/avanzado.svg" },
];

/** Lugar de entrenamiento (paso 5) con ilustracion. El valor guardado es `label`. */
export const PLACE_OPTIONS: { key: string; label: string; image: string }[] = [
  { key: "gimnasio", label: "Gimnasio", image: "/images/onboarding/places/gimnasio.svg" },
  { key: "casa", label: "Casa", image: "/images/onboarding/places/casa.svg" },
  { key: "ambos", label: "Ambos", image: "/images/onboarding/places/ambos.svg" },
];
export const AVAILABILITY_DAYS = ["2", "3", "4", "5", "6", "7"];
export const SLEEP_OPTIONS = ["Menos de 5", "5–6", "7–8", "Más de 8"];
export const NUTRITION_OPTIONS = ["Mala", "Regular", "Buena", "Excelente"];

/* Opciones del formulario de salud y alimentacion (paso de antecedentes/nutricion) */
export const YES_NO = ["Sí", "No"];
export const SEAFOOD_OPTIONS = ["Pescados", "Mariscos", "Ambos", "Ninguno"];
export const DAIRY_OPTIONS = ["Sí", "No", "Intolerante a la lactosa"];
export const RICE_OPTIONS = ["Sí", "No", "Integral"];
export const BREAD_OPTIONS = ["Blanco", "Integral", "Ambos", "Ninguno"];

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
