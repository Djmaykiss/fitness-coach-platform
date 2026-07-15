import { testimonials as seedTestimonials } from "@/data/testimonials";
import { resolveMock } from "@/repositories/async";
import type { TestimonialRepository } from "@/repositories/types";
import {
  STORAGE_KEYS,
  readCollection,
  readSeededCollection,
  writeCollection,
} from "@/lib/local-store";
import type {
  ContentStatus,
  CreateTestimonialInput,
  MediaAsset,
  Testimonial,
} from "@/types";

/**
 * LocalTestimonialRepository — testimonios en localStorage (patrón universal de
 * contenido). Paridad con el de Supabase; el seed se siembra SOLO en modo demo.
 */
export class LocalTestimonialRepository implements TestimonialRepository {
  private read(): Testimonial[] {
    return readSeededCollection<Testimonial>(
      STORAGE_KEYS.testimonials,
      seedTestimonials,
    );
  }
  private write(items: Testimonial[]): void {
    writeCollection(STORAGE_KEYS.testimonials, items);
  }
  /** Resuelve `imageUrl` desde el Media Manager local (localStorage `media-assets`). */
  private withImages(items: Testimonial[]): Testimonial[] {
    const media = readCollection<MediaAsset>(STORAGE_KEYS.mediaAssets, []);
    const urlById = new Map(media.map((m) => [m.id, m.url]));
    return items.map((t) => ({
      ...t,
      imageUrl: t.imageMediaId ? urlById.get(t.imageMediaId) ?? "" : "",
    }));
  }
  private sorted(items: Testimonial[]): Testimonial[] {
    return this.withImages([...items].sort((a, b) => a.position - b.position));
  }

  getTestimonials() {
    return resolveMock(this.sorted(this.read()));
  }

  getPublishedTestimonials() {
    return resolveMock(this.sorted(this.read().filter((t) => t.status === "public")));
  }

  createTestimonial(input: CreateTestimonialInput) {
    const items = this.read();
    const testimonial: Testimonial = {
      id: `tm-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      name: input.name.trim(),
      role: input.role,
      result: input.result,
      quote: input.quote,
      imageMediaId: input.imageMediaId ?? "",
      imageUrl: "",
      status: "draft",
      position: items.length,
    };
    this.write([...items, testimonial]);
    return resolveMock(this.withImages([testimonial])[0]);
  }

  updateTestimonial(id: string, patch: Partial<CreateTestimonialInput>) {
    const items = this.read();
    const index = items.findIndex((t) => t.id === id);
    if (index === -1) return resolveMock<Testimonial | null>(null);
    const updated: Testimonial = {
      ...items[index],
      ...patch,
      name: (patch.name ?? items[index].name).trim(),
    };
    items[index] = updated;
    this.write(items);
    return resolveMock<Testimonial | null>(updated);
  }

  setStatus(id: string, status: ContentStatus) {
    const items = this.read();
    const index = items.findIndex((t) => t.id === id);
    if (index === -1) return resolveMock<Testimonial | null>(null);
    items[index] = { ...items[index], status };
    this.write(items);
    return resolveMock<Testimonial | null>(items[index]);
  }

  reorder(orderedIds: string[]) {
    const items = this.read();
    const pos = new Map(orderedIds.map((id, i) => [id, i]));
    const next = items.map((t) => (pos.has(t.id) ? { ...t, position: pos.get(t.id)! } : t));
    this.write(next);
    return resolveMock<void>(undefined);
  }

  deleteTestimonial(id: string) {
    const items = this.read();
    const next = items.filter((t) => t.id !== id);
    const removed = next.length !== items.length;
    if (removed) this.write(next);
    return resolveMock(removed);
  }
}
