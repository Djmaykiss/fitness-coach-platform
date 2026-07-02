"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { defaultSettings } from "@/data/settings";
import { settingsService, whatsappLink } from "@/services/settings.service";
import type { BusinessSettings } from "@/types";

type SettingsContextValue = {
  settings: BusinessSettings;
  loaded: boolean;
  /** Recarga la configuracion desde el almacenamiento (tras guardar cambios). */
  refresh: () => Promise<void>;
  /** Enlace de WhatsApp al negocio con mensaje prellenado. */
  whatsappUrl: (message: string) => string;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

/**
 * Provee la configuracion del negocio (white-label) a toda la app. Carga desde el
 * almacenamiento en el cliente; hasta que carga usa los valores por defecto (mismo
 * contenido que el seed, asi no hay parpadeo). Aplica los colores de marca como
 * variables CSS (`--brand`, `--brand-2`) para usos futuros de theming.
 */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<BusinessSettings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  const apply = useCallback((s: BusinessSettings) => {
    setSettings(s);
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty("--brand", s.primaryColor);
      document.documentElement.style.setProperty("--brand-2", s.secondaryColor);
    }
  }, []);

  const refresh = useCallback(async () => {
    const s = await settingsService.get();
    apply(s);
  }, [apply]);

  useEffect(() => {
    let active = true;
    settingsService.get().then((s) => {
      if (!active) return;
      apply(s);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, [apply]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      loaded,
      refresh,
      whatsappUrl: (message: string) => whatsappLink(settings.whatsapp, message),
    }),
    [settings, loaded, refresh],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings debe usarse dentro de <SettingsProvider>.");
  }
  return context;
}
