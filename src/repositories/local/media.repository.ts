import { readCollection, writeCollection, STORAGE_KEYS } from "@/lib/local-store";
import type { MediaRepository } from "@/repositories/media.types";
import type { CreateMediaAsset, MediaAsset, MediaQuery } from "@/types";

/**
 * LocalMediaRepository — metadata de medios en `localStorage` (clave `media-assets`).
 * Paridad con el de Supabase; rollback por flag. El binario vive en IndexedDB (via
 * `LocalStorageRepository`); aquí solo la referencia + metadata.
 */

function read(): MediaAsset[] {
  return readCollection<MediaAsset>(STORAGE_KEYS.mediaAssets, []);
}
function write(items: MediaAsset[]): void {
  writeCollection(STORAGE_KEYS.mediaAssets, items);
}
const newId = () => `ma-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export class LocalMediaRepository implements MediaRepository {
  async list(query?: MediaQuery): Promise<MediaAsset[]> {
    let items = read()
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (query?.context) items = items.filter((i) => i.context === query.context);
    if (query?.ownerKind) items = items.filter((i) => i.ownerKind === query.ownerKind);
    if (query?.ownerId) items = items.filter((i) => i.ownerId === query.ownerId);
    return items;
  }

  async create(input: CreateMediaAsset): Promise<MediaAsset> {
    const asset: MediaAsset = { ...input, id: newId(), createdAt: new Date().toISOString() };
    write([asset, ...read()]);
    return asset;
  }

  async remove(id: string): Promise<boolean> {
    const items = read();
    const next = items.filter((i) => i.id !== id);
    if (next.length === items.length) return false;
    write(next);
    return true;
  }

  async findByChecksum(checksum: string): Promise<MediaAsset | null> {
    if (!checksum) return null;
    return read().find((i) => i.checksum === checksum) ?? null;
  }
}
