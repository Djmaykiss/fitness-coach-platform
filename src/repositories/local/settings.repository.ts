import { defaultSettings } from "@/data/settings";
import { resolveMock } from "@/repositories/async";
import type { SettingsRepository } from "@/repositories/types";
import { STORAGE_KEYS, readValue, writeValue } from "@/lib/local-store";
import type { BusinessSettings } from "@/types";

/**
 * Configuracion del negocio persistida como registro unico en localStorage.
 * Si no existe, devuelve (y siembra) los valores por defecto. Los campos nuevos
 * que se agreguen en el futuro se completan con el default (merge), para no romper
 * configuraciones guardadas por versiones anteriores.
 */
export class LocalSettingsRepository implements SettingsRepository {
  private read(): BusinessSettings {
    const stored = readValue<Partial<BusinessSettings>>(STORAGE_KEYS.settings);
    return { ...defaultSettings, ...(stored ?? {}) };
  }

  get() {
    return resolveMock(this.read());
  }

  save(patch: Partial<BusinessSettings>) {
    const next: BusinessSettings = { ...this.read(), ...patch };
    writeValue(STORAGE_KEYS.settings, next);
    return resolveMock(next);
  }
}
