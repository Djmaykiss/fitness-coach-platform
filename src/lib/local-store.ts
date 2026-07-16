/**
 * Capa de persistencia local sobre `localStorage`.
 *
 * Reemplaza a los datos mock en memoria: ahora las colecciones se guardan en el
 * navegador y sobreviven a recargas. En la primera ejecucion se siembran con los
 * datos de `src/data`.
 *
 * Seguridad SSR: en el servidor `window` no existe, asi que las lecturas
 * devuelven la semilla y las escrituras se ignoran. Por eso solo los componentes
 * cliente consumen los repositorios que dependen de este modulo.
 *
 * MIGRACION FUTURA: para pasar a una base de datos real solo se cambian las
 * implementaciones `Local*Repository` por unas nuevas; este archivo desaparece.
 */
import { isDemoContent } from "@/lib/demo";

export const STORAGE_KEYS = {
  users: "coach-fitness:users",
  clients: "coach-fitness:clients",
  leads: "coach-fitness:leads",
  programs: "coach-fitness:programs",
  progress: "coach-fitness:progress",
  pendingEvaluation: "coach-fitness:pending-evaluation",
  progressPhotos: "coach-fitness:progress-photos",
  checklists: "coach-fitness:checklists",
  trainingPrograms: "coach-fitness:training-programs",
  programAssignments: "coach-fitness:program-assignments",
  workoutProgress: "coach-fitness:workout-progress",
  exerciseLibrary: "coach-fitness:exercise-library",
  exerciseCategories: "coach-fitness:exercise-categories",
  exerciseProgress: "coach-fitness:exercise-progress",
  nutritionPlans: "coach-fitness:nutrition-plans",
  nutritionAssignments: "coach-fitness:nutrition-assignments",
  nutritionProgress: "coach-fitness:nutrition-progress",
  coachingChat: "coach-fitness:chat",
  workoutResults: "coach-fitness:workout-results",
  discoverRoutines: "coach-fitness:discover-routines",
  discoverCategories: "coach-fitness:discover-categories",
  discoverArticles: "coach-fitness:discover-articles",
  onboardingMessages: "coach-fitness:onboarding-messages",
  onboardingRewards: "coach-fitness:onboarding-rewards",
  onboardingPredictions: "coach-fitness:onboarding-predictions",
  settings: "coach-fitness:settings",
  crm: "coach-fitness:crm",
  notificationsRead: "coach-fitness:notifications-read",
  plans: "coach-fitness:plans",
  clientPlans: "coach-fitness:client-plans",
  mediaAssets: "coach-fitness:media-assets",
  testimonials: "coach-fitness:testimonials",
  transformations: "coach-fitness:transformations",
} as const;

const isBrowser = () => typeof window !== "undefined";

/** Lee un valor unico (objeto) o null si no existe. */
export function readValue<T>(key: string): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as T);
  } catch {
    return null;
  }
}

export function writeValue<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* almacenamiento no disponible: se ignora en esta etapa local */
  }
}

export function removeKey(key: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* idem */
  }
}

/** Lee una coleccion (array). Si no existe, la siembra con `seed`. */
export function readCollection<T>(key: string, seed: T[]): T[] {
  if (!isBrowser()) return [...seed];
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) {
      window.localStorage.setItem(key, JSON.stringify(seed));
      return [...seed];
    }
    return JSON.parse(raw) as T[];
  } catch {
    return [...seed];
  }
}

export function writeCollection<T>(key: string, items: T[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(items));
  } catch {
    /* almacenamiento lleno o no disponible: se ignora en esta etapa local */
  }
}

/** Lee un registro (objeto indexado). Si no existe, lo siembra con `seed`. */
export function readRecord<T>(
  key: string,
  seed: Record<string, T>,
): Record<string, T> {
  if (!isBrowser()) return { ...seed };
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) {
      window.localStorage.setItem(key, JSON.stringify(seed));
      return { ...seed };
    }
    return JSON.parse(raw) as Record<string, T>;
  } catch {
    return { ...seed };
  }
}

export function writeRecord<T>(key: string, value: Record<string, T>): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* idem */
  }
}

/**
 * Siembra local GATEADA por contenido demo (Fase 1 · P3). Igual que
 * `readCollection`/`readRecord`, pero SOLO usa el `seed` cuando el contenido demo está
 * activo (`isDemoContent()`); si no (producción / demo off) siembra VACÍO -> el
 * localStorage arranca vacío como una instalación de producción. No borra datos
 * existentes: solo controla la SIEMBRA INICIAL (la primera vez que la clave no existe).
 * Los datos ya guardados por el usuario se leen igual en ambos modos.
 */
export function readSeededCollection<T>(key: string, seed: T[]): T[] {
  return readCollection<T>(key, isDemoContent() ? seed : []);
}

export function readSeededRecord<T>(
  key: string,
  seed: Record<string, T>,
): Record<string, T> {
  return readRecord<T>(key, isDemoContent() ? seed : {});
}
