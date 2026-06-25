import type { Client } from "@/types";

/**
 * Clientes/alumnos iniciales. `c-demo` esta enlazado al usuario demo
 * (`user-cliente`) para que su dashboard refleje el progreso que edita el admin.
 */
export const clients: Client[] = [
  { id: "c-demo", name: "Cliente Demo", status: "Activo", userId: "user-cliente" },
  { id: "c-a", name: "Cliente A", status: "Activo" },
  { id: "c-b", name: "Cliente B", status: "Activo" },
  { id: "c-c", name: "Cliente C", status: "Revision" },
];
