import type {
  DiscoverArticle,
  DiscoverCategory,
  DiscoverRoutine,
} from "@/types";

/**
 * Contenido de la seccion "Descubre" (rutinas destacadas, categorias por zona y
 * articulos). Seeds locales; se sirven via `discoverService`. No representan
 * datos reales de clientes y las imagenes quedan vacias (placeholder via onError).
 */

export const discoverRoutinesSeed: DiscoverRoutine[] = [
  { id: "dr-full-express", name: "Full Body Express", zone: "Cuerpo completo", level: "Intermedio", duration: "6 semanas", minutes: "30 min", image: "" },
  { id: "dr-abs-core", name: "Core & Abdomen", zone: "Abdominales", level: "Principiante", duration: "4 semanas", minutes: "20 min", image: "" },
  { id: "dr-push-pecho", name: "Pecho de Acero", zone: "Pecho", level: "Intermedio", duration: "8 semanas", minutes: "45 min", image: "" },
  { id: "dr-espalda-v", name: "Espalda en V", zone: "Hombros y espalda", level: "Avanzado", duration: "8 semanas", minutes: "50 min", image: "" },
  { id: "dr-pierna-fuerza", name: "Pierna y Fuerza", zone: "Piernas", level: "Intermedio", duration: "8 semanas", minutes: "55 min", image: "" },
];

export const discoverCategoriesSeed: DiscoverCategory[] = [
  { key: "full", label: "Cuerpo completo", muscleGroups: ["Pecho", "Espalda", "Pierna", "Core", "Isquiotibiales"], description: "Entrenamientos integrales para todo el cuerpo." },
  { key: "abs", label: "Abdominales", muscleGroups: ["Core"], description: "Fortalece y define tu zona media." },
  { key: "pecho", label: "Pecho", muscleGroups: ["Pecho"], description: "Empuje y desarrollo del pectoral." },
  { key: "espalda", label: "Hombros y espalda", muscleGroups: ["Espalda", "Hombro"], description: "Tracciones y postura." },
  { key: "pierna", label: "Piernas", muscleGroups: ["Pierna", "Isquiotibiales"], description: "Tren inferior y fuerza." },
];

export const discoverArticlesSeed: DiscoverArticle[] = [
  { id: "da-proteina", title: "¿Cuánta proteína necesitas al día?", category: "Nutrición", readTime: "4 min", summary: "Guía práctica para calcular tu ingesta según tu objetivo." },
  { id: "da-descanso", title: "Por qué el descanso también entrena", category: "Recuperación", readTime: "3 min", summary: "El músculo crece cuando descansas: sueño y días de recuperación." },
  { id: "da-tecnica", title: "5 errores comunes de técnica", category: "Entrenamiento", readTime: "5 min", summary: "Corrige estos fallos para entrenar más seguro y efectivo." },
  { id: "da-habitos", title: "Hábitos que sostienen el progreso", category: "Hábitos", readTime: "4 min", summary: "Pequeños cambios diarios que marcan la diferencia a largo plazo." },
];
