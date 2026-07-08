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
};
