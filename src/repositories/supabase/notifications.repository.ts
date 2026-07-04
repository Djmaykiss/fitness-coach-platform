import type { NotificationsRepository } from "@/repositories/types";
import { getSupabaseClient } from "@/lib/supabase";
import { getCurrentOrgId } from "@/repositories/supabase/org-context";
import { unwrapList } from "@/repositories/supabase/query";
import { str, type Row } from "@/repositories/supabase/content-crud";

/**
 * SupabaseNotificationsRepository (Bloque 9). Persiste SOLO el estado LEÍDO de las
 * notificaciones (que se DERIVAN en el servicio) sobre la tabla `notifications` del
 * master plan: una fila por (org, recipient=auth.uid(), dedupe_key = id derivado) con
 * `read_at`. Misma interfaz que el `Local*` (getReadIds/markRead/markAllRead).
 */

export class SupabaseNotificationsRepository implements NotificationsRepository {
  private sb() {
    return getSupabaseClient();
  }

  /** org + uid de la sesión (recipient). Devuelve null si no hay sesión/org. */
  private async ctx(): Promise<{ org: string; uid: string } | null> {
    const { data } = await this.sb().auth.getSession();
    const uid = data.session?.user?.id;
    if (!uid) return null;
    const org = await getCurrentOrgId();
    if (!org) return null;
    return { org, uid };
  }

  async getReadIds(): Promise<string[]> {
    const ctx = await this.ctx();
    if (!ctx) return [];
    const rows = unwrapList(
      await this.sb()
        .from("notifications")
        .select("dedupe_key")
        .eq("recipient_profile_id", ctx.uid)
        .not("read_at", "is", null),
    ) as Row[];
    return rows.map((r) => str(r, "dedupe_key"));
  }

  async markRead(id: string): Promise<string[]> {
    const ctx = await this.ctx();
    if (!ctx) return [];
    await this.sb()
      .from("notifications")
      .upsert(
        {
          organization_id: ctx.org,
          recipient_profile_id: ctx.uid,
          dedupe_key: id,
          read_at: new Date().toISOString(),
        },
        { onConflict: "organization_id,recipient_profile_id,dedupe_key" },
      );
    return this.getReadIds();
  }

  async markAllRead(ids: string[]): Promise<string[]> {
    const ctx = await this.ctx();
    if (!ctx) return [];
    if (ids.length > 0) {
      const now = new Date().toISOString();
      const rows = ids.map((id) => ({
        organization_id: ctx.org,
        recipient_profile_id: ctx.uid,
        dedupe_key: id,
        read_at: now,
      }));
      await this.sb()
        .from("notifications")
        .upsert(rows, { onConflict: "organization_id,recipient_profile_id,dedupe_key" });
    }
    return this.getReadIds();
  }
}
