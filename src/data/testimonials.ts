import type { Testimonial } from "@/types";

/**
 * Testimonios seed — SOLO demo/dev (se siembra gateado por `isDemoContent()`). En
 * producción la org arranca vacía y el coach crea los suyos. No representan personas
 * reales. Forma completa del patrón universal (id/status/position).
 */
export const testimonials: Testimonial[] = [
  {
    id: "tm-demo-1",
    name: "Carlos R.",
    role: "Profesional ocupado",
    result: "-8 kg",
    quote:
      "Lo que más me ayudó fue tener una estructura clara. Antes entrenaba sin saber si avanzaba, ahora sé exactamente qué hacer cada semana.",
    imageMediaId: "",
    imageUrl: "",
    status: "public",
    position: 0,
  },
  {
    id: "tm-demo-2",
    name: "Mariana L.",
    role: "Entrenamiento de fuerza",
    result: "+35% fuerza",
    quote:
      "Me gustó que el plan no fue extremo. Pude seguir entrenando, comer normal y aún así ver cambios reales.",
    imageMediaId: "",
    imageUrl: "",
    status: "public",
    position: 1,
  },
  {
    id: "tm-demo-3",
    name: "Andrés M.",
    role: "Cambio de hábitos",
    result: "16 semanas",
    quote:
      "Yo siempre empezaba y abandonaba. Esta vez el seguimiento semanal me ayudó a mantenerme constante.",
    imageMediaId: "",
    imageUrl: "",
    status: "public",
    position: 2,
  },
];
