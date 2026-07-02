"use client";

import { useEffect, useState } from "react";
import {
  AtSign,
  Building2,
  Globe,
  ImageIcon,
  Mail,
  MapPin,
  Music,
  Palette,
  Phone,
  Save,
  Video,
} from "lucide-react";
import { settingsService } from "@/services/settings.service";
import { useSettings } from "@/context/settings-context";
import { useToast } from "@/context/toast-context";
import { isValidEmail, isValidUrlOrEmpty } from "@/lib/validation";
import type { BusinessSettings } from "@/types";

const primaryBtn =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-[#85ff73] to-[#65ff4f] px-5 text-sm font-black uppercase tracking-wide text-black shadow-[0_8px_30px_-8px_rgba(101,255,79,0.5)] transition duration-300 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";
const inputClass =
  "mt-2 w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-white outline-none transition duration-300 placeholder:text-zinc-600 hover:border-white/20 focus:border-[#65ff4f] focus:bg-black/50 focus:shadow-[0_0_0_3px_rgba(101,255,79,0.12)]";

export function BusinessSettingsManager() {
  const toast = useToast();
  const { refresh } = useSettings();
  const [v, setV] = useState<BusinessSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    settingsService.get().then((s) => {
      if (active) setV(s);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!v) {
    return (
      <section className="premium-card mt-6 rounded-2xl p-6">
        <p className="text-sm text-zinc-400">Cargando configuración...</p>
      </section>
    );
  }

  const set = <K extends keyof BusinessSettings>(
    key: K,
    value: BusinessSettings[K],
  ) => setV((prev) => (prev ? { ...prev, [key]: value } : prev));

  async function save() {
    if (!v) return;
    if (!v.businessName.trim()) {
      setError("El nombre del negocio es obligatorio.");
      return;
    }
    if (v.email.trim() && !isValidEmail(v.email)) {
      setError("El correo no es válido.");
      return;
    }
    for (const [label, url] of [
      ["Instagram", v.instagram],
      ["Facebook", v.facebook],
      ["TikTok", v.tiktok],
      ["YouTube", v.youtube],
      ["Logo", v.logoUrl],
    ] as const) {
      if (!isValidUrlOrEmpty(url)) {
        setError(`El enlace de ${label} no es una URL válida.`);
        return;
      }
    }
    setError(null);
    setSaving(true);
    try {
      await settingsService.update({
        ...v,
        whatsapp: v.whatsapp.replace(/\D/g, ""),
        monthlyPrice: Number(v.monthlyPrice) || 0,
      });
      await refresh();
      toast.success("Configuración guardada.");
    } catch {
      toast.error("No se pudo guardar la configuración.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="premium-card mt-6 overflow-hidden rounded-2xl">
      <div className="flex items-center gap-3 border-b border-white/10 p-6">
        <span className="inline-flex rounded-lg border border-[#65ff4f]/20 bg-[#65ff4f]/10 p-2 text-[#65ff4f]">
          <Building2 size={20} />
        </span>
        <div>
          <h2 className="text-2xl font-black">Configuración del negocio</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Tu marca, contacto y datos legales. Esto personaliza la plataforma.
          </p>
        </div>
      </div>

      <div className="space-y-6 p-6">
        <Group icon={<ImageIcon size={15} />} title="Marca">
          <div className="grid gap-3 sm:grid-cols-2">
            <Text label="Nombre del negocio" value={v.businessName} onChange={(x) => set("businessName", x)} required />
            <Text label="Eslogan" value={v.tagline} onChange={(x) => set("tagline", x)} placeholder="Ej: Fitness Coaching" />
          </div>
          <Area label="Descripción" value={v.description} onChange={(x) => set("description", x)} />
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Text label="Logo (URL)" value={v.logoUrl} onChange={(x) => set("logoUrl", x)} placeholder="https://..." />
            <div className="flex items-end">
              <LogoPreview src={v.logoUrl} />
            </div>
          </div>
        </Group>

        <Group icon={<Phone size={15} />} title="Contacto">
          <div className="grid gap-3 sm:grid-cols-2">
            <Text label="Teléfono" value={v.phone} onChange={(x) => set("phone", x)} placeholder="+1 555 0000" />
            <Text label="WhatsApp (solo dígitos)" value={v.whatsapp} onChange={(x) => set("whatsapp", x)} placeholder="17868704262" />
            <Text label="Correo" value={v.email} onChange={(x) => set("email", x)} placeholder="coach@correo.com" />
            <Text label="Horario de atención" value={v.schedule} onChange={(x) => set("schedule", x)} placeholder="Lun-Vie 8:00-18:00" />
          </div>
          <Text label="Dirección" value={v.address} onChange={(x) => set("address", x)} placeholder="Ciudad, país" icon={<MapPin size={14} />} />
        </Group>

        <Group icon={<Globe size={15} />} title="Redes sociales">
          <div className="grid gap-3 sm:grid-cols-2">
            <Text label="Instagram (URL)" value={v.instagram} onChange={(x) => set("instagram", x)} placeholder="https://instagram.com/..." icon={<AtSign size={14} />} />
            <Text label="Facebook (URL)" value={v.facebook} onChange={(x) => set("facebook", x)} placeholder="https://facebook.com/..." icon={<Globe size={14} />} />
            <Text label="TikTok (URL)" value={v.tiktok} onChange={(x) => set("tiktok", x)} placeholder="https://tiktok.com/@..." icon={<Music size={14} />} />
            <Text label="YouTube (URL)" value={v.youtube} onChange={(x) => set("youtube", x)} placeholder="https://youtube.com/@..." icon={<Video size={14} />} />
          </div>
        </Group>

        <Group icon={<Mail size={15} />} title="Legales">
          <Area label="Políticas" value={v.policies} onChange={(x) => set("policies", x)} placeholder="Política de privacidad, cancelaciones, etc." />
          <Area label="Términos y condiciones" value={v.terms} onChange={(x) => set("terms", x)} />
        </Group>

        <Group icon={<Palette size={15} />} title="Marca visual y negocio">
          <div className="grid gap-3 sm:grid-cols-2">
            <ColorField label="Color principal" value={v.primaryColor} onChange={(x) => set("primaryColor", x)} />
            <ColorField label="Color secundario" value={v.secondaryColor} onChange={(x) => set("secondaryColor", x)} />
            <label className="block text-sm font-bold text-zinc-200">
              Precio mensual por alumno
              <input
                type="number"
                min="0"
                value={String(v.monthlyPrice)}
                onChange={(e) => set("monthlyPrice", Number(e.target.value))}
                className={inputClass}
              />
            </label>
            <Text label="Moneda" value={v.currency} onChange={(x) => set("currency", x)} placeholder="USD" />
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Los colores se guardan para tu marca; la interfaz mantiene la paleta
            actual (el theming completo llegará en una próxima versión).
          </p>
        </Group>

        {error ? (
          <p className="rounded-lg border border-red-500/40 bg-red-500/[0.08] px-3 py-2 text-sm font-semibold text-red-300">
            {error}
          </p>
        ) : null}

        <button type="button" onClick={save} disabled={saving} className={primaryBtn}>
          <Save size={16} />
          {saving ? "Guardando..." : "Guardar configuración"}
        </button>
      </div>
    </section>
  );
}

function Group({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <p className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#65ff4f]">
        {icon}
        {title}
      </p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function LogoPreview({ src }: { src: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  const ok = Boolean(src) && failed !== src;
  return (
    <div className="flex h-[42px] w-[42px] items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] text-zinc-600">
      {ok ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="logo" className="h-full w-full object-contain" onError={() => setFailed(src)} />
      ) : (
        <ImageIcon size={18} />
      )}
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-bold text-zinc-200">
      {label}
      <span className="mt-2 flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-white/10 bg-black/35"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full rounded-lg border border-white/10 bg-black/35 px-3 text-white outline-none focus:border-[#65ff4f]"
        />
      </span>
    </label>
  );
}

function Text({
  label,
  value,
  onChange,
  placeholder,
  required,
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-bold text-zinc-200">
      <span className="inline-flex items-center gap-1.5">
        {icon ? <span className="text-[#65ff4f]">{icon}</span> : null}
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={inputClass}
      />
    </label>
  );
}

function Area({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm font-bold text-zinc-200">
      {label}
      <textarea
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
    </label>
  );
}
