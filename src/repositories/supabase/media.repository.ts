import type { MediaRepository } from "@/repositories/media.types";
import type { CreateMediaAsset, MediaAsset, MediaQuery } from "@/types";
import { getSupabaseClient } from "@/lib/supabase";
import { getCurrentOrgId } from "@/repositories/supabase/org-context";
import { unwrap, unwrapList } from "@/repositories/supabase/query";
import { str, type Row } from "@/repositories/supabase/content-crud";

/**
 * SupabaseMediaRepository — metadata de medios del coach sobre `media_assets`
 * (columnas de imagen añadidas en la migración 0020). Misma interfaz que el `Local*`.
 * RLS: staff-CRUD por org, SELECT para miembros de la org (0008). `remove` = SOFT DELETE.
 */

const COLS =
  "id, bucket, path, url, thumb_path, thumb_url, mime, size, width, height, checksum, title, context, owner_kind, owner_id, metadata, created_at";

const num = (row: Row, key: string): number => {
  const v = row[key];
  if (typeof v === "number") return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export class SupabaseMediaRepository implements MediaRepository {
  private sb() {
    return getSupabaseClient();
  }

  private async requireOrg(): Promise<string> {
    const orgId = await getCurrentOrgId();
    if (!orgId) throw new Error("No hay una organización activa.");
    return orgId;
  }

  private toAsset(row: Row): MediaAsset {
    const meta = row.metadata;
    return {
      id: str(row, "id"),
      kind: "image",
      bucket: str(row, "bucket"),
      path: str(row, "path"),
      url: str(row, "url"),
      thumbPath: str(row, "thumb_path"),
      thumbUrl: str(row, "thumb_url"),
      mime: str(row, "mime"),
      width: num(row, "width"),
      height: num(row, "height"),
      size: num(row, "size"),
      checksum: str(row, "checksum"),
      title: str(row, "title"),
      context: str(row, "context"),
      ownerKind: str(row, "owner_kind"),
      ownerId: str(row, "owner_id"),
      metadata: (meta && typeof meta === "object" ? (meta as Record<string, unknown>) : {}),
      createdAt: str(row, "created_at"),
    };
  }

  async list(query?: MediaQuery): Promise<MediaAsset[]> {
    let q = this.sb()
      .from("media_assets")
      .select(COLS)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    if (query?.context) q = q.eq("context", query.context);
    if (query?.ownerKind) q = q.eq("owner_kind", query.ownerKind);
    if (query?.ownerId) q = q.eq("owner_id", query.ownerId);
    const rows = unwrapList(await q) as Row[];
    return rows.map((r) => this.toAsset(r));
  }

  async create(input: CreateMediaAsset): Promise<MediaAsset> {
    const org = await this.requireOrg();
    const created = unwrap(
      await this.sb()
        .from("media_assets")
        .insert({
          organization_id: org,
          kind: "image",
          bucket: input.bucket,
          path: input.path,
          url: input.url,
          thumb_path: input.thumbPath,
          thumb_url: input.thumbUrl,
          mime: input.mime,
          size: input.size,
          width: input.width,
          height: input.height,
          checksum: input.checksum,
          title: input.title,
          context: input.context,
          owner_kind: input.ownerKind || null,
          owner_id: input.ownerId || null,
          metadata: input.metadata ?? {},
        })
        .select(COLS)
        .single(),
    ) as Row;
    return this.toAsset(created);
  }

  async remove(id: string): Promise<boolean> {
    const { data, error } = await this.sb()
      .from("media_assets")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .is("deleted_at", null)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return Boolean(data);
  }

  async findByChecksum(checksum: string): Promise<MediaAsset | null> {
    if (!checksum) return null;
    const { data, error } = await this.sb()
      .from("media_assets")
      .select(COLS)
      .eq("checksum", checksum)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? this.toAsset(data as Row) : null;
  }
}
