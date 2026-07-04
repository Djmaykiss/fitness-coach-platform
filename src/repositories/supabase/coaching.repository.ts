import type { CoachingRepository } from "@/repositories/types";
import type {
  ChatMessage,
  ChecklistChecks,
  CreateProgressPhoto,
  ProgressPhoto,
} from "@/types";
import { getSupabaseClient } from "@/lib/supabase";
import { unwrap, unwrapList } from "@/repositories/supabase/query";
import { str, bool, type Row } from "@/repositories/supabase/content-crud";

/**
 * SupabaseCoachingRepository (Bloque 7). Actividad del alumno: fotos de progreso
 * (`progress_photos`), checklists (`client_checklists`) y chat (modelo COMPLETO
 * `conversations`+`conversation_members`+`messages`). El chat conserva la interfaz
 * `getChat`/`addChatMessage`: internamente resuelve/crea la conversación 1:1
 * (`kind='direct'`) por `client_id`. Misma interfaz que el `Local*`. Las imágenes se
 * guardan como TEXTO (dataURL/URL), sin usar el bucket todavía (paridad). RLS: staff +
 * alumno dueño.
 */

const rowToPhoto = (r: Row): ProgressPhoto => ({
  id: str(r, "id"),
  date: str(r, "date"),
  front: str(r, "front"),
  side: str(r, "side"),
  back: str(r, "back"),
  note: str(r, "note"),
});

const rowToMessage = (r: Row): ChatMessage => ({
  from: (str(r, "sender_role") || "alumno") as ChatMessage["from"],
  text: str(r, "body"),
  time: str(r, "time"),
});

export class SupabaseCoachingRepository implements CoachingRepository {
  private sb() {
    return getSupabaseClient();
  }

  private async clientOrg(clientId: string): Promise<string> {
    const { data } = await this.sb()
      .from("clients")
      .select("organization_id")
      .eq("id", clientId)
      .maybeSingle();
    return data ? str(data as Row, "organization_id") : "";
  }

  // ---------- fotos de progreso ----------

  async getPhotos(clientId: string): Promise<ProgressPhoto[]> {
    const rows = unwrapList(
      await this.sb()
        .from("progress_photos")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false }),
    ) as Row[];
    return rows.map(rowToPhoto);
  }

  async addPhoto(clientId: string, photo: CreateProgressPhoto): Promise<ProgressPhoto> {
    const org = await this.clientOrg(clientId);
    const created = unwrap(
      await this.sb()
        .from("progress_photos")
        .insert({
          organization_id: org,
          client_id: clientId,
          date: photo.date,
          front: photo.front,
          side: photo.side,
          back: photo.back,
          note: photo.note,
        })
        .select("*")
        .single(),
    ) as Row;
    return rowToPhoto(created);
  }

  // ---------- checklists ----------

  async getChecks(clientId: string): Promise<ChecklistChecks> {
    const rows = unwrapList(
      await this.sb()
        .from("client_checklists")
        .select("list_key, item_key, done")
        .eq("client_id", clientId),
    ) as Row[];
    const out: ChecklistChecks = {};
    for (const r of rows) {
      const listKey = str(r, "list_key");
      const itemKey = str(r, "item_key");
      if (!out[listKey]) out[listKey] = {};
      out[listKey][itemKey] = bool(r, "done");
    }
    return out;
  }

  async setCheck(
    clientId: string,
    listKey: string,
    itemKey: string,
    done: boolean,
  ): Promise<ChecklistChecks> {
    const org = await this.clientOrg(clientId);
    await this.sb()
      .from("client_checklists")
      .upsert(
        { organization_id: org, client_id: clientId, list_key: listKey, item_key: itemKey, done },
        { onConflict: "client_id,list_key,item_key" },
      );
    return this.getChecks(clientId);
  }

  // ---------- chat (conversations + messages) ----------

  /** Id de la conversación 1:1 (`direct`) del cliente, o null si aún no existe. */
  private async findConversation(clientId: string): Promise<string | null> {
    const { data } = await this.sb()
      .from("conversations")
      .select("id")
      .eq("client_id", clientId)
      .eq("kind", "direct")
      .is("deleted_at", null)
      .maybeSingle();
    return data ? str(data as Row, "id") : null;
  }

  /** Resuelve o crea la conversación 1:1 del cliente (unique parcial evita duplicados). */
  private async ensureConversation(clientId: string, org: string): Promise<string> {
    const existing = await this.findConversation(clientId);
    if (existing) return existing;
    const { data, error } = await this.sb()
      .from("conversations")
      .insert({ organization_id: org, kind: "direct", client_id: clientId })
      .select("id")
      .single();
    if (error) {
      const again = await this.findConversation(clientId); // carrera: re-resolver
      if (again) return again;
      throw new Error(error.message);
    }
    return str(data as Row, "id");
  }

  async getChat(clientId: string): Promise<ChatMessage[]> {
    const conversationId = await this.findConversation(clientId);
    if (!conversationId) return [];
    const rows = unwrapList(
      await this.sb()
        .from("messages")
        .select("sender_role, body, time")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true }),
    ) as Row[];
    return rows.map(rowToMessage);
  }

  async addChatMessage(clientId: string, message: ChatMessage): Promise<ChatMessage[]> {
    const org = await this.clientOrg(clientId);
    const conversationId = await this.ensureConversation(clientId, org);
    await this.sb().from("messages").insert({
      organization_id: org,
      conversation_id: conversationId,
      sender_role: message.from,
      body: message.text,
      time: message.time,
    });
    return this.getChat(clientId);
  }

  // ---------- limpieza ----------

  async removeClient(clientId: string): Promise<void> {
    await this.sb().from("progress_photos").delete().eq("client_id", clientId);
    await this.sb().from("client_checklists").delete().eq("client_id", clientId);
    // Borra las conversaciones del cliente (cascade -> members + messages).
    await this.sb().from("conversations").delete().eq("client_id", clientId);
  }
}
