/**
 * Utilidades del modo entrenamiento (sin dependencias). Se usan en la UI de la
 * sesion y en el resumen; no tocan datos ni repositorios.
 */

/** Segundos a partir de un texto ("45 s", "90", "1:30"). Devuelve `fallback` si no aplica. */
export function parseSeconds(value: string, fallback: number): number {
  if (!value) return fallback;
  const clock = value.match(/(\d+):(\d{1,2})/);
  if (clock) return Number(clock[1]) * 60 + Number(clock[2]);
  const n = Number.parseInt(value.replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** Estimacion informativa de calorias por minutos de sesion (~8 kcal/min). */
export function estimateSessionCalories(durationSec: number): number {
  const minutes = durationSec / 60;
  return Math.max(0, Math.round(minutes * 8));
}

/** Formatea segundos como mm:ss. */
export function formatClock(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

/** Formatea una duracion en minutos legibles ("48 min"). */
export function formatMinutes(totalSec: number): string {
  return `${Math.max(0, Math.round(totalSec / 60))} min`;
}
