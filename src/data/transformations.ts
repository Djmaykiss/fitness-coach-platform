import type { Transformation } from "@/types";

/**
 * Transformaciones seed — SOLO demo/dev (se siembra gateado por `isDemoContent()`). En
 * producción la org arranca vacía y el coach crea las suyas. No representan personas
 * reales ni usan fotos reales. Forma completa del patrón universal (id/status/position/
 * consentimiento). Las imágenes apuntan a /public (placeholder elegante si no existen).
 */
export const transformations: Transformation[] = [
  {
    id: "tr-demo-1",
    clientName: "Carlos R.",
    title: "Recomposición corporal",
    description: "Fuerza + nutrición flexible, 4 días/semana.",
    result: "-8 kg en 12 semanas",
    duration: "12 semanas",
    beforeMediaId: "",
    afterMediaId: "",
    beforeUrl: "/images/transformations/carlos-before.webp",
    afterUrl: "/images/transformations/carlos-after.webp",
    status: "public",
    position: 0,
    consentConfirmed: true,
  },
  {
    id: "tr-demo-2",
    clientName: "Mariana L.",
    title: "Tonificación y fuerza",
    description: "Técnica + progresión semanal, peso corporal estable.",
    result: "+35% fuerza en 10 semanas",
    duration: "10 semanas",
    beforeMediaId: "",
    afterMediaId: "",
    beforeUrl: "/images/transformations/mariana-before.webp",
    afterUrl: "/images/transformations/mariana-after.webp",
    status: "public",
    position: 1,
    consentConfirmed: true,
  },
  {
    id: "tr-demo-3",
    clientName: "Andrés M.",
    title: "Consistencia",
    description: "Hábitos + seguimiento, 3 entrenamientos/semana.",
    result: "16 semanas sin abandonar",
    duration: "16 semanas",
    beforeMediaId: "",
    afterMediaId: "",
    beforeUrl: "/images/transformations/andres-before.webp",
    afterUrl: "/images/transformations/andres-after.webp",
    status: "public",
    position: 2,
    consentConfirmed: true,
  },
];
