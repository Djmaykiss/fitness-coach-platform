import type { ExerciseLibraryRepository } from "@/repositories/types";
import type { CreateLibraryExerciseInput, LibraryExercise } from "@/types";
import { getSupabaseClient } from "@/lib/supabase";
import { getCurrentOrgId } from "@/repositories/supabase/org-context";
import { unwrap, unwrapList } from "@/repositories/supabase/query";
import { definedOnly, keysToSnake, omit } from "@/repositories/supabase/mappers";
import { str, type Row } from "@/repositories/supabase/content-crud";

/**
 * SupabaseExerciseLibraryRepository (Bloque 2). Catálogo de ejercicios sobre
 * `library_exercises`, con la MULTIMEDIA (imagen/gif/video) normalizada en
 * `exercise_media` -> `media_assets` (diseño genérico del master plan): cada campo
 * es un "slot" (role image/gif/video). El repo ensambla/reconciliar esos slots para
 * exponer el tipo `LibraryExercise` intacto (misma interfaz que el `Local*`).
 */

const MEDIA_ROLES = ["image", "gif", "video"] as const;
type MediaRole = (typeof MEDIA_ROLES)[number];

/** kind de `media_assets` según el slot: el video suele ser un enlace (YouTube). */
const kindForRole = (role: MediaRole): string => (role === "video" ? "link" : role);

/** Columnas escalares de `library_exercises` (sin image/gif/video). */
const rowToScalar = (r: Row) => ({
  id: str(r, "id"),
  name: str(r, "name"),
  muscleGroup: str(r, "muscle_group"),
  secondaryMuscles: str(r, "secondary_muscles"),
  equipment: str(r, "equipment"),
  difficulty: str(r, "difficulty"),
  description: str(r, "description"),
  technique: str(r, "technique"),
  commonMistakes: str(r, "common_mistakes"),
  coachTips: str(r, "coach_tips"),
  variants: str(r, "variants"),
  substitutions: str(r, "substitutions"),
  recommendedTime: str(r, "recommended_time"),
  recommendedRest: str(r, "recommended_rest"),
});

const emptyMedia = (): Record<MediaRole, string> => ({ image: "", gif: "", video: "" });

export class SupabaseExerciseLibraryRepository implements ExerciseLibraryRepository {
  private sb() {
    return getSupabaseClient();
  }

  /** Media (por role -> url) de un conjunto de ejercicios. */
  private async mediaFor(exerciseIds: string[]): Promise<Map<string, Record<MediaRole, string>>> {
    const map = new Map<string, Record<MediaRole, string>>();
    if (exerciseIds.length === 0) return map;
    const rows = unwrapList(
      await this.sb()
        .from("exercise_media")
        .select("exercise_id, role, media_assets(url)")
        .in("exercise_id", exerciseIds),
    ) as Row[];
    for (const row of rows) {
      const exId = str(row, "exercise_id");
      const role = str(row, "role") as MediaRole;
      const media = row["media_assets"] as { url?: unknown } | null;
      const url = media && typeof media.url === "string" ? media.url : "";
      if (!map.has(exId)) map.set(exId, emptyMedia());
      if (MEDIA_ROLES.includes(role)) map.get(exId)![role] = url;
    }
    return map;
  }

  private assemble(scalar: ReturnType<typeof rowToScalar>, media: Record<MediaRole, string>): LibraryExercise {
    return { ...scalar, image: media.image, gif: media.gif, video: media.video };
  }

  async getExercises(): Promise<LibraryExercise[]> {
    const rows = unwrapList(
      await this.sb()
        .from("library_exercises")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
    ) as Row[];
    const scalars = rows.map(rowToScalar);
    const media = await this.mediaFor(scalars.map((s) => s.id));
    return scalars.map((s) => this.assemble(s, media.get(s.id) ?? emptyMedia()));
  }

  async getExercise(id: string): Promise<LibraryExercise | null> {
    const { data, error } = await this.sb()
      .from("library_exercises")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    const scalar = rowToScalar(data as Row);
    const media = await this.mediaFor([scalar.id]);
    return this.assemble(scalar, media.get(scalar.id) ?? emptyMedia());
  }

