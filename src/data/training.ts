import type { TrainingProgram } from "@/types";

/**
 * Programas de entrenamiento iniciales (seed). El coach los edita en `/admin` y
 * se persisten en `localStorage`. Cada ejercicio referencia (por `exerciseId`) un
 * ejercicio de la biblioteca (`src/data/exercise-library.ts`) para mostrar su
 * ficha completa al alumno. Se asigna al alumno demo (`c-demo`).
 */
export const trainingProgramsSeed: TrainingProgram[] = [
  {
    id: "tp-hipertrofia",
    name: "Hipertrofia 3 días",
    objective: "Ganar músculo",
    level: "Intermedio",
    duration: "8 semanas",
    notes:
      "Progresión de cargas semanal. Prioriza la técnica antes que el peso y descansa bien entre sesiones.",
    days: [
      {
        id: "tp-h-d1",
        name: "Día 1 · Pecho y tríceps",
        exercises: [
          { id: "ex-h1-1", exerciseId: "lib-press-banca", name: "Press banca", sets: "4", reps: "8-10", rest: "90 s", notes: "Controla la bajada" },
          { id: "ex-h1-2", exerciseId: "lib-press-inclinado", name: "Press inclinado mancuernas", sets: "3", reps: "10-12", rest: "75 s", notes: "" },
          { id: "ex-h1-3", exerciseId: "lib-fondos", name: "Fondos en paralelas", sets: "3", reps: "10", rest: "60 s", notes: "Asistidos si hace falta" },
          { id: "ex-h1-4", exerciseId: "lib-ext-triceps", name: "Extensión de tríceps en polea", sets: "3", reps: "12-15", rest: "45 s", notes: "" },
        ],
      },
      {
        id: "tp-h-d2",
        name: "Día 2 · Espalda y bíceps",
        exercises: [
          { id: "ex-h2-1", exerciseId: "lib-dominadas", name: "Dominadas", sets: "4", reps: "6-8", rest: "90 s", notes: "Agarre prono" },
          { id: "ex-h2-2", exerciseId: "lib-remo-barra", name: "Remo con barra", sets: "4", reps: "8-10", rest: "90 s", notes: "Espalda neutra" },
          { id: "ex-h2-3", exerciseId: "lib-jalon", name: "Jalón al pecho", sets: "3", reps: "10-12", rest: "60 s", notes: "" },
          { id: "ex-h2-4", exerciseId: "lib-curl-biceps", name: "Curl de bíceps con barra", sets: "3", reps: "10-12", rest: "45 s", notes: "" },
        ],
      },
      {
        id: "tp-h-d3",
        name: "Día 3 · Pierna y core",
        exercises: [
          { id: "ex-h3-1", exerciseId: "lib-sentadilla", name: "Sentadilla", sets: "4", reps: "8-10", rest: "120 s", notes: "Profundidad completa" },
          { id: "ex-h3-2", exerciseId: "lib-peso-muerto-rumano", name: "Peso muerto rumano", sets: "3", reps: "10", rest: "90 s", notes: "" },
          { id: "ex-h3-3", exerciseId: "lib-prensa", name: "Prensa de pierna", sets: "3", reps: "12", rest: "75 s", notes: "" },
          { id: "ex-h3-4", exerciseId: "lib-plancha", name: "Plancha", sets: "3", reps: "45 s", rest: "30 s", notes: "Abdomen firme" },
        ],
      },
    ],
  },
];

/** Asignaciones iniciales: clientId -> programId. */
export const programAssignmentsSeed: Record<string, string> = {
  "c-demo": "tp-hipertrofia",
};
