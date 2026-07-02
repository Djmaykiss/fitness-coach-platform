import { resolveMock } from "@/repositories/async";
import type { NotificationsRepository } from "@/repositories/types";
import {
  STORAGE_KEYS,
  readCollection,
  writeCollection,
} from "@/lib/local-store";

/**
 * Guarda SOLO los ids de notificaciones que el coach ya vio. Las notificaciones se
 * derivan de datos reales en el servicio; este repositorio persiste el estado leido.
 */
export class LocalNotificationsRepository implements NotificationsRepository {
  private read(): string[] {
    return readCollection<string>(STORAGE_KEYS.notificationsRead, []);
  }

  getReadIds() {
    return resolveMock(this.read());
  }

  markRead(id: string) {
    const ids = this.read();
    if (!ids.includes(id)) ids.push(id);
    writeCollection(STORAGE_KEYS.notificationsRead, ids);
    return resolveMock(ids);
  }

  markAllRead(ids: string[]) {
    const current = this.read();
    const merged = Array.from(new Set([...current, ...ids]));
    writeCollection(STORAGE_KEYS.notificationsRead, merged);
    return resolveMock(merged);
  }
}
