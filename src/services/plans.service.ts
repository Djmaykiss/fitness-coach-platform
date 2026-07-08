import { plansRepository, clientRepository } from "@/repositories";
import type { CreatePlanInput } from "@/types";

/**
 * Planes comerciales. El COACH administra todo (CRUD + activar/desactivar +
 * recomendado + reordenar) desde /admin; la LANDING muestra solo los ACTIVOS; el
 * ALUMNO ve su plan contratado en su perfil. La UI nunca toca el repositorio.
 */
export const plansService = {
  /* ---- Público / landing ---- */
  getActivePlans: () => plansRepository.getActivePlans(),

  /* ---- Coach: administración ---- */
  getPlans: () => plansRepository.getPlans(),
  createPlan: (input: CreatePlanInput) => plansRepository.createPlan(input),
  updatePlan: (id: string, patch: Partial<CreatePlanInput>) =>
    plansRepository.updatePlan(id, patch),
  deletePlan: (id: string) => plansRepository.deletePlan(id),
  setActive: (id: string, active: boolean) => plansRepository.setActive(id, active),
  setRecommended: (id: string) => plansRepository.setRecommended(id),
  reorder: (orderedIds: string[]) => plansRepository.reorder(orderedIds),

  /* ---- Alumno: plan contratado (resuelve userId -> clientId) ---- */
  async getClientPlanForUser(userId: string) {
    const client = await clientRepository.findByUserId(userId);
    if (!client) return null;
    return plansRepository.getClientPlan(client.id);
  },

  /** Plan contratado por clientId (para la ficha del coach). */
  getClientPlanForClient: (clientId: string) =>
    plansRepository.getClientPlan(clientId),

  /**
   * Registro con plan elegido en la landing: asigna el plan al alumno recién creado
   * (resuelve userId -> clientId). Si no encuentra el cliente, no falla el registro.
   */
  async contractPlanForUser(
    userId: string,
    plan: { planId: string; planName: string },
  ) {
    const client = await clientRepository.findByUserId(userId);
    if (!client) return null;
    return plansRepository.assignPlan(client.id, plan.planId, plan.planName);
  },

  /** Coach: asigna/cambia el plan de un alumno (resuelve el nombre desde el plan). */
  async assignPlanToClient(clientId: string, planId: string) {
    const plans = await plansRepository.getPlans();
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return null;
    return plansRepository.assignPlan(clientId, planId, plan.name);
  },
};
