import type { User } from "@/types";

/**
 * Usuarios demo (mock authentication).
 *
 *   Administrador -> admin@coach.com / 123456
 *   Cliente       -> cliente@coach.com / 123456
 *
 * Esta es la unica "tabla de usuarios" en esta etapa. Al migrar a Supabase
 * este arreglo se reemplaza por la tabla real y los repositorios cambian de
 * implementacion sin tocar la UI.
 */
export const users: User[] = [
  {
    id: "user-admin",
    firstName: "Coach",
    lastName: "Admin",
    email: "admin@coach.com",
    password: "123456",
    role: "admin",
  },
  {
    id: "user-cliente",
    firstName: "Cliente",
    lastName: "Demo",
    email: "cliente@coach.com",
    password: "123456",
    role: "client",
  },
];
