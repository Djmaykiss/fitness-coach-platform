/**
 * Selección temporal de plan comercial entre la landing y el registro/evaluación.
 *
 * Cuando el visitante pulsa el botón de un plan en la landing, guardamos `{planId,
 * planName}` aquí (localStorage, seguro en SSR). Al crear la cuenta (registro) se lee
 * para asignar el plan al alumno (`client_plans`) y luego se limpia. Es estado efímero
 * de UI (equivalente a un `?planId=` en la URL), NO una entidad de dominio.
 */

const KEY = "coach-fitness:selected-plan";

export type SelectedPlan = { planId: string; planName: string };

const isBrowser = () => typeof window !== "undefined";

export function setSelectedPlan(plan: SelectedPlan): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(plan));
  } catch {
    // Ignorar (modo privado / cuota).
  }
}

export function getSelectedPlan(): SelectedPlan | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SelectedPlan;
    return parsed && parsed.planId ? parsed : null;
  } catch {
    return null;
  }
}

export function clearSelectedPlan(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Ignorar.
  }
}
