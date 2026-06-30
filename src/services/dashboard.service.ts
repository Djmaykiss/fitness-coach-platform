import {
  clientRepository,
  coachingRepository,
  leadRepository,
  nutritionPlanRepository,
  programRepository,
  progressRepository,
  trainingProgramRepository,
  userRepository,
} from "@/repositories";
import { coachConfig } from "@/config/coachConfig";
import { starterClientProgress } from "@/data/dashboard";
import type {
  AccessStatus,
  AdminClientRow,
  ClientProgress,
  CreateClientInput,
  CreateProgramInput,
  ExecutiveStats,
  LeadEvaluation,
  ProgramRow,
} from "@/types";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/** True si el acceso (activo) vence dentro de los proximos 7 dias. */
function expiresSoon(status: AccessStatus, expiresAt: string | null): boolean {
  if (status !== "Activo" || !expiresAt) return false;
  const t = new Date(expiresAt).getTime();
  if (Number.isNaN(t)) return false;
  const diff = t - Date.now();
  return diff >= 0 && diff <= SEVEN_DAYS_MS;
}

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

  /** Evaluacion inicial del alumno autenticado (seccion "Mi evaluacion inicial"). */
  async getEvaluationForUser(userId: string): Promise<LeadEvaluation | null> {
    const client = await clientRepository.findByUserId(userId);
    return client?.evaluation ?? null;
  },
};

/** Datos y operaciones del panel de administracion. */
export const adminDashboardService = {
  getPrograms: () => programRepository.getProgramRows(),

  /** Clientes con su programa, progreso y banderas derivadas (tabla del admin). */
  async getClientRows(): Promise<AdminClientRow[]> {
    const clients = await clientRepository.getClients();
    const users = await userRepository.getUsers();
    const emailByUserId = new Map(users.map((u) => [u.id, u.email]));
    return Promise.all(
      clients.map(async (client) => {
        const [progress, trainingId, nutritionId] = await Promise.all([
          progressRepository.getForClient(client.id),
          trainingProgramRepository.getAssignment(client.id),
          nutritionPlanRepository.getAssignment(client.id),
        ]);
        const accessStatus = client.accessStatus ?? "Vencido";
        return {
          id: client.id,
          name: client.name,
          status: client.status,
          programa: progress.programa,
          progresoPct: progress.progresoPct,
          accessStatus,
          accessExpiresAt: client.accessExpiresAt ?? null,
          evaluation: client.evaluation,
          email: (client.userId && emailByUserId.get(client.userId)) || "",
          hasProgram: Boolean(trainingId),
          hasNutrition: Boolean(nutritionId),
          hasEvaluation: Boolean(client.evaluation),
          renewSoon: expiresSoon(accessStatus, client.accessExpiresAt ?? null),
        };
      }),
    );
  },

  /** Resumen ejecutivo del negocio para el panel del admin. */
  async getExecutiveStats(): Promise<ExecutiveStats> {
    const [rows, leads] = await Promise.all([
      this.getClientRows(),
      leadRepository.getLeads(),
    ]);
    const activos = rows.filter((r) => r.accessStatus === "Activo").length;
    return {
      total: rows.length,
      activos,
      vencidos: rows.filter((r) => r.accessStatus === "Vencido").length,
      pausados: rows.filter((r) => r.accessStatus === "Pausado").length,
      renuevanSemana: rows.filter((r) => r.renewSoon).length,
      sinPrograma: rows.filter((r) => !r.hasProgram).length,
      sinNutricion: rows.filter((r) => !r.hasNutrition).length,
      sinEvaluacion: rows.filter((r) => !r.hasEvaluation).length,
      leadsPendientes: leads.filter(
        (l) => l.status === "Nuevo" || l.status === "Contactado",
      ).length,
      ingresosEstimados: activos * coachConfig.monthlyPrice,
    };
  },

  /* ---------- Operaciones (escritura) ---------- */

  createClient: (input: CreateClientInput) =>
    clientRepository.createClient(input),

  updateClient: (
    id: string,
    patch: { name?: string; status?: string },
  ) => clientRepository.updateClient(id, patch),

  /**
   * Elimina un alumno y todos sus datos asociados (progreso, fotos y checklists).
   * No toca cuentas de usuario: el acceso de login se conserva.
   */
  async deleteClient(clientId: string) {
    await clientRepository.deleteClient(clientId);
    await progressRepository.removeForClient(clientId);
    await coachingRepository.removeClient(clientId);
  },

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
