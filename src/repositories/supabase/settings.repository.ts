import type { SettingsRepository } from "@/repositories/types";
import type { BusinessSettings } from "@/types";
import { defaultSettings } from "@/data/settings";
import { getSupabaseClient } from "@/lib/supabase";
import { getCurrentOrgId } from "@/repositories/supabase/org-context";
import { definedOnly, keysToSnake } from "@/repositories/supabase/mappers";

/**
 * SupabaseSettingsRepository (Bloque 1 de APP_MIGRATION_PLAN.md).
 *
 * La configuración del negocio (white-label) vive en la fila `organizations` de la
 * org activa. Cumple la MISMA interfaz que `LocalSettingsRepository` (get/save), por
 * lo que `settingsService`, `SettingsProvider` y la UI no cambian.
 *
 * - `get()`  lee la org activa; sin org (anónimo) devuelve `defaultSettings`.
 * - `save()` hace UPDATE de la org activa (RLS permite solo a staff de esa org).
 */

/** Columnas de `organizations` que componen la configuración (orden alfabético). */
const COLUMNS =
  "business_name,tagline,description,logo_url,phone,whatsapp,email,address," +
  "schedule,instagram,facebook,tiktok,youtube,policies,terms,primary_color," +
  "secondary_color,monthly_price,currency";

function str(row: Record<string, unknown>, key: string, fallback = ""): string {
  const v = row[key];
  return typeof v === "string" ? v : fallback;
}

function num(row: Record<string, unknown>, key: string, fallback: number): number {
  const v = row[key];
  if (typeof v === "number") return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function rowToSettings(row: Record<string, unknown>): BusinessSettings {
  return {
    businessName: str(row, "business_name", defaultSettings.businessName),
    tagline: str(row, "tagline"),
    description: str(row, "description"),
    logoUrl: str(row, "logo_url"),
    phone: str(row, "phone"),
    whatsapp: str(row, "whatsapp"),
    email: str(row, "email"),
    address: str(row, "address"),
    schedule: str(row, "schedule"),
    instagram: str(row, "instagram"),
    facebook: str(row, "facebook"),
    tiktok: str(row, "tiktok"),
    youtube: str(row, "youtube"),
    policies: str(row, "policies"),
    terms: str(row, "terms"),
    primaryColor: str(row, "primary_color", defaultSettings.primaryColor),
    secondaryColor: str(row, "secondary_color", defaultSettings.secondaryColor),
    monthlyPrice: num(row, "monthly_price", defaultSettings.monthlyPrice),
    currency: str(row, "currency", defaultSettings.currency),
  };
}

export class SupabaseSettingsRepository implements SettingsRepository {
  async get(): Promise<BusinessSettings> {
    const orgId = await getCurrentOrgId();
    if (!orgId) return defaultSettings;
    const sb = getSupabaseClient();
    const { data, error } = await sb
      .from("organizations")
      .select(COLUMNS)
      .eq("id", orgId)
      .maybeSingle();
    if (error || !data) return defaultSettings;
    return rowToSettings(data as unknown as Record<string, unknown>);
  }

  async save(patch: Partial<BusinessSettings>): Promise<BusinessSettings> {
    const orgId = await getCurrentOrgId();
    if (!orgId) throw new Error("No hay una organización activa para guardar la configuración.");
    const sb = getSupabaseClient();
    const row = keysToSnake(definedOnly(patch));
    const { data, error } = await sb
      .from("organizations")
      .update(row)
      .eq("id", orgId)
      .select(COLUMNS)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? rowToSettings(data as unknown as Record<string, unknown>) : { ...defaultSettings, ...patch };
  }
}
