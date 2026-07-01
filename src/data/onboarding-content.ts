import type {
  OnboardingMessage,
  OnboardingPrediction,
  OnboardingReward,
} from "@/types";

/**
 * Seeds INICIALES (demo) del contenido del onboarding. Solo siembran las colecciones
 * la primera vez; a partir de ahi el coach administra todo desde `/admin` (CRUD +
 * publicar/despublicar) y los datos viven en `localStorage`. No son contenido
 * definitivo: cualquier item puede editarse o eliminarse desde el panel.
 *
 * `category` de los mensajes y `objective` de las predicciones usan las etiquetas de
 * objetivo del onboarding (`OBJECTIVES` en `src/data/onboarding.ts`) o "General".
 */

export const onboardingMessagesSeed: OnboardingMessage[] = [
  { id: "om-bienvenida", message: "Cada respuesta nos acerca a tu mejor versión. Vamos paso a paso.", category: "General", published: true },
  { id: "om-constancia", message: "No buscamos perfección, buscamos constancia. Tú puedes con esto.", category: "General", published: true },
  { id: "om-grasa", message: "Perder grasa es un maratón, no un sprint: lo haremos sostenible.", category: "Perder grasa", published: true },
  { id: "om-musculo", message: "El músculo se construye con paciencia y buena técnica. Estás en el lugar correcto.", category: "Ganar músculo", published: true },
];

export const onboardingRewardsSeed: OnboardingReward[] = [
  { id: "or-plan", title: "Plan 100% personalizado", description: "Un programa diseñado para tu objetivo, nivel y disponibilidad.", icon: "target", published: true },
  { id: "or-seguimiento", title: "Seguimiento de tu coach", description: "Acompañamiento y ajustes según tu progreso real.", icon: "trophy", published: true },
  { id: "or-comunidad", title: "Acceso a tu espacio premium", description: "Rutinas, nutrición y progreso en un solo lugar.", icon: "sparkles", published: true },
];

export const onboardingPredictionsSeed: OnboardingPrediction[] = [
  { id: "op-grasa", objective: "Perder grasa", title: "Tu transformación proyectada", body: "Con constancia en tu plan y nutrición, es realista ver una reducción notable de grasa y más energía diaria.", timeframe: "12 semanas", published: true },
  { id: "op-musculo", objective: "Ganar músculo", title: "Tu potencial de crecimiento", body: "Con progresión de cargas y descanso adecuado, puedes ganar masa muscular visible y más fuerza.", timeframe: "12 semanas", published: true },
  { id: "op-tonificar", objective: "Tonificar", title: "Tu versión más definida", body: "Combinando fuerza y hábitos, lograrás un cuerpo más firme y tonificado de forma progresiva.", timeframe: "8 semanas", published: true },
  { id: "op-general", objective: "General", title: "Tu mejor versión, paso a paso", body: "Con un plan estructurado y acompañamiento, los resultados llegan cuando la constancia se vuelve hábito.", timeframe: "8–12 semanas", published: true },
];
