import type {
  DiscoverArticle,
  DiscoverCategory,
  DiscoverRoutine,
} from "@/types";

/**
 * Seeds INICIALES (demo) de la seccion "Descubre". Solo siembran las colecciones
 * la primera vez; a partir de ahi el coach administra todo desde `/admin` (CRUD +
 * publicar/despublicar) y los datos viven en `localStorage`. No son contenido
 * definitivo: cualquier item puede editarse o eliminarse desde el panel.
 */

export const discoverRoutinesSeed: DiscoverRoutine[] = [
  { id: "dr-full-express", name: "Full Body Express", category: "Cuerpo completo", level: "Intermedio", duration: "6 semanas", minutes: "30 min", description: "Rutina integral para todo el cuerpo en poco tiempo.", image: "", published: true },
  { id: "dr-abs-core", name: "Core & Abdomen", category: "Abdominales", level: "Principiante", duration: "4 semanas", minutes: "20 min", description: "Fortalece y define tu zona media.", image: "", published: true },
  { id: "dr-push-pecho", name: "Pecho de Acero", category: "Pecho", level: "Intermedio", duration: "8 semanas", minutes: "45 min", description: "Empuje y desarrollo del pectoral.", image: "", published: true },
  { id: "dr-espalda-v", name: "Espalda en V", category: "Hombros y espalda", level: "Avanzado", duration: "8 semanas", minutes: "50 min", description: "Tracciones y postura para una espalda amplia.", image: "", published: true },
  { id: "dr-pierna-fuerza", name: "Pierna y Fuerza", category: "Piernas", level: "Intermedio", duration: "8 semanas", minutes: "55 min", description: "Tren inferior y fuerza.", image: "", published: true },
];

export const discoverCategoriesSeed: DiscoverCategory[] = [
  { id: "dc-full", label: "Cuerpo completo", description: "Entrenamientos integrales para todo el cuerpo.", icon: "dumbbell", muscleGroups: ["Pecho", "Espalda", "Pierna", "Core", "Isquiotibiales"], published: true },
  { id: "dc-abs", label: "Abdominales", description: "Fortalece y define tu zona media.", icon: "flame", muscleGroups: ["Core"], published: true },
  { id: "dc-pecho", label: "Pecho", description: "Empuje y desarrollo del pectoral.", icon: "activity", muscleGroups: ["Pecho"], published: true },
  { id: "dc-espalda", label: "Hombros y espalda", description: "Tracciones y postura.", icon: "target", muscleGroups: ["Espalda", "Hombro"], published: true },
  { id: "dc-pierna", label: "Piernas", description: "Tren inferior y fuerza.", icon: "zap", muscleGroups: ["Pierna", "Isquiotibiales"], published: true },
];

export const discoverArticlesSeed: DiscoverArticle[] = [
  { id: "da-proteina", title: "¿Cuánta proteína necesitas al día?", category: "Nutrición", readTime: "4 min", content: "Guía práctica para calcular tu ingesta según tu objetivo. Un punto de partida habitual es 1.6-2.2 g de proteína por kg de peso corporal, ajustando según tu progreso y tu coach.", image: "", published: true },
  { id: "da-descanso", title: "Por qué el descanso también entrena", category: "Recuperación", readTime: "3 min", content: "El músculo crece cuando descansas: prioriza el sueño y respeta tus días de recuperación para rendir mejor y evitar lesiones.", image: "", published: true },
  { id: "da-tecnica", title: "5 errores comunes de técnica", category: "Entrenamiento", readTime: "5 min", content: "Corrige estos fallos para entrenar más seguro y efectivo: rango incompleto, exceso de peso, impulso, falta de control excéntrico y mala respiración.", image: "", published: true },
  { id: "da-habitos", title: "Hábitos que sostienen el progreso", category: "Hábitos", readTime: "4 min", content: "Pequeños cambios diarios que marcan la diferencia a largo plazo: constancia, hidratación, planificar comidas y registrar tus entrenamientos.", image: "", published: true },
];
