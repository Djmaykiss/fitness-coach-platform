import { leads as seedLeads } from "@/data/leads";
import { resolveMock } from "@/repositories/async";
import type { LeadRepository } from "@/repositories/types";
import {
  STORAGE_KEYS,
  readCollection,
  writeCollection,
} from "@/lib/local-store";
import type {
  CreateEvaluationLeadInput,
  CreateLeadInput,
  Lead,
  LeadStatus,
} from "@/types";

/** Leads persistidos en localStorage (creados desde la landing, gestionados en /admin). */
export class LocalLeadRepository implements LeadRepository {
  private read(): Lead[] {
    return readCollection<Lead>(STORAGE_KEYS.leads, seedLeads);
  }

  private write(leads: Lead[]): void {
    writeCollection(STORAGE_KEYS.leads, leads);
  }

  getLeads() {
    return resolveMock(this.read());
  }

  createLead(input: CreateLeadInput) {
    const leads = this.read();
    const lead: Lead = {
      id: `lead-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      name: input.name.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      objective: input.objective,
      message: input.message.trim(),
      source: "Landing",
      status: "Nuevo",
      createdAt: new Date().toISOString(),
    };
    // Los mas nuevos primero.
    leads.unshift(lead);
    this.write(leads);
    return resolveMock(lead);
  }

  createEvaluationLead(input: CreateEvaluationLeadInput) {
    const leads = this.read();
    const lead: Lead = {
      id: `lead-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      name: input.name.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      objective: input.evaluation.objective,
      message: "",
      source: "Evaluación",
      status: "Nuevo",
      createdAt: new Date().toISOString(),
      evaluation: input.evaluation,
    };
    leads.unshift(lead);
    this.write(leads);
    return resolveMock(lead);
  }

  updateStatus(id: string, status: LeadStatus) {
    const leads = this.read();
    const index = leads.findIndex((lead) => lead.id === id);
    if (index === -1) return resolveMock<Lead | null>(null);
    const updated: Lead = { ...leads[index], status };
    leads[index] = updated;
    this.write(leads);
    return resolveMock<Lead | null>(updated);
  }
}
