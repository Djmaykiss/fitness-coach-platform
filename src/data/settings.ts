import { coachConfig } from "@/config/coachConfig";
import type { BusinessSettings } from "@/types";

/**
 * Configuracion INICIAL (demo) del negocio. Solo siembra la primera vez; a partir
 * de ahi el coach la administra desde `/admin` y se persiste en `localStorage`.
 * Los valores por defecto vienen de `coachConfig` para no cambiar nada visualmente
 * hasta que el coach personalice su marca.
 */
export const defaultSettings: BusinessSettings = {
  businessName: "Coach Fitness",
  tagline: "Fitness Coaching",
  description:
    "Entrenamiento personalizado, seguimiento semanal y un plan claro para sostener tu progreso.",
  logoUrl: "",
  phone: coachConfig.phone,
  whatsapp: coachConfig.whatsapp,
  email: "",
  address: "",
  schedule: "",
  instagram: "",
  facebook: "",
  tiktok: "",
  youtube: "",
  policies: "",
  terms: "",
  primaryColor: "#65ff4f",
  secondaryColor: "#85ff73",
  monthlyPrice: coachConfig.monthlyPrice,
  currency: coachConfig.currency,
};
