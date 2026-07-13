import { plansSeed, clientPlansSeed } from "@/data/plans";
import { resolveMock } from "@/repositories/async";
import type { PlansRepository } from "@/repositories/types";
import {
  STORAGE_KEYS,
  readSeededCollection,
  readSeededRecord,
  writeCollection,
  writeRecord,
} from "@/lib/local-store";
import type { ClientPlan, CreatePlanInput, Plan } from "@/types";

function id(): string {
  return `plan-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/** Planes comerciales + planes contratados, persistidos en localStorage. */
export class LocalPlansRepository implements PlansRepository {
  private read(): Plan[] {
    return readSeededCollection<Plan>(STORAGE_KEYS.plans, plansSeed)
      .slice()
      .sort((a, b) => a.position - b.position);
  }
  private write(plans: Plan[]): void {
    writeCollection(STORAGE_KEYS.plans, plans);
  }

  getPlans() {
    return resolveMock(this.read());
  }
  getActivePlans() {
    return resolveMock(this.read().filter((p) => p.active));
  }

  createPlan(input: CreatePlanInput) {
    const plans = this.read();
    const plan: Plan = { ...input, id: id(), position: plans.length };
    plans.push(plan);
    this.write(plans);
    return resolveMock(plan);
  }

  updatePlan(planId: string, patch: Partial<CreatePlanInput>) {
    const plans = this.read();
    const index = plans.findIndex((p) => p.id === planId);
    if (index === -1) return resolveMock<Plan | null>(null);
    const updated: Plan = { ...plans[index], ...patch };
    plans[index] = updated;
    this.write(plans);
    return resolveMock<Plan | null>(updated);
  }

  deletePlan(planId: string) {
    const plans = this.read();
    const next = plans.filter((p) => p.id !== planId);
    const removed = next.length !== plans.length;
    if (removed) this.write(next);
    return resolveMock(removed);
  }

  setActive(planId: string, active: boolean) {
    return this.updatePlan(planId, { active });
  }

  setRecommended(planId: string) {
    const plans = this.read().map((p) => ({ ...p, recommended: p.id === planId }));
    this.write(plans);
    return resolveMock<void>(undefined);
  }

  reorder(orderedIds: string[]) {
    const byId = new Map(this.read().map((p) => [p.id, p]));
    const next: Plan[] = [];
    orderedIds.forEach((pid, i) => {
      const plan = byId.get(pid);
      if (plan) {
        next.push({ ...plan, position: i });
        byId.delete(pid);
      }
    });
    // Conserva los no listados al final (por seguridad).
    let i = next.length;
    for (const plan of byId.values()) next.push({ ...plan, position: i++ });
    this.write(next);
    return resolveMock<void>(undefined);
  }

  getClientPlan(clientId: string) {
    const record = readSeededRecord<ClientPlan>(STORAGE_KEYS.clientPlans, clientPlansSeed);
    return resolveMock<ClientPlan | null>(record[clientId] ?? null);
  }

  assignPlan(clientId: string, planId: string, planName: string) {
    const record = readSeededRecord<ClientPlan>(STORAGE_KEYS.clientPlans, clientPlansSeed);
    const now = new Date();
    const contract: ClientPlan = {
      planId,
      planName,
      status: "Activo",
      startDate: now.toISOString(),
      renewalDate: new Date(now.getTime() + 30 * 864e5).toISOString(),
    };
    record[clientId] = contract;
    writeRecord(STORAGE_KEYS.clientPlans, record);
    return resolveMock(contract);
  }
}
