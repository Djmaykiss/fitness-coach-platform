import type { ClientProgress } from "@/types";

/**
 * Semillas del dashboard. Las estadisticas del admin (totales) se derivan
 * contando las colecciones persistidas, asi que no se guardan aqui.
 *
 * El progreso se guarda como datos planos (sin iconos, que no son
 * serializables) y se indexa por id de cliente. Los iconos se asignan en la UI.
 */

/** Numero de llamadas agendadas mostrado en el admin (estatico por ahora). */
export const SCHEDULED_CALLS = "18";

/** Progreso del cliente demo (`c-demo`). */
export const defaultClientProgress: ClientProgress = {
  programa: "Transformacion 12 semanas",
  semanaActual: 4,
  semanasTotales: 12,
  progresoPct: 33,
  pesoInicial: "86 kg",
  pesoActual: "80.4 kg",
  objetivo: "76 kg",
  adherencia: "88%",
  tasks: [
    "Completar 4 sesiones de fuerza esta semana",
    "Registrar peso lunes y jueves",
    "Enviar fotos de progreso el viernes",
    "Caminar 8,000 pasos diarios",
  ],
};

/** Progreso inicial para un alumno recien creado o registrado. */
export const starterClientProgress: ClientProgress = {
  programa: "Sin asignar",
  semanaActual: 0,
  semanasTotales: 0,
  progresoPct: 0,
  pesoInicial: "-",
  pesoActual: "-",
  objetivo: "-",
  adherencia: "0%",
  tasks: [
    "Completa tu evaluacion inicial",
    "Agenda tu primera llamada con el coach",
  ],
};

/** Progreso inicial sembrado, indexado por id de cliente. */
export const seedProgress: Record<string, ClientProgress> = {
  "c-demo": defaultClientProgress,
  "c-a": {
    programa: "Transformacion",
    semanaActual: 8,
    semanasTotales: 12,
    progresoPct: 68,
    pesoInicial: "92 kg",
    pesoActual: "85 kg",
    objetivo: "82 kg",
    adherencia: "90%",
    tasks: ["Registrar peso 2 veces", "Completar sesiones de la semana"],
  },
  "c-b": {
    programa: "Fuerza Base",
    semanaActual: 4,
    semanasTotales: 8,
    progresoPct: 44,
    pesoInicial: "78 kg",
    pesoActual: "79 kg",
    objetivo: "84 kg",
    adherencia: "82%",
    tasks: ["Subir cargas progresivamente", "Dormir 7-8 horas"],
  },
  "c-c": {
    programa: "Performance",
    semanaActual: 6,
    semanasTotales: 8,
    progresoPct: 81,
    pesoInicial: "80 kg",
    pesoActual: "80 kg",
    objetivo: "80 kg",
    adherencia: "95%",
    tasks: ["Mantener movilidad diaria", "Revisar tecnica en video"],
  },
};
