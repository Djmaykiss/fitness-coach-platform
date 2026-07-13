import { seedProgress, starterClientProgress } from "@/data/dashboard";
import { resolveMock } from "@/repositories/async";
import type { ProgressRepository } from "@/repositories/types";
import { STORAGE_KEYS, readSeededRecord, writeRecord } from "@/lib/local-store";
import type { ClientProgress } from "@/types";

/** Progreso basico, persistido por id de cliente. */
export class LocalProgressRepository implements ProgressRepository {
  private read(): Record<string, ClientProgress> {
    return readSeededRecord<ClientProgress>(STORAGE_KEYS.progress, seedProgress);
  }

  getForClient(clientId: string) {
    const record = this.read();
    if (!record[clientId]) {
      // Un alumno sin progreso recibe uno inicial que queda persistido.
      record[clientId] = starterClientProgress;
      writeRecord(STORAGE_KEYS.progress, record);
    }
    return resolveMock(record[clientId]);
  }

  saveForClient(clientId: string, progress: ClientProgress) {
    const record = this.read();
    record[clientId] = progress;
    writeRecord(STORAGE_KEYS.progress, record);
    return resolveMock(progress);
  }

  removeForClient(clientId: string) {
    const record = this.read();
    if (record[clientId]) {
      delete record[clientId];
      writeRecord(STORAGE_KEYS.progress, record);
    }
    return resolveMock<void>(undefined);
  }
}
