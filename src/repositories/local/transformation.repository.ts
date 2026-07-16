import { transformations as seedTransformations } from "@/data/transformations";
import { resolveMock } from "@/repositories/async";
import type { TransformationRepository } from "@/repositories/types";
import {
  STORAGE_KEYS,
  readCollection,
  readSeededCollection,
  writeCollection,
} from "@/lib/local-store";
import type {
  ContentStatus,
  CreateTransformationInput,
  MediaAsset,
  Transformation,
} from "@/types";

/**
 * LocalTransformationRepository — transformaciones (Antes/Después) de marketing en
 * localStorage (patrón universal de contenido). Paridad con el de Supabase; el seed se
 * siembra SOLO en modo demo. Consentimiento obligatorio para publicar (mismo invariante
 * que el CHECK de la BD): `status='public'` exige `consentConfirmed=true`; al retirarlo
 * la transformación baja a `draft`.
 */
export class LocalTransformationRepository implements TransformationRepository {
  private read(): Transformation[] {
    return readSeededCollection<Transformation>(
      STORAGE_KEYS.transformations,
      seedTransformations,
    );
  }
  private write(items: Transformation[]): void {
    writeCollection(STORAGE_KEYS.transformations, items);
  }
  /** Resuelve las URLs Antes/Después desde el Media Manager local (o la url del seed). */
  private withImages(items: Transformation[]): Transformation[] {
    const media = readCollection<MediaAsset>(STORAGE_KEYS.mediaAssets, []);
    const urlById = new Map(media.map((m) => [m.id, m.url]));
    const resolve = (mediaId: string, fallback: string) =>
      mediaId ? urlById.get(mediaId) ?? "" : fallback ?? "";
    return items.map((t) => ({
      ...t,
      beforeUrl: resolve(t.beforeMediaId, t.beforeUrl),
      afterUrl: resolve(t.afterMediaId, t.afterUrl),
    }));
  }
  private sorted(items: Transformation[]): Transformation[] {
    return this.withImages([...items].sort((a, b) => a.position - b.position));
  }

  getTransformations() {
    return resolveMock(this.sorted(this.read()));
  }

  getPublishedTransformations() {
    return resolveMock(
      this.sorted(
        this.read().filter((t) => t.status === "public" && t.consentConfirmed),
      ),
    );
  }

  createTransformation(input: CreateTransformationInput) {
    const items = this.read();
    const transformation: Transformation = {
      id: `tr-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      clientName: input.clientName.trim(),
      title: input.title,
      description: input.description,
      result: input.result,
      duration: input.duration,
      beforeMediaId: input.beforeMediaId ?? "",
      afterMediaId: input.afterMediaId ?? "",
      beforeUrl: "",
      afterUrl: "",
      status: "draft",
      position: items.length,
      consentConfirmed: false,
    };
    this.write([...items, transformation]);
    return resolveMock(this.withImages([transformation])[0]);
  }

  updateTransformation(id: string, patch: Partial<CreateTransformationInput>) {
    const items = this.read();
    const index = items.findIndex((t) => t.id === id);
    if (index === -1) return resolveMock<Transformation | null>(null);
    const updated: Transformation = {
      ...items[index],
      ...patch,
      clientName: (patch.clientName ?? items[index].clientName).trim(),
    };
    items[index] = updated;
    this.write(items);
    return resolveMock<Transformation | null>(this.withImages([updated])[0]);
  }

  setStatus(id: string, status: ContentStatus) {
    const items = this.read();
    const index = items.findIndex((t) => t.id === id);
    if (index === -1) return resolveMock<Transformation | null>(null);
    // Regla dura (espejo del CHECK en BD): no se puede publicar sin consentimiento.
    if (status === "public" && !items[index].consentConfirmed) {
      throw new Error("Falta confirmar el consentimiento para publicar.");
    }
    items[index] = { ...items[index], status };
    this.write(items);
    return resolveMock<Transformation | null>(this.withImages([items[index]])[0]);
  }

  setConsent(id: string, confirmed: boolean) {
    const items = this.read();
    const index = items.findIndex((t) => t.id === id);
    if (index === -1) return resolveMock<Transformation | null>(null);
    if (confirmed) {
      items[index] = { ...items[index], consentConfirmed: true };
    } else {
      // Al retirar el consentimiento, baja a draft (deja de verse en la landing).
      items[index] = { ...items[index], consentConfirmed: false, status: "draft" };
    }
    this.write(items);
    return resolveMock<Transformation | null>(this.withImages([items[index]])[0]);
  }

  reorder(orderedIds: string[]) {
    const items = this.read();
    const pos = new Map(orderedIds.map((id, i) => [id, i]));
    const next = items.map((t) => (pos.has(t.id) ? { ...t, position: pos.get(t.id)! } : t));
    this.write(next);
    return resolveMock<void>(undefined);
  }

  deleteTransformation(id: string) {
    const items = this.read();
    const next = items.filter((t) => t.id !== id);
    const removed = next.length !== items.length;
    if (removed) this.write(next);
    return resolveMock(removed);
  }
}
