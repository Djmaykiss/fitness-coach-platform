import {
  clientRepository,
  coachingRepository,
  discoverRepository,
  exerciseLibraryRepository,
  leadRepository,
  nutritionPlanRepository,
  programRepository,
  progressRepository,
  settingsRepository,
  trainingProgramRepository,
  userRepository,
} from "@/repositories";
import { starterClientProgress } from "@/data/dashboard";
import type {
  AccessStatus,
  AdminClientRow,
  ActivityItem,
  ClientProgress,
  CoachOverview,
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
      ingresosEstimados: activos * (await settingsRepository.get()).monthlyPrice,
    };
  },

  /**
   * Overview completo del negocio para el dashboard del coach: metricas derivadas
   * de datos reales (alumnos, programas, biblioteca, Descubre, entrenamientos,
   * evaluaciones), proximas renovaciones, ultimos alumnos y actividad reciente.
   */
  async getCoachOverview(): Promise<CoachOverview> {
    const [rows, clients, leads, programs, exercises, routines, articles, settings] =
      await Promise.all([
        this.getClientRows(),
        clientRepository.getClients(),
        leadRepository.getLeads(),
        trainingProgramRepository.getPrograms(),
        exerciseLibraryRepository.getExercises(),
        discoverRepository.getRoutines(),
        discoverRepository.getArticles(),
        settingsRepository.get(),
      ]);

    const activos = rows.filter((r) => r.accessStatus === "Activo").length;
    const nameById = new Map(rows.map((r) => [r.id, r.name]));

    // Entrenamientos agregados de todos los alumnos (modo entrenamiento).
    const resultsByClient = await Promise.all(
      clients.map((c) => trainingProgramRepository.getWorkoutResults(c.id)),
    );
    const allResults = resultsByClient.flat();

    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).getTime();
    const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const monthAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;
    const time = (iso: string) => new Date(iso).getTime();

    const entrenamientosHoy = allResults.filter((r) => time(r.date) >= startOfToday).length;
    const entrenamientosSemana = allResults.filter((r) => time(r.date) >= weekAgo).length;
    const entrenamientosMes = allResults.filter((r) => time(r.date) >= monthAgo).length;

    // Serie ultimos 14 dias.
    const entrenamientosSerie = Array.from({ length: 14 }, (_, i) => {
      const day = new Date(startOfToday - (13 - i) * 24 * 60 * 60 * 1000);
      const start = day.getTime();
      const end = start + 24 * 60 * 60 * 1000;
      const value = allResults.filter((r) => {
        const t = time(r.date);
        return t >= start && t < end;
      }).length;
      return { label: `${day.getDate()}`, value };
    });

    // Progreso promedio.
    const progresoPromedio = rows.length
      ? Math.round(rows.reduce((sum, r) => sum + (r.progresoPct || 0), 0) / rows.length)
      : 0;

    // Meta de peso e IMC promedio (de evaluaciones con datos numericos).
    const weightGoals: number[] = [];
    const imcs: number[] = [];
    for (const c of clients) {
      const e = c.evaluation;
      if (!e) continue;
      const w = Number(e.weight);
      const target = Number(e.targetWeight);
      const h = Number(e.height) / 100;
      if (Number.isFinite(w) && Number.isFinite(target) && w > 0 && target > 0) {
        weightGoals.push(w - target);
      }
      if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) {
        imcs.push(w / (h * h));
      }
    }
    const avg = (arr: number[]) =>
      arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    const metaPesoPromedio = Math.round(avg(weightGoals) * 10) / 10;
    const imcPromedio = Math.round(avg(imcs) * 10) / 10;

    // Actividad reciente: entrenamientos + leads recientes.
    const activityFromWorkouts: ActivityItem[] = resultsByClient.flatMap(
      (results, i) =>
        results.map((r) => ({
          id: `w-${r.id}`,
          kind: "workout" as const,
          text: `${nameById.get(clients[i].id) ?? "Alumno"} completó ${r.dayName}`,
          date: r.date,
        })),
    );
    const activityFromLeads: ActivityItem[] = leads.map((l) => ({
      id: `l-${l.id}`,
      kind: "lead" as const,
      text: `Nuevo lead: ${l.name}${l.objective ? ` (${l.objective})` : ""}`,
      date: l.createdAt,
    }));
    const actividadReciente = [...activityFromWorkouts, ...activityFromLeads]
      .sort((a, b) => time(b.date) - time(a.date))
      .slice(0, 8);

    return {
      alumnosActivos: activos,
      alumnosSuspendidos: rows.filter((r) => r.accessStatus === "Pausado").length,
      alumnosVencidos: rows.filter((r) => r.accessStatus === "Vencido").length,
      alumnosTotal: rows.length,
      programas: programs.length,
      rutinasPublicadas: routines.filter((r) => r.published).length,
      rutinasBorrador: routines.filter((r) => !r.published).length,
      ejercicios: exercises.length,
      ejerciciosConVideo: exercises.filter((e) => e.video?.trim()).length,
      articulosPublicados: articles.filter((a) => a.published).length,
      entrenamientosHoy,
      entrenamientosSemana,
      entrenamientosMes,
      progresoPromedio,
      metaPesoPromedio,
      imcPromedio,
      ingresosEstimados: activos * settings.monthlyPrice,
      proximasRenovaciones: rows
        .filter((r) => r.renewSoon)
        .map((r) => ({ id: r.id, name: r.name, date: r.accessExpiresAt }))
        .slice(0, 6),
      ultimosAlumnos: [...rows]
        .reverse()
        .slice(0, 6)
        .map((r) => ({ id: r.id, name: r.name, accessStatus: r.accessStatus })),
      actividadReciente,
      entrenamientosSerie,
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