  async createExercise(input: CreateLibraryExerciseInput): Promise<LibraryExercise> {
    const scalarInput = omit(input as Row, ["image", "gif", "video"]);
    const row = { ...keysToSnake(scalarInput) };
    // `organization_id` lo fija el resolver; created_by opcional.
    const orgId = await this.requireOrg();
    row.organization_id = orgId;
    const created = unwrap(
      await this.sb().from("library_exercises").insert(row).select("*").single(),
    ) as Row;
    const exerciseId = str(created, "id");
    for (const role of MEDIA_ROLES) {
      const value = typeof input[role] === "string" ? (input[role] as string) : "";
      if (value.trim() !== "") await this.setSlot(exerciseId, orgId, role, value);
    }
    return this.assemble(rowToScalar(created), {
      image: input.image ?? "",
      gif: input.gif ?? "",
      video: input.video ?? "",
    });
  }

  async updateExercise(
    id: string,
    patch: Partial<CreateLibraryExerciseInput>,
  ): Promise<LibraryExercise | null> {
    // Necesitamos la org del ejercicio (para los media) y confirmar que existe.
    const { data: existing, error: exErr } = await this.sb()
      .from("library_exercises")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();
    if (exErr) throw new Error(exErr.message);
    if (!existing) return null;
    const orgId = str(existing as Row, "organization_id");

    const scalarPatch = keysToSnake(definedOnly(omit(patch as Row, ["image", "gif", "video"])));
    if (Object.keys(scalarPatch).length > 0) {
      const { error } = await this.sb().from("library_exercises").update(scalarPatch).eq("id", id);
      if (error) throw new Error(error.message);
    }

    for (const role of MEDIA_ROLES) {
      if (!(role in patch)) continue; // solo reconciliar los slots presentes en el patch
      const value = typeof patch[role] === "string" ? (patch[role] as string) : "";
      await this.reconcileSlot(id, orgId, role, value);
    }

    return this.getExercise(id);
  }

  async deleteExercise(id: string): Promise<boolean> {
    // Soft delete (paridad: el ejercicio desaparece de las listas).
    const { data, error } = await this.sb()
      .from("library_exercises")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .is("deleted_at", null)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return Boolean(data);
  }

  // ---- helpers de media ----

  private async requireOrg(): Promise<string> {
    const orgId = await getCurrentOrgId();
    if (!orgId) throw new Error("No hay una organización activa.");
    return orgId;
  }

  /** Crea (media_asset + exercise_media) para un slot vacío. */
  private async setSlot(exerciseId: string, orgId: string, role: MediaRole, url: string): Promise<void> {
    const asset = unwrap(
      await this.sb()
        .from("media_assets")
        .insert({ organization_id: orgId, kind: kindForRole(role), url })
        .select("id")
        .single(),
    ) as Row;
    const { error } = await this.sb().from("exercise_media").insert({
      organization_id: orgId,
      exercise_id: exerciseId,
      media_id: str(asset, "id"),
      role,
    });
    if (error) throw new Error(error.message);
  }

  /** Ajusta un slot al valor dado: crea, actualiza o elimina (si `url` vacío). */
  private async reconcileSlot(exerciseId: string, orgId: string, role: MediaRole, url: string): Promise<void> {
    const { data: link } = await this.sb()
      .from("exercise_media")
      .select("id, media_id")
      .eq("exercise_id", exerciseId)
      .eq("role", role)
      .maybeSingle();

    if (url.trim() !== "") {
      if (link) {
        const { error } = await this.sb()
          .from("media_assets")
          .update({ url, kind: kindForRole(role) })
          .eq("id", str(link as Row, "media_id"));
        if (error) throw new Error(error.message);
      } else {
        await this.setSlot(exerciseId, orgId, role, url);
      }
      return;
    }

    // url vacío -> quitar el slot (link + asset).
    if (link) {
      await this.sb().from("exercise_media").delete().eq("id", str(link as Row, "id"));
      await this.sb().from("media_assets").delete().eq("id", str(link as Row, "media_id"));
    }
  }
}
