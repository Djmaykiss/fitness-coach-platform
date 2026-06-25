import {
  clientRepository,
  leadRepository,
  programRepository,
  progressRepository,
} from "@/repositories";
import { SCHEDULED_CALLS, starterClientProgress } from "@/data/dashboard";
import type {
  AccessStatus,
  AdminClientRow,
  ClientProgress,
  CreateClientInput,
  CreateProgramInput,
  DashboardStat,
  ProgramRow,
} from "@/types";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export type ClientAccess = {
  accessStatus: AccessStatus;
  accessExpiresAt: string | null;
};

/** Datos del cliente autenticado (resueltos por su usuario enlazado). */
export const clientDashboardService = {
  async getProgressForUser(userId: string): Promise<ClientProgress> {
    const client = await clientRepository.findByUserId(userId);
    if (!client) return starterClientProgress;
    return progressRepository.getForClient(client.id);
  },

  /** Estado de acceso del alumno autenticado (para el aviso del dashboard). */
  async getAccessForUser(userId: string): Promise<ClientAccess | null> {
    const client = await clientRepository.findByUserId(userId);
    if (!client) return null;
    return {
      accessStatus: client.accessStatus ?? "Vencido",
      accessExpiresAt: client.accessExpiresAt ?? null,
    };
  },
};

/** Datos y operaciones del panel de administracion. */
export const adminDashboardService = {
  getPrograms: () => programRepository.getProgramRows(),

  /** Clientes con su programa y progreso derivados (para la tabla del admin). */
  async getClientRows(): Promise<AdminClientRow[]> {
    const clients = await clientRepository.getClients();
    return Promise.all(
      clients.map(async (client) => {
        const progress = await progressRepository.getForClient(client.id);
        return {
          id: client.id,
          name: client.name,
          status: client.status,
          programa: progress.programa,
          progresoPct: progress.progresoPct,
          accessStatus: client.accessStatus ?? "Vencido",
          accessExpiresAt: client.accessExpiresAt ?? null,
        };
      }),
    );
  },

  /** Totales derivados de las colecciones persistidas (se actualizan solos). */
  async getStats(): Promise<DashboardStat[]> {
    const [clients, leads, programs] = await Promise.all([
      clientRepository.getClients(),
      leadRepository.getLeads(),
      programRepository.getProgramRows(),
    ]);
    return [
      { label: "Total clientes", value: String(clients.length) },
      { label: "Leads", value: String(leads.length) },
      { label: "Programas", value: String(programs.length) },
      { label: "Llamadas agendadas", value: SCHEDULED_CALLS },
    ];
  },

  /* ---------- Operaciones (escritura) ---------- */

  createClient: (input: CreateClientInput) =>
    clientRepository.createClient(input),

  updateClient: (
    id: string,
    patch: { name?: string; status?: string },
  ) => clientRepository.updateClient(id, patch),

  createProgram: (input: CreateProgramInput) =>
    programRepository.createProgramRow(input),

  /** Asigna un programa a un alumno (actualiza su progreso). */
  async assignProgram(clientId: string, program: ProgramRow) {
    const current = await progressRepository.getForClient(clientId);
    const totalFromDuration = Number.parseInt(program.duration, 10);
    const next: ClientProgress = {
      ...current,
      programa: program.name,
      semanasTotales:
        Number.isFinite(totalFromDuration) && totalFromDuration > 0
          ? totalFromDuration
          : current.semanasTotales || 8,
      semanaActual: current.semanaActual > 0 ? current.semanaActual : 1,
    };
    return progressRepository.saveForClient(clientId, next);
  },

  /** Lee el progreso de un alumno (para precargar el formulario). */
  getProgress: (clientId: string) => progressRepository.getForClient(clientId),

  /** Edita el progreso basico de un alumno. */
  async updateProgress(clientId: string, patch: Partial<ClientProgress>) {
    const current = await progressRepository.getForClient(clientId);
    return progressRepository.saveForClient(clientId, { ...current, ...patch });
  },

  /* ---------- Control de acceso mensual ---------- */

  /** Renueva el acceso 30 dias y registra el metodo de pago usado. */
  renewAccess(clientId: string, paymentMethod: string) {
    const now = new Date();
    const expires = new Date(now.getTime() + THIRTY_DAYS_MS);
    return clientRepository.updateClient(clientId, {
      accessStatus: "Activo",
      accessExpiresAt: expires.toISOString(),
      lastPaymentDate: now.toISOString(),
      paymentMethod,
    });
  },

  /** Marca el acceso del alumno como vencido. */
  markExpired(clientId: string) {
    return clientRepository.updateClient(clientId, { accessStatus: "Vencido" });
  },

  /** Pausa el acceso del alumno. */
  pauseAccess(clientId: string) {
    return clientRepository.updateClient(clientId, { accessStatus: "Pausado" });
  },
};
