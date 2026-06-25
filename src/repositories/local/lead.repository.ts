import { leadRows as seedLeads } from "@/data/leads";
import { resolveMock } from "@/repositories/async";
import type { LeadRepository } from "@/repositories/types";
import { STORAGE_KEYS, readCollection } from "@/lib/local-store";
import type { LeadRow } from "@/types";

/** Leads persistidos (de momento solo lectura en el panel admin). */
export class LocalLeadRepository implements LeadRepository {
  getLeads() {
    return resolveMock(readCollection<LeadRow>(STORAGE_KEYS.leads, seedLeads));
  }
}
