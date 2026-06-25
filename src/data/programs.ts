import type { Program, ProgramRow } from "@/types";

/** Programas mostrados en la landing. */
export const programs: Program[] = [
  {
    title: "Fuerza Base",
    duration: "8 semanas",
    level: "Principiante - Intermedio",
    description:
      "Rutina progresiva para construir tecnica, fuerza y consistencia sin complicar tu agenda.",
    points: ["3-4 sesiones por semana", "Seguimiento semanal", "Ajustes por nivel"],
  },
  {
    title: "Transformacion",
    duration: "12 semanas",
    level: "Intermedio",
    description:
      "Sistema integral para recomposicion corporal con entrenamiento, nutricion y metricas claras.",
    points: ["Check-ins quincenales", "Plan de habitos", "Objetivos medibles"],
  },
  {
    title: "Performance",
    duration: "Mensual",
    level: "Avanzado",
    description:
      "Bloques de entrenamiento para mejorar rendimiento, resistencia y ejecucion tecnica.",
    points: ["Periodizacion", "Analisis de cargas", "Soporte directo"],
  },
];

/** Programas en el panel de administracion. */
export const programRows: ProgramRow[] = [
  { name: "Fuerza Base", clients: "8", duration: "8 semanas", status: "Activo" },
  { name: "Transformacion", clients: "12", duration: "12 semanas", status: "Activo" },
  { name: "Performance", clients: "4", duration: "Mensual", status: "Activo" },
];
