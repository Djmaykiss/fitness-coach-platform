import type { TransformationRepository } from "@/repositories/types";
import type {
  ContentStatus,
  CreateTransformationInput,
  Transformation,
} from "@/types";
import { getSupabaseClient } from "@/lib/supabase";
import { getCurrentOrgId } from "@/repositories/supabase/org-context";
import { unwrap, unwrapList } from "@/repositories/supabase/query";
import { str, type Row } from "@/repositories/supabase/content-crud";

/**
 * SupabaseTransformationRepository — transformaciones (Antes/Después) sobre
 * `transformations` (patrón universal). Resuelve las URLs con DOS embeds a `media_assets`
 * (via `before_media_id` y `after_media_id`, con hint de columna). La landing anónima
 * puede leer esas imágenes por la policy `media_assets_public_transformation` (solo de
 * transformaciones públicas CON consentimiento). `remove` = SOFT DELETE.
 *
 * CONSENTIMIENTO: publicar exige `consent_confirmed=true` (reforzado por el CHECK
 * `transformations_public_requires_consent`); al retirarlo se baja a `draft`.
 */

const COLS =
  "id, client_name, title, description, result, duration, before_media_id, after_media_id, status, consent_confirmed, position, before:media_assets!before_media_id(url), after:media_assets!after_media_id(url)";

export class SupabaseTransformationRepository implements TransformationRepository {
  private sb() {
    return getSupabaseClient();
  }
  private async requireOrg(): Promise<string> {
    const orgId = await getCurrentOrgId();
    if (!orgId) throw new Error("No hay una organización activa.");
    return orgId;
  }

  private toTransformation(row: Row): Transformation {
    const before = row["before"] as { url?: unknown } | null;
    const after = row["after"] as { url?: unknown } | null;
    const url = (m: { url?: unknown } | null) =>
      m && typeof m.url === "string" ? m.url : "";
    return {
      id: str(row, "id"),
      clientName: str(row, "client_name"),
      title: str(row, "title"),
      description: str(row, "description"),
      result: str(row, "result"),
      duration: str(row, "duration"),
      beforeMediaId: str(row, "before_media_id"),
      afterMediaId: str(row, "after_media_id"),
      beforeUrl: url(before),
      afterUrl: url(after),
      status: (str(row, "status") || "draft") as ContentStatus,
      position: Number(row["position"]) || 0,
      consentConfirmed: row["consent_confirmed"] === true,
    };
  }

  async getTransformations(): Promise<Transformation[]> {
    const rows = unwrapList(
      await this.sb()
        .from("transformations")
        .select(COLS)
        .is("deleted_at", null)
        .order("position", { ascending: true }),
    ) as Row[];
    return rows.map((r) => this.toTransformation(r));
  }

  async getPublishedTransformations(): Promise<Transformation[]> {
    const rows = unwrapList(
      await this.sb()
        .from("transformations")
        .select(COLS)
        .eq("status", "public")
        .eq("consent_confirmed", true)
        .is("deleted_at", null)
        .order("position", { ascending: true }),
    ) as Row[];
    return rows.map((r) => this.toTransformation(r));
  }

  async createTransformation(input: CreateTransformationInput): Promise<Transformation> {
    const org = await this.requireOrg();
    const { count } = await this.sb()
      .from("transformations")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null);
    const created = unwrap(
      await this.sb()
        .from("transformations")
        .insert({
          organization_id: org,
          client_name: input.clientName.trim(),
          title: input.title,
          description: input.description,
          result: input.result,
          duration: input.duration,
          before_media_id: input.beforeMediaId || null,
          after_media_id: input.afterMediaId || null,
          status: "draft",
          position: count ?? 0,
        })
        .select(COLS)
        .single(),
    ) as Row;
    return this.toTransformation(created);
  }

  async updateTransformation(
    id: string,
    patch: Partial<CreateTransformationInput>,
  ): Promise<Transformation | null> {
    const scalar: Record<string, unknown> = {};
    if (patch.clientName !== undefined) scalar.client_name = patch.clientName.trim();
    if (patch.title !== undefined) scalar.title = patch.title;
    if (patch.description !== undefined) scalar.description = patch.description;
    if (patch.result !== undefined) scalar.result = patch.result;
    if (patch.duration !== undefined) scalar.duration = patch.duration;
    if (patch.beforeMediaId !== undefined)
      scalar.before_media_id = patch.beforeMediaId || null;
    if (patch.afterMediaId !== undefined)
      scalar.after_media_id = patch.afterMediaId || null;
    if (Object.keys(scalar).length === 0) return this.getById(id);
    const { data, error } = await this.sb()
      .from("transformations")
      .update(scalar)
      .eq("id", id)
      .is("deleted_at", null)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return this.getById(id);
  }

  async setStatus(id: string, status: ContentStatus): Promise<Transformation | null> {
    // Publicar sin consentimiento lo rechaza el CHECK de la BD (mensaje al usuario).
    const { data, error } = await this.sb()
      .from("transformations")
      .update({ status })
      .eq("id", id)
      .is("deleted_at", null)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return this.getById(id);
  }

  async setConsent(id: string, confirmed: boolean): Promise<Transformation | null> {
    const patch: Record<string, unknown> = confirmed
      ? {
          consent_confirmed: true,
          consent_confirmed_at: new Date().toISOString(),
          consent_confirmed_by: await this.currentUserId(),
        }
      : // Al retirar el consentimiento, baja a draft en el MISMO update (satisface el CHECK).
        { consent_confirmed: false, status: "draft" };
    const { data, error } = await this.sb()
      .from("transformations")
      .update(patch)
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
      await this.sb().from("transformations").update({ position: i }).eq("id", orderedIds[i]);
    }
  }

  async deleteTransformation(id: string): Promise<boolean> {
    const { data, error } = await this.sb()
      .from("transformations")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .is("deleted_at", null)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return Boolean(data);
  }

  private async currentUserId(): Promise<string | null> {
    const { data } = await this.sb().auth.getUser();
    return data.user?.id ?? null;
  }

  private async getById(id: string): Promise<Transformation | null> {
    const { data, error } = await this.sb()
      .from("transformations")
      .select(COLS)
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? this.toTransformation(data as Row) : null;
  }
}
