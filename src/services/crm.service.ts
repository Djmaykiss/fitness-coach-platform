import {
  clientRepository,
  crmRepository,
  leadRepository,
  nutritionPlanRepository,
  trainingProgramRepository,
  userRepository,
} from "@/repositories";
import { leadService } from "@/services/lead.service";
import type { Client, CrmItem, CrmRecord, CrmStage, Lead } from "@/types";

/** Orden de las columnas del pipeline. */
export const CRM_STAGES: CrmStage[] = [
  "Lead",
  "Nuevo alumno",
  "Evaluación pendiente",
  "Evaluación completada",
  "Programa asignado",
  "Entrenando",
  "Suspendido",
  "Finalizado",
  "Renovado",
];

/** Estilo (borde/acento) de cada etapa para los badges y columnas. */
export const CRM_STAGE_STYLE: Record<CrmStage, { dot: string; text: string; border: string }> = {
  Lead: { dot: "bg-sky-400", text: "text-sky-300", border: "border-sky-400/40" },
  "Nuevo alumno": { dot: "bg-cyan-400", text: "text-cyan-300", border: "border-cyan-400/40" },
  "Evaluación pendiente": { dot: "bg-amber-400", text: "text-amber-300", border: "border-amber-400/40" },
  "Evaluación completada": { dot: "bg-yellow-300", text: "text-yellow-200", border: "border-yellow-300/40" },
  "Programa asignado": { dot: "bg-violet-400", text: "text-violet-300", border: "border-violet-400/40" },
  Entrenando: { dot: "bg-[#65ff4f]", text: "text-[#65ff4f]", border: "border-[#65ff4f]/40" },
  Suspendido: { dot: "bg-orange-400", text: "text-orange-300", border: "border-orange-400/40" },
  Finalizado: { dot: "bg-zinc-400", text: "text-zinc-300", border: "border-zinc-400/40" },
  Renovado: { dot: "bg-emerald-400", text: "text-emerald-300", border: "border-emerald-400/40" },
};

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

function recentlyRenewed(client: Client): boolean {
  if (client.accessStatus !== "Activo" || !client.lastPaymentDate) return false;
  const t = new Date(client.lastPaymentDate).getTime();
  return Number.isFinite(t) && Date.now() - t <= SEVEN_DAYS;
}

/** Deriva la etapa de un alumno segun su estado real (si no hay override manual). */
function deriveClientStage(
  client: Client,
  hasProgram: boolean,
  hasWorkouts: boolean,
): CrmStage {
  const activated = Boolean(client.lastPaymentDate);
  const hasEval = Boolean(client.evaluation);
  if (client.accessStatus === "Pausado") return "Suspendido";
  if (client.accessStatus === "Vencido" && activated) return "Finalizado";
  if (recentlyRenewed(client)) return "Renovado";
  if (!hasEval) return activated || client.accessStatus === "Activo" ? "Evaluación pendiente" : "Nuevo alumno";
  if (!hasProgram) return "Evaluación completada";
  if (!hasWorkouts) return "Programa asignado";
  return "Entrenando";
}

/**
 * CRM pipeline del coach. Compone leads + alumnos con su etapa (derivada de datos
 * reales o el override manual del coach) y los metadatos CRM (notas, proxima accion,
 * seguimiento, historial). El coach nunca toca los repositorios directamente.
 */
export const crmService = {
  async getPipeline(): Promise<CrmItem[]> {
    const [clients, leads, users, records] = await Promise.all([
      clientRepository.getClients(),
      leadRepository.getLeads(),
      userRepository.getUsers(),
      crmRepository.getRecords(),
    ]);
    const recById = new Map(records.map((r) => [r.entityId, r]));
    const emailByUserId = new Map(users.map((u) => [u.id, u.email]));

    const perClient = await Promise.all(
      clients.map(async (c) => {
        const [assignment, nutrition, workouts] = await Promise.all([
          trainingProgramRepository.getAssignment(c.id),
          nutritionPlanRepository.getAssignment(c.id),
          trainingProgramRepository.getWorkoutResults(c.id),
        ]);
        return {
          hasProgram: Boolean(assignment),
          hasNutrition: Boolean(nutrition),
          hasWorkouts: workouts.length > 0,
        };
      }),
    );

    const clientItems: CrmItem[] = clients.map((c, i) => {
      const rec = recById.get(c.id);
      const derived = deriveClientStage(c, perClient[i].hasProgram, perClient[i].hasWorkouts);
      return {
        id: c.id,
        entityType: "client",
        name: c.name,
        email: (c.userId && emailByUserId.get(c.userId)) || "",
        phone: "",
        objective: c.evaluation?.objective ?? "",
        stage: rec?.stage ?? derived,
        accessStatus: c.accessStatus ?? "Vencido",
        notes: rec?.notes ?? "",
        nextAction: rec?.nextAction ?? "",
        followUpDate: rec?.followUpDate ?? "",
        history: rec?.history ?? [],
        hasProgram: perClient[i].hasProgram,
        hasEvaluation: Boolean(c.evaluation),
        createdAt: c.lastPaymentDate ?? "",
      };
    });

    // Solo leads activos (no convertidos ni descartados) entran al pipeline.
    const leadItems: CrmItem[] = leads
      .filter((l) => l.status === "Nuevo" || l.status === "Contactado")
      .map((l) => {
        const rec = recById.get(l.id);
        return {
          id: l.id,
          entityType: "lead",
          name: l.name,
          email: l.email,
          phone: l.phone,
          objective: l.objective,
          stage: rec?.stage ?? "Lead",
          accessStatus: null,
          notes: rec?.notes ?? "",
          nextAction: rec?.nextAction ?? "",
          followUpDate: rec?.followUpDate ?? "",
          history: rec?.history ?? [],
          hasProgram: false,
          hasEvaluation: Boolean(l.evaluation),
          createdAt: l.createdAt,
        };
      });

    return [...leadItems, ...clientItems];
  },

  setStage: (entityId: string, stage: CrmStage) =>
    crmRepository.setStage(entityId, stage),

  updateMeta: (
    entityId: string,
    patch: Partial<Pick<CrmRecord, "notes" | "nextAction" | "followUpDate">>,
  ) => crmRepository.upsert(entityId, patch),

  /** Convierte un lead en alumno y transfiere sus notas CRM al nuevo alumno. */
  async convertLead(lead: Lead) {
    const client = await leadService.convertToClient(lead);
    const rec = await crmRepository.getRecord(lead.id);
    if (rec && (rec.notes || rec.nextAction || rec.followUpDate)) {
      await crmRepository.upsert(client.id, {
        notes: rec.notes,
        nextAction: rec.nextAction,
        followUpDate: rec.followUpDate,
      });
    }
    return client;
  },
};
