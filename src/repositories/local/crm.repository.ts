import { resolveMock } from "@/repositories/async";
import type { CrmRepository } from "@/repositories/types";
import {
  STORAGE_KEYS,
  readCollection,
  writeCollection,
} from "@/lib/local-store";
import type { CrmRecord, CrmStage } from "@/types";

/**
 * Metadatos CRM por entidad, persistidos en localStorage (coleccion de `CrmRecord`
 * indexada por `entityId`). No hay seed: arranca vacio y se llena a medida que el
 * coach mueve entidades en el pipeline o agrega notas.
 */
export class LocalCrmRepository implements CrmRepository {
  private read(): CrmRecord[] {
    return readCollection<CrmRecord>(STORAGE_KEYS.crm, []);
  }

  private write(items: CrmRecord[]): void {
    writeCollection(STORAGE_KEYS.crm, items);
  }

  private blank(entityId: string): CrmRecord {
    return { entityId, notes: "", nextAction: "", followUpDate: "", history: [] };
  }

  getRecords() {
    return resolveMock(this.read());
  }

  getRecord(entityId: string) {
    return resolveMock<CrmRecord | null>(
      this.read().find((r) => r.entityId === entityId) ?? null,
    );
  }

  upsert(entityId: string, patch: Partial<Omit<CrmRecord, "entityId">>) {
    const items = this.read();
    const index = items.findIndex((r) => r.entityId === entityId);
    const base = index === -1 ? this.blank(entityId) : items[index];
    const next: CrmRecord = { ...base, ...patch, entityId };
    if (index === -1) items.push(next);
    else items[index] = next;
    this.write(items);
    return resolveMock(next);
  }

  setStage(entityId: string, stage: CrmStage) {
    const items = this.read();
    const index = items.findIndex((r) => r.entityId === entityId);
    const base = index === -1 ? this.blank(entityId) : items[index];
    const next: CrmRecord = {
      ...base,
      entityId,
      stage,
      history: [...base.history, { stage, date: new Date().toISOString() }],
    };
    if (index === -1) items.push(next);
    else items[index] = next;
    this.write(items);
    return resolveMock(next);
  }
}
