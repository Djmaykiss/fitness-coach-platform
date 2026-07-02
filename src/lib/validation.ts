/**
 * Validaciones compartidas de formularios (capa de UI). Son puras y sin estado:
 * las usan los formularios del coach y del alumno para impedir datos invalidos
 * antes de llamar a los servicios.
 */

import { youtubeId } from "@/lib/youtube";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Email con forma valida. */
export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

/** true si el texto esta vacio (solo espacios). */
export function isBlank(value: string): boolean {
  return value.trim().length === 0;
}

/** Numero >= 0 (permite vacio = true, para campos opcionales; usar junto a required). */
export function isNonNegativeNumber(value: string): boolean {
  if (value.trim() === "") return true;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0;
}

/** Numero estrictamente positivo (> 0). Vacio se considera valido (opcional). */
export function isPositiveNumber(value: string): boolean {
  if (value.trim() === "") return true;
  const n = Number(value);
  return Number.isFinite(n) && n > 0;
}

/** Entero positivo (series/reps). Vacio se considera valido (opcional). */
export function isPositiveInt(value: string): boolean {
  if (value.trim() === "") return true;
  const n = Number(value);
  return Number.isInteger(n) && n > 0;
}

/**
 * URL http(s) valida. Vacio = true (campo opcional).
 */
export function isValidUrlOrEmpty(value: string): boolean {
  if (value.trim() === "") return true;
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Enlace de video valido: vacio, un YouTube reconocible, o cualquier URL http(s).
 * Se usa en la biblioteca de ejercicios (acepta no-YouTube para abrir en pestaña).
 */
export function isValidVideoOrEmpty(value: string): boolean {
  if (value.trim() === "") return true;
  return Boolean(youtubeId(value)) || isValidUrlOrEmpty(value);
}
