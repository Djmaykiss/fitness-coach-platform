import { settingsRepository } from "@/repositories";
import type { BusinessSettings } from "@/types";

/**
 * Configuracion del negocio (white-label). La UI la lee/edita a traves de este
 * servicio; nunca toca el repositorio directamente. Al migrar a un backend solo
 * cambia la implementacion del repositorio.
 */
export const settingsService = {
  get: () => settingsRepository.get(),
  update: (patch: Partial<BusinessSettings>) => settingsRepository.save(patch),
};

/** Construye un enlace de WhatsApp (wa.me) con un mensaje prellenado. */
export function whatsappLink(whatsapp: string, message: string): string {
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
}
