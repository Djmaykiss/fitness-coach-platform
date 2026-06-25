import { clientRepository, leadRepository } from "@/repositories";
import type { CreateLeadInput, Lead, LeadStatus } from "@/types";

/**
 * Capa que consumen el formulario de la landing y el panel admin.
 * Nunca acceden a los repositorios directamente.
 */
export const leadService = {
  getLeads: () => leadRepository.getLeads(),

  createLead: (input: CreateLeadInput) => leadRepository.createLead(input),

  updateStatus: (id: string, status: LeadStatus) =>
    leadRepository.updateStatus(id, status),

  /** Convierte un lead en alumno: crea el cliente y marca el lead como convertido. */
  async convertToClient(lead: Lead) {
    const client = await clientRepository.createClient({
      name: lead.name,
      status: "Nuevo",
    });
    await leadRepository.updateStatus(lead.id, "Convertido");
    return client;
  },
};
