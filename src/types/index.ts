import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

export type IconComponent = ComponentType<LucideProps>;

/* ---------- Auth / usuarios ---------- */

export type Role = "admin" | "client";

/**
 * Usuario completo tal como vive en la "base de datos" mock.
 * NOTA: el password en texto plano existe SOLO porque es data simulada.
 * Al migrar a Supabase, la autenticacion la maneja el proveedor y este
 * campo desaparece.
 */
export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
};

/** Usuario expuesto a la UI (sin credenciales). */
export type AuthUser = Omit<User, "password">;

export type RegisterInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type Credentials = {
  email: string;
  password: string;
};

/* ---------- Dominio landing ---------- */

export type Program = {
  title: string;
  duration: string;
  level: string;
  idealFor: string;
  points: string[];
};

export type Transformation = {
  name: string;
  objective: string;
  result: string;
  before: string;
  after: string;
  /** Rutas en /public. Si la imagen no existe aun, se muestra un placeholder. */
  beforeImage: string;
  afterImage: string;
  details: string[];
};

export type Testimonial = {
  name: string;
  role: string;
  result: string;
  quote: string;
};

export type Benefit = {
  icon: IconComponent;
  title: string;
  description: string;
};

export type NavLink = {
  label: string;
  href: string;
};

/* ---------- Dominio dashboards ---------- */

export type DashboardStat = {
  label: string;
  value: string;
  icon?: IconComponent;
};

/** Estado de acceso mensual del alumno (control manual del coach). */
export type AccessStatus = "Activo" | "Vencido" | "Pausado";

/** Cliente/alumno persistido. `userId` lo enlaza con un usuario que inicia sesion. */
export type Client = {
  id: string;
  name: string;
  status: string;
  userId?: string;
  /** Control de acceso mensual (gestionado manualmente desde /admin). */
  accessStatus: AccessStatus;
  accessExpiresAt: string | null;
  lastPaymentDate: string | null;
  paymentMethod: string | null;
};

export type CreateClientInput = {
  name: string;
  status: string;
  userId?: string;
};

/** Fila de cliente para la tabla del admin (cliente + datos derivados del progreso). */
export type AdminClientRow = {
  id: string;
  name: string;
  status: string;
  programa: string;
  progresoPct: number;
  accessStatus: AccessStatus;
  accessExpiresAt: string | null;
};

export type LeadRow = {
  name: string;
  source: string;
  interest: string;
  status: string;
};

export type ProgramRow = {
  name: string;
  clients: string;
  duration: string;
  status: string;
};

export type CreateProgramInput = {
  name: string;
  duration: string;
  status: string;
};

/** Progreso basico del cliente (persistido por usuario). */
export type ClientProgress = {
  programa: string;
  semanaActual: number;
  semanasTotales: number;
  progresoPct: number;
  pesoInicial: string;
  pesoActual: string;
  objetivo: string;
  adherencia: string;
  tasks: string[];
};
