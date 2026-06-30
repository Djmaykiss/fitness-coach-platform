/**
 * Configuracion global del coach. UNICA fuente de verdad del contacto: toda la app
 * (botones de contactar / renovar / ayuda, WhatsApp, etc.) lee desde aqui. Al
 * cambiar estos datos se actualizan todos los enlaces de contacto.
 */
export const coachConfig = {
  name: "Cristian Valdez",
  phone: "+1 (786) 870-4262",
  /** Solo digitos, formato internacional para wa.me. */
  whatsapp: "17868704262",
  /** Precio mensual estimado por alumno activo (para ingresos estimados del admin). */
  monthlyPrice: 50,
  currency: "USD",
};

/** Construye un enlace de WhatsApp (wa.me) AL COACH con un mensaje prellenado. */
export function whatsappUrl(message: string): string {
  return `https://wa.me/${coachConfig.whatsapp}?text=${encodeURIComponent(message)}`;
}

/** Solo digitos de un telefono ("+1 (786) 870-4262" -> "17868704262"). */
export function phoneDigits(phone: string): string {
  return (phone || "").replace(/\D/g, "");
}

/**
 * Enlace de WhatsApp a un numero ARBITRARIO (ej. el del lead). Devuelve null si
 * el telefono no tiene digitos suficientes (para deshabilitar el boton).
 */
export function whatsappTo(phone: string, message: string): string | null {
  const digits = phoneDigits(phone);
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
