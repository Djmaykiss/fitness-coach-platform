import type { ExerciseCategory } from "@/types";

/**
 * Categorías de ejercicios (seed local, espejo del bootstrap Supabase
 * `0107_exercise_categories.seed.sql`). El coach las administra desde el panel; en
 * Supabase viven en `exercise_categories`. Ids estables `cat-*` solo para modo local.
 */
export const exerciseCategoriesSeed: ExerciseCategory[] = [
  { id: "cat-piernas", name: "Piernas", icon: "legs", position: 0 },
  { id: "cat-pecho", name: "Pecho", icon: "chest", position: 1 },
  { id: "cat-espalda", name: "Espalda", icon: "back", position: 2 },
  { id: "cat-brazos", name: "Brazos", icon: "arms", position: 3 },
  { id: "cat-hombros", name: "Hombros", icon: "shoulders", position: 4 },
  { id: "cat-core", name: "Core", icon: "core", position: 5 },
  { id: "cat-cardio", name: "Cardio", icon: "cardio", position: 6 },
  { id: "cat-movilidad", name: "Movilidad", icon: "mobility", position: 7 },
];

/** Mapea un grupo muscular (texto libre) a la categoría local por defecto (solo seed). */
export function categoryIdForMuscleGroup(muscleGroup: string): string {
  const m = muscleGroup.toLowerCase();
  if (/pecho|pectoral/.test(m)) return "cat-pecho";
  if (/espalda|dorsal|lat/.test(m)) return "cat-espalda";
  if (/hombro|deltoid/.test(m)) return "cat-hombros";
  if (/b[íi]ceps|tr[íi]ceps|brazo|antebrazo/.test(m)) return "cat-brazos";
  if (/core|abdomen|abdominal|obl[íi]cuo/.test(m)) return "cat-core";
  if (/cardio/.test(m)) return "cat-cardio";
  if (/movilidad|estiramiento|flexib/.test(m)) return "cat-movilidad";
  if (/pierna|cu[áa]driceps|isquio|gl[úu]teo|pantorrilla|femoral/.test(m)) return "cat-piernas";
  return "";
}
