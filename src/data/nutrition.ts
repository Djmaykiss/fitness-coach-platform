import type { NutritionPlan } from "@/types";

/**
 * Planes de nutricion iniciales (seed). El coach los edita en `/admin` y se
 * persisten en `localStorage`. Se asigna uno al alumno demo (`c-demo`) para que
 * su dashboard muestre contenido real desde el inicio. Macros = objetivo diario.
 */
export const nutritionPlansSeed: NutritionPlan[] = [
  {
    id: "np-recomp",
    name: "Recomposición 2200 kcal",
    objective: "Recomposición corporal",
    calories: "2200 kcal",
    protein: "170 g",
    carbs: "210 g",
    fat: "60 g",
    water: "3 L",
    notes:
      "Prioriza proteína en cada comida y bebe agua a lo largo del día. Ajustaremos según tu progreso semanal.",
    days: [
      {
        id: "np-d1",
        name: "Día estándar",
        meals: [
          { id: "np-m1", name: "Desayuno", description: "Avena con leche, 3 huevos y fruta." },
          { id: "np-m2", name: "Media mañana", description: "Yogur griego con nueces." },
          { id: "np-m3", name: "Almuerzo", description: "Pollo, arroz integral y ensalada." },
          { id: "np-m4", name: "Merienda", description: "Batido de proteína y plátano." },
          { id: "np-m5", name: "Cena", description: "Pescado, papa y vegetales al vapor." },
        ],
      },
      {
        id: "np-d2",
        name: "Día de entrenamiento",
        meals: [
          { id: "np-m6", name: "Pre-entreno", description: "Tostadas integrales con miel y café." },
          { id: "np-m7", name: "Post-entreno", description: "Proteína whey y avena." },
          { id: "np-m8", name: "Almuerzo", description: "Carne magra, pasta integral y verduras." },
          { id: "np-m9", name: "Cena", description: "Tortilla de claras con vegetales." },
        ],
      },
    ],
  },
];

/** Asignaciones iniciales: clientId -> planId. */
export const nutritionAssignmentsSeed: Record<string, string> = {
  "c-demo": "np-recomp",
};
