import type { TestimonialRepository } from "@/repositories/types";
import type {
  ContentStatus,
  CreateTestimonialInput,
  Testimonial,
} from "@/types";
import { getSupabaseClient } from "@/lib/supabase";
import { getCurrentOrgId } from "@/repositories/supabase/org-context";
import { unwrap, unwrapList } from "@/repositories/supabase/query";
import { str, type Row } from "@/repositories/supabase/content-crud";

/**
 * SupabaseTestimonialRepository — testimonios sobre `testimonials` (patrón universal).
 * Resuelve `imageUrl` con un JOIN a `media_assets` (via `image_media_id`); la landing
 * anónima puede leerlo por la policy `media_assets_public_testimonial` (solo públicos).
 * `remove` = SOFT DELETE. Misma interfaz que el `Local*`.
 */

const COLS = "id, name, role, result, quote, image_media_id, status, position, media_assets(url)";

export class SupabaseTestimonialRepository implements TestimonialRepository {
  private sb() {
    return getSupabaseClient();
  }
  private async requireOrg(): Promise<string> {
    const orgId = await getCurrentOrgId();
    if (!orgId) throw new Error("No hay una organización activa.");
    return orgId;
  }

  private toTestimonial(row: Row): Testimonial {
    const media = row["media_assets"] as { url?: unknown } | null;
    const imageUrl = media && typeof media.url === "string" ? media.url : "";
    return {
      id: str(row, "id"),
      name: str(row, "name"),
      role: str(row, "role"),
      result: str(row, "result"),
      quote: str(row, "quote"),
      imageMediaId: str(row, "image_media_id"),
      imageUrl,
      status: (str(row, "status") || "draft") as ContentStatus,
      position: Number(row["position"]) || 0,
    };
  }

  async getTestimonials(): Promise<Testimonial[]> {
    const rows = unwrapList(
      await this.sb()
        .from("testimonials")
        .select(COLS)
        .is("deleted_at", null)
        .order("position", { ascending: true }),
    ) as Row[];
    return rows.map((r) => this.toTestimonial(r));
  }

  async getPublishedTestimonials(): Promise<Testimonial[]> {
    const rows = unwrapList(
      await this.sb()
        .from("testimonials")
        .select(COLS)
        .eq("status", "public")
        .is("deleted_at", null)
        .order("position", { ascending: true }),
    ) as Row[];
    return rows.map((r) => this.toTestimonial(r));
  }

  async createTestimonial(input: CreateTestimonialInput): Promise<Testimonial> {
    const org = await this.requireOrg();
    const { count } = await this.sb()
      .from("testimonials")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null);
    const created = unwrap(
      await this.sb()
        .from("testimonials")
        .insert({
          organization_id: org,
          name: input.name.trim(),
          role: input.role,
          result: input.result,
          quote: input.quote,
          image_media_id: input.imageMediaId || null,
          status: "draft",
          position: count ?? 0,
        })
        .select(COLS)
        .single(),
    ) as Row;
    return this.toTestimonial(created);
  }

  async updateTestimonial(
    id: string,
    patch: Partial<CreateTestimonialInput>,
  ): Promise<Testimonial | null> {
    const scalar: Record<string, unknown> = {};
    if (patch.name !== undefined) scalar.name = patch.name.trim();
    if (patch.role !== undefined) scalar.role = patch.role;
    if (patch.result !== undefined) scalar.result = patch.result;
    if (patch.quote !== undefined) scalar.quote = patch.quote;
    if (patch.imageMediaId !== undefined) scalar.image_media_id = patch.imageMediaId || null;
    if (Object.keys(scalar).length === 0) return this.getById(id);
    const { data, error } = await this.sb()
      .from("testimonials")
      .update(scalar)
      .eq("id", id)
      .is("deleted_at", null)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return this.getById(id);
  }

  async setStatus(id: string, status: ContentStatus): Promise<Testimonial | null> {
    const { data, error } = await this.sb()
      .from("testimonials")
      .update({ status })
      .eq("id", id)
      .is("deleted_at", null)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return this.getById(id);
  }

  async reorder(orderedIds: string[]): Promise<void> {
    for (let i = 0; i < orderedIds.length; i++) {
      await this.sb().from("testimonials").update({ position: i }).eq("id", orderedIds[i]);
    }
  }

  async deleteTestimonial(id: string): Promise<boolean> {
    const { data, error } = await this.sb()
      .from("testimonials")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .is("deleted_at", null)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return Boolean(data);
  }

  private async getById(id: string): Promise<Testimonial | null> {
    const { data, error } = await this.sb()
      .from("testimonials")
      .select(COLS)
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? this.toTestimonial(data as Row) : null;
  }
}
