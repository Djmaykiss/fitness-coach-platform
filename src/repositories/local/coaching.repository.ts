import { chatDemo, progressPhotosSeed } from "@/data/coaching";
import { resolveMock } from "@/repositories/async";
import type { CoachingRepository } from "@/repositories/types";
import {
  STORAGE_KEYS,
  readRecord,
  readSeededRecord,
  writeRecord,
} from "@/lib/local-store";
import type {
  ChatMessage,
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
    return readSeededRecord<ProgressPhoto[]>(STORAGE_KEYS.progressPhotos, {
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

  /* ---- Chat con el coach ---- */
  private readChat(): Record<string, ChatMessage[]> {
    // El cliente demo arranca con la conversacion de ejemplo.
    return readSeededRecord<ChatMessage[]>(STORAGE_KEYS.coachingChat, {
      "c-demo": chatDemo,
    });
  }

  getChat(clientId: string) {
    return resolveMock(this.readChat()[clientId] ?? []);
  }

  addChatMessage(clientId: string, message: ChatMessage) {
    const record = this.readChat();
    const next = [...(record[clientId] ?? []), message];
    record[clientId] = next;
    writeRecord(STORAGE_KEYS.coachingChat, record);
    return resolveMock(next);
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
    const chat = this.readChat();
    if (chat[clientId]) {
      delete chat[clientId];
      writeRecord(STORAGE_KEYS.coachingChat, chat);
    }
    return resolveMock<void>(undefined);
  }
}
