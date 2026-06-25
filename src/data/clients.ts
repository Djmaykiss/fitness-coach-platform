import type { Client } from "@/types";

/**
 * Clientes/alumnos iniciales. `c-demo` esta enlazado al usuario demo
 * (`user-cliente`) para que su dashboard refleje el acceso y el progreso que
 * edita el admin. Se siembran con estados de acceso variados para demostrar el
 * control mensual.
 */
export const clients: Client[] = [
  {
    id: "c-demo",
    name: "Cliente Demo",
    status: "Activo",
    userId: "user-cliente",
    accessStatus: "Activo",
    accessExpiresAt: "2026-07-20T00:00:00.000Z",
    lastPaymentDate: "2026-06-20T00:00:00.000Z",
    paymentMethod: "PayPal",
  },
  {
    id: "c-a",
    name: "Cliente A",
    status: "Activo",
    accessStatus: "Activo",
    accessExpiresAt: "2026-07-10T00:00:00.000Z",
    lastPaymentDate: "2026-06-10T00:00:00.000Z",
    paymentMethod: "Zelle",
  },
  {
    id: "c-b",
    name: "Cliente B",
    status: "Activo",
    accessStatus: "Vencido",
    accessExpiresAt: "2026-05-28T00:00:00.000Z",
    lastPaymentDate: "2026-04-28T00:00:00.000Z",
    paymentMethod: "Transferencia",
  },
  {
    id: "c-c",
    name: "Cliente C",
    status: "Revisión",
    accessStatus: "Pausado",
    accessExpiresAt: "2026-06-15T00:00:00.000Z",
    lastPaymentDate: "2026-05-15T00:00:00.000Z",
    paymentMethod: "Efectivo",
  },
];
