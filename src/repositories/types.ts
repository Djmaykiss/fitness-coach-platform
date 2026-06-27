import type {
  Benefit,
  ChecklistChecks,
  Client,
  ClientProgress,
  CreateClientInput,
  CreateEvaluationLeadInput,
  CreateLeadInput,
  CreateProgramInput,
  CreateProgressPhoto,
  Credentials,
  Lead,
  LeadStatus,
  NavLink,
  PendingOnboarding,
  Program,
  ProgramRow,
  ProgressPhoto,
  RegisterInput,
  Testimonial,
  Transformation,
  User,
} from "@/types";

/**
 * Contratos de acceso a datos.
 *
 * - Contenido de marketing (programas, testimonios, transformaciones, beneficios)
 *   se sirve estatico desde `src/data` (lo consume la landing en el servidor).
 * - Datos operativos (usuarios, clientes, leads, programas del panel y progreso)
 *   se persisten en `localStorage` mediante las implementaciones `Local*`.
 *
 * La UI nunca conoce la implementacion concreta; para migrar a una base de datos
 * se crean nuevas clases que cumplan estas interfaces y se cambian en
 * `repositories/index.ts`.
 */

export interface ProgramRepository {
  getPrograms(): Promise<Program[]>;
  getProgramRows(): Promise<ProgramRow[]>;
  createProgramRow(input: CreateProgramInput): Promise<ProgramRow>;
}

export interface TestimonialRepository {
  getTestimonials(): Promise<Testimonial[]>;
}

export interface TransformationRepository {
  getTransformations(): Promise<Transformation[]>;
}

export interface ContentRepository {
  getBenefits(): Promise<Benefit[]>;
  getNavLinks(): Promise<NavLink[]>;
}

export interface ClientRepository {
  getClients(): Promise<Client[]>;
  findByUserId(userId: string): Promise<Client | null>;
  createClient(input: CreateClientInput): Promise<Client>;
  updateClient(
    id: string,
    patch: Partial<Omit<Client, "id">>,
  ): Promise<Client | null>;
}

export interface LeadRepository {
  getLeads(): Promise<Lead[]>;
  createLead(input: CreateLeadInput): Promise<Lead>;
  createEvaluationLead(input: CreateEvaluationLeadInput): Promise<Lead>;
  updateStatus(id: string, status: LeadStatus): Promise<Lead | null>;
}

/** Onboarding pendiente: se guarda al terminar el wizard y se consume en el registro. */
export interface PendingEvaluationRepository {
  get(): Promise<PendingOnboarding | null>;
  save(data: PendingOnboarding): Promise<void>;
  clear(): Promise<void>;
}

export interface ProgressRepository {
  getForClient(clientId: string): Promise<ClientProgress>;
  saveForClient(
    clientId: string,
    progress: ClientProgress,
  ): Promise<ClientProgress>;
}

export interface UserRepository {
  findByCredentials(credentials: Credentials): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(input: RegisterInput): Promise<User>;
}

/**
 * Datos interactivos del dashboard premium del alumno (persistidos por cliente):
 * fotos de progreso y estado de los checklists (objetivos, nutricion, recordatorios).
 */
export interface CoachingRepository {
  getPhotos(clientId: string): Promise<ProgressPhoto[]>;
  addPhoto(clientId: string, photo: CreateProgressPhoto): Promise<ProgressPhoto>;
  getChecks(clientId: string): Promise<ChecklistChecks>;
  setCheck(
    clientId: string,
    listKey: string,
    itemKey: string,
    done: boolean,
  ): Promise<ChecklistChecks>;
}
