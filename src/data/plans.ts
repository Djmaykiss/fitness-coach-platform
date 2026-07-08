import type { ClientPlan, Plan } from "@/types";

/**
 * Semilla (demo) de planes comerciales. Solo siembra la primera vez; a partir de ahi
 * el coach los administra desde /admin. No es contenido definitivo.
 */
export const plansSeed: Plan[] = [
  {
    id: "plan-basico",
    name: "Básico",
    priceLabel: "$67–97/mes · o Reto 4 semanas por $97",
    modality: "100% Online",
    idealFor:
      "Personas que quieren comenzar a bajar de peso, crear hábitos saludables y desarrollar constancia.",
    features: [
      "Programa estructurado de 4 semanas (Entrenamiento + Nutrición)",
      "Check-in grupal semanal",
      "Guía de mentalidad",
      "Comunidad privada",
      "Accountability semanal",
      "Sin llamadas individuales",
    ],
    buttonLabel: "Comenzar Ahora",
    color: "#65ff4f",
    image: "",
    recommended: false,
    active: true,
    position: 0,
  },
  {
    id: "plan-intermedio",
    name: "Intermedio",
    priceLabel: "$180–250/mes",
    modality: "100% Online",
    idealFor:
      "Personas que buscan aumentar fuerza, velocidad o masa muscular mediante programación personalizada.",
    features: [
      "Programa 100% personalizado",
      "Actualizaciones cada 2-4 semanas",
      "Check-in 1:1 quincenal",
      "Mensajería directa",
      "Corrección técnica mediante video",
      "Coaching mental mensual",
      "Ajuste nutricional",
    ],
    buttonLabel: "Quiero este plan",
    color: "#1e3a8a",
    image: "",
    recommended: false,
    active: true,
    position: 1,
  },
  {
    id: "plan-elite",
    name: "Elite",
    priceLabel: "$450–650/mes",
    modality: "Online + Eventos Presenciales",
    idealFor:
      "Atletas y personas que desean el máximo nivel de acompañamiento personalizado.",
    features: [
      "Programación totalmente personalizada",
      "Llamada semanal 1:1",
      "Mensajería ilimitada",
      "Coaching mental cada 2 semanas",
      "Nutrición personalizada semanal",
      "Revisión completa de videos",
      "Acceso prioritario al coach",
      "50% de descuento en eventos",
    ],
    buttonLabel: "Ser Leyenda",
    color: "#65ff4f",
    image: "",
    recommended: true,
    active: true,
    position: 2,
  },
];

/** Demo: el alumno de ejemplo (`c-demo`) tiene el plan Básico contratado. */
export const clientPlansSeed: Record<string, ClientPlan> = {
  "c-demo": {
    planId: "plan-basico",
    planName: "Básico",
    status: "Activo",
    startDate: new Date().toISOString(),
    renewalDate: new Date(Date.now() + 30 * 864e5).toISOString(),
  },
};
