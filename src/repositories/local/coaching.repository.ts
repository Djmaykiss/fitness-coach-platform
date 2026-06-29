import { progressPhotosSeed } from "@/data/coaching";
import { resolveMock } from "@/repositories/async";
import type { CoachingRepository } from "@/repositories/types";
import {
  STORAGE_KEYS,
  readRecord,
  writeRecord,
} from "@/lib/local-store";
import type {
  ChecklistChecks,
  CreateProgressPhoto,
  ProgressPhoto,
} from "@/types";

/**
 * Fotos de progreso y checklists del dashboard del alumno, persistidos por id de
 * cliente en localStorage. En el futuro estos datos vendran de Supabase.
 */
export class LocalCoachingRepository implements CoachingRepository {
  /* ---- Fotos de progreso ---- */
  private readPhotos(): Record<string, ProgressPhoto[]> {
    // Se siembra el cliente demo con fotos de ejemplo.
    return readRecord<ProgressPhoto[]>(STORAGE_KEYS.progressPhotos, {
      "c-demo": progressPhotosSeed,
    });
  }

  getPhotos(clientId: string) {
    const record = this.readPhotos();
    return resolveMock(record[clientId] ?? []);
  }

  addPhoto(clientId: string, photo: CreateProgressPhoto) {
    const record = this.readPhotos();
    const created: ProgressPhoto = {
      ...photo,
      id: `photo-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    };
    const list = record[clientId] ?? [];
    record[clientId] = [created, ...list];
    writeRecord(STORAGE_KEYS.progressPhotos, record);
    return resolveMock(created);
  }

  /* ---- Checklists (objetivos / nutricion / recordatorios) ---- */
  private readChecks(): Record<string, ChecklistChecks> {
    return readRecord<ChecklistChecks>(STORAGE_KEYS.checklists, {});
  }

  getChecks(clientId: string) {
    const record = this.readChecks();
    return resolveMock(record[clientId] ?? {});
  }

  setCheck(clientId: string, listKey: string, itemKey: string, done: boolean) {
    const record = this.readChecks();
    const clientChecks: ChecklistChecks = record[clientId] ?? {};
    const list = { ...(clientChecks[listKey] ?? {}), [itemKey]: done };
    const updated: ChecklistChecks = { ...clientChecks, [listKey]: list };
    record[clientId] = updated;
    writeRecord(STORAGE_KEYS.checklists, record);
    return resolveMock(updated);
  }

  /* ---- Limpieza al eliminar un alumno ---- */
  removeClient(clientId: string) {
    const photos = this.readPhotos();
    if (photos[clientId]) {
      delete photos[clientId];
      writeRecord(STORAGE_KEYS.progressPhotos, photos);
    }
    const checks = this.readChecks();
    if (checks[clientId]) {
      delete checks[clientId];
      writeRecord(STORAGE_KEYS.checklists, checks);
    }
    return resolveMock<void>(undefined);
  }
}
