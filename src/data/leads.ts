import type { Lead } from "@/types";

/** Leads iniciales (sembrados). Los nuevos se crean desde el formulario de la landing. */
export const leads: Lead[] = [
  {
    id: "lead-a",
    name: "Lucía G.",
    email: "lucia.g@example.com",
    phone: "+1 555 0101",
    objective: "Recomposición corporal",
    message: "",
    source: "Instagram",
    status: "Nuevo",
    createdAt: "2026-06-22T00:00:00.000Z",
  },
  {
    id: "lead-b",
    name: "Pedro M.",
    email: "pedro.m@example.com",
    phone: "+1 555 0102",
    objective: "Fuerza",
    message: "Quiero empezar lo antes posible.",
    source: "Formulario",
    status: "Contactado",
    createdAt: "2026-06-18T00:00:00.000Z",
  },
  {
    id: "lead-c",
    name: "Sofía R.",
    email: "sofia.r@example.com",
    phone: "+1 555 0103",
    objective: "Perder grasa",
    message: "",
    source: "Referido",
    status: "Descartado",
    createdAt: "2026-06-10T00:00:00.000Z",
  },
];
