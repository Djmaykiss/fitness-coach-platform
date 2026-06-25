import type { Program, ProgramRow } from "@/types";

/** Programas mostrados en la landing. */
export const programs: Program[] = [
  {
    title: "Base Fitness",
    duration: "8 semanas",
    level: "Principiante - Intermedio",
    idealFor: "personas que quieren empezar con estructura",
    points: [
      "Rutina progresiva",
      "Guía de hábitos",
      "Seguimiento semanal",
      "Ajustes por nivel",
    ],
  },
  {
    title: "Transformación 12 Semanas",
    duration: "12 semanas",
    level: "Intermedio",
    idealFor: "perder grasa y mejorar composición corporal",
    points: [
      "Plan de entrenamiento",
      "Plan nutricional flexible",
      "Check-ins semanales",
      "Métricas de progreso",
    ],
  },
  {
    title: "Coaching Performance",
    duration: "Mensual",
    level: "Avanzado",
    idealFor: "personas que buscan rendimiento, fuerza y seguimiento cercano",
    points: [
      "Periodización",
      "Análisis de cargas",
      "Seguimiento directo",
      "Ajustes semanales",
    ],
  },
];

/** Programas en el panel de administración. */
export const programRows: ProgramRow[] = [
  { name: "Fuerza Base", clients: "8", duration: "8 semanas", status: "Activo" },
  { name: "Transformación", clients: "12", duration: "12 semanas", status: "Activo" },
  { name: "Performance", clients: "4", duration: "Mensual", status: "Activo" },
];
