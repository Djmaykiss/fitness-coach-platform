import {
  clientRepository,
  leadRepository,
  notificationsRepository,
  nutritionPlanRepository,
  trainingProgramRepository,
} from "@/repositories";
import type {
  Client,
  CoachNotification,
  NotificationPriority,
  NotificationType,
} from "@/types";

const DAY_MS = 24 * 60 * 60 * 1000;
const time = (iso: string) => {
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : 0;
};

function make(
  id: string,
  type: NotificationType,
  priority: NotificationPriority,
  text: string,
  date: string,
): Omit<CoachNotification, "read"> {
  return { id, type, priority, text, date };
}

/**
 * Centro de notificaciones del coach. Las notificaciones se DERIVAN de datos reales
 * (leads, alumnos, accesos, entrenamientos) con ids deterministas; el estado "leido"
 * se persiste por id. La UI nunca toca los repositorios directamente.
 */
export const notificationsService = {
  async getAll(): Promise<CoachNotification[]> {
    const [clients, leads, readIds] = await Promise.all([
      clientRepository.getClients(),
      leadRepository.getLeads(),
      notificationsRepository.getReadIds(),
    ]);
    const readSet = new Set(readIds);

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
          workouts,
        };
      }),
    );

    const items: Omit<CoachNotification, "read">[] = [];
    const now = Date.now();

    // Leads nuevos / contactados.
    for (const l of leads) {
      if (l.status === "Nuevo" || l.status === "Contactado") {
        items.push(make(`lead-new-${l.id}`, "lead", "media", `Nuevo lead: ${l.name}`, l.createdAt));
      }
    }

    clients.forEach((c: Client, i) => {
      const info = perClient[i];
      const activated = Boolean(c.lastPaymentDate);
      const status = c.accessStatus ?? "Vencido";

      if (c.userId) {
        items.push(make(`client-registered-${c.id}`, "client", "baja", `Alumno registrado: ${c.name}`, c.lastPaymentDate ?? ""));
      }
      if (c.evaluation) {
        items.push(make(`eval-done-${c.id}`, "evaluation", "baja", `${c.name} completó su evaluación`, ""));
      }
      if (!info.hasProgram) {
        items.push(make(`gap-noprogram-${c.id}`, "gap", "media", `${c.name} no tiene programa asignado`, ""));
      } else {
        items.push(make(`program-assigned-${c.id}`, "program", "baja", `Programa asignado a ${c.name}`, ""));
      }
      if (!info.hasNutrition) {
        items.push(make(`gap-nonutri-${c.id}`, "gap", "baja", `${c.name} no tiene plan de nutrición`, ""));
      }

      // Acceso: por vencer / vencido.
      if (status === "Activo" && c.accessExpiresAt) {
        const diff = time(c.accessExpiresAt) - now;
        if (diff >= 0 && diff <= 7 * DAY_MS) {
          items.push(make(`access-expiring-${c.id}`, "access", "alta", `El acceso de ${c.name} vence pronto`, c.accessExpiresAt));
        }
      }
      if (status === "Vencido" && activated) {
        items.push(make(`access-expired-${c.id}`, "access", "alta", `El acceso de ${c.name} está vencido`, c.accessExpiresAt ?? c.lastPaymentDate ?? ""));
        items.push(make(`program-finished-${c.id}`, "program", "media", `El plan de ${c.name} finalizó`, c.accessExpiresAt ?? ""));
      }

      // Entrenamientos: recientes + inactividad.
      const sorted = [...info.workouts].sort((a, b) => time(b.date) - time(a.date));
      for (const w of sorted.slice(0, 3)) {
        if (now - time(w.date) <= 14 * DAY_MS) {
          items.push(make(`workout-${w.id}`, "workout", "baja", `${c.name} completó ${w.dayName}`, w.date));
        }
      }
      if (status === "Activo" && info.hasProgram) {
        const last = sorted[0] ? time(sorted[0].date) : 0;
        const days = last ? Math.floor((now - last) / DAY_MS) : null;
        if (days !== null && days >= 5) {
          items.push(make(`inactive-${c.id}`, "inactivity", "media", `${c.name} lleva ${days} días sin entrenar`, sorted[0].date));
        } else if (days === null) {
          items.push(make(`inactive-${c.id}`, "inactivity", "media", `${c.name} aún no registra entrenamientos`, ""));
        }
      }
    });

    return items
      .map((n) => ({ ...n, read: readSet.has(n.id) }))
      .sort((a, b) => time(b.date) - time(a.date));
  },

  async getUnreadCount(): Promise<number> {
    const all = await this.getAll();
    return all.filter((n) => !n.read).length;
  },

  markRead: (id: string) => notificationsRepository.markRead(id),

  async markAllRead(): Promise<void> {
    const all = await this.getAll();
    await notificationsRepository.markAllRead(all.map((n) => n.id));
  },
};
