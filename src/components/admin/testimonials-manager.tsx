"use client";

import { useEffect, useState } from "react";
import {
  Quote,
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Archive,
  RotateCcw,
} from "lucide-react";
import { testimonialService } from "@/services/testimonial.service";
import { useToast } from "@/context/toast-context";
import { isBlank } from "@/lib/validation";
import { currentOrgId } from "@/lib/current-org";
import { ImageUploader } from "@/components/media/image-uploader";
import type {
  ContentStatus,
  CreateTestimonialInput,
  Testimonial,
} from "@/types";

const rowBtn =
  "inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-bold text-zinc-300 transition hover:border-[#65ff4f]/50 hover:text-[#65ff4f] disabled:cursor-not-allowed disabled:opacity-40";
const rowBtnDanger =
  "inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-bold text-red-400 transition hover:border-red-500/60 hover:text-red-300";

const STATUS_LABEL: Record<ContentStatus, string> = {
  draft: "Borrador",
  public: "Público",
  archived: "Archivado",
};

type Panel = { kind: "create" } | { kind: "edit"; item: Testimonial } | null;

export function TestimonialsManager() {
  const toast = useToast();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);

  async function load() {
    setItems(await testimonialService.getTestimonials());
    setLoaded(true);
  }
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function setStatus(item: Testimonial, status: ContentStatus) {
    try {
      await testimonialService.setStatus(item.id, status);
      await load();
      toast.success(`Testimonio: ${STATUS_LABEL[status]}.`);
    } catch {
      toast.error("No se pudo cambiar el estado.");
    }
  }

  async function move(item: Testimonial, dir: -1 | 1) {
    const idx = items.findIndex((t) => t.id === item.id);
    const swap = idx + dir;
    if (swap < 0 || swap >= items.length) return;
    const ordered = [...items];
    [ordered[idx], ordered[swap]] = [ordered[swap], ordered[idx]];
    try {
      await testimonialService.reorder(ordered.map((t) => t.id));
      await load();
    } catch {
      toast.error("No se pudo reordenar.");
    }
  }

  async function remove(item: Testimonial) {
    try {
      await testimonialService.deleteTestimonial(item.id);
      await load();
      toast.success("Testimonio eliminado.");
    } catch {
      toast.error("No se pudo eliminar.");
    }
  }

  return (
    <section className="premium-card mt-6 overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 p-6">
        <div>
          <h2 className="text-2xl font-black">Testimonios</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Historias de progreso para la landing. Solo los <b>públicos</b> se muestran.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPanel({ kind: "create" })}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-b from-[#85ff73] to-[#65ff4f] px-4 py-2 text-xs font-black uppercase tracking-wide text-black shadow-[0_6px_22px_-8px_rgba(101,255,79,0.5)] transition hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0"
        >
          <Plus size={16} />
          Nuevo testimonio
        </button>
      </div>

      <div className="p-6">
        {panel ? (
          <div className="mb-6 rounded-2xl border border-[#65ff4f]/20 bg-white/[0.02] p-5">
            <TestimonialForm
              title={panel.kind === "create" ? "Nuevo testimonio" : `Editar: ${panel.item.name}`}
              initial={panel.kind === "edit" ? panel.item : undefined}
              onCancel={() => setPanel(null)}
              onSubmit={async (values) => {
                try {
                  if (panel.kind === "create") {
                    await testimonialService.createTestimonial(values);
                    toast.success("Testimonio creado (borrador). Publícalo para mostrarlo.");
                  } else {
                    await testimonialService.updateTestimonial(panel.item.id, values);
                    toast.success("Cambios guardados.");
                  }
                  setPanel(null);
                  await load();
                } catch {
                  toast.error("No se pudo guardar.");
                }
              }}
            />
          </div>
        ) : null}

        {!loaded ? (
          <p className="text-sm text-zinc-400">Cargando testimonios...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-zinc-400">
            Aún no hay testimonios. Crea el primero y publícalo para mostrarlo en la landing.
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item, i) => (
              <article
                key={item.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt={item.name} className="h-12 w-12 rounded-full border border-white/10 object-cover" />
                ) : (
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-500">
                    <Quote size={18} />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-black">
                    {item.name || "(sin nombre)"}
                    <StatusBadge status={item.status} />
                  </p>
                  <p className="mt-0.5 truncate text-xs text-zinc-500">
                    {[item.role, item.result].filter(Boolean).join(" · ")}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" className={rowBtn} disabled={i === 0} onClick={() => move(item, -1)} aria-label="Subir">
                    <ChevronUp size={14} />
                  </button>
                  <button type="button" className={rowBtn} disabled={i === items.length - 1} onClick={() => move(item, 1)} aria-label="Bajar">
                    <ChevronDown size={14} />
                  </button>
                  {item.status !== "public" ? (
                    <button type="button" className={rowBtn} onClick={() => setStatus(item, "public")}>
                      <Eye size={14} /> Publicar
                    </button>
                  ) : (
                    <button type="button" className={rowBtn} onClick={() => setStatus(item, "draft")}>
                      <EyeOff size={14} /> Despublicar
                    </button>
                  )}
                  {item.status !== "archived" ? (
                    <button type="button" className={rowBtn} onClick={() => setStatus(item, "archived")}>
                      <Archive size={14} /> Archivar
                    </button>
                  ) : (
                    <button type="button" className={rowBtn} onClick={() => setStatus(item, "draft")}>
                      <RotateCcw size={14} /> Restaurar
                    </button>
                  )}
                  <button type="button" className={rowBtn} onClick={() => setPanel({ kind: "edit", item })}>
                    <Pencil size={14} /> Editar
                  </button>
                  <button type="button" className={rowBtnDanger} onClick={() => remove(item)}>
                    <Trash2 size={14} /> Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function StatusBadge({ status }: { status: ContentStatus }) {
  const cls =
    status === "public"
      ? "border-[#65ff4f]/30 bg-[#65ff4f]/10 text-[#65ff4f]"
      : status === "archived"
        ? "border-white/10 bg-white/[0.04] text-zinc-500"
        : "border-amber-400/30 bg-amber-400/10 text-amber-300";
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-black uppercase tracking-wide ${cls}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

function TestimonialForm({
  title,
  initial,
  onSubmit,
  onCancel,
}: {
  title: string;
  initial?: Testimonial;
  onSubmit: (values: CreateTestimonialInput) => Promise<void>;
  onCancel: () => void;
}) {
  const toast = useToast();
  const [name, setName] = useState(initial?.name ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [result, setResult] = useState(initial?.result ?? "");
  const [quote, setQuote] = useState(initial?.quote ?? "");
  const [imageMediaId, setImageMediaId] = useState(initial?.imageMediaId ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [orgId, setOrgId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    currentOrgId().then((id) => {
      if (active) setOrgId(id);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (isBlank(name)) {
          setError("El nombre es obligatorio.");
          return;
        }
        if (isBlank(quote)) {
          setError("La cita del testimonio es obligatoria.");
          return;
        }
        setError(null);
        setSaving(true);
        await onSubmit({ name, role, result, quote, imageMediaId });
        setSaving(false);
      }}
    >
      <h3 className="mb-4 text-lg font-black">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nombre">
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Ej: Carlos R." required />
        </Field>
        <Field label="Rol / contexto">
          <input value={role} onChange={(e) => setRole(e.target.value)} className={inputClass} placeholder="Ej: Profesional ocupado" />
        </Field>
        <Field label="Resultado">
          <input value={result} onChange={(e) => setResult(e.target.value)} className={inputClass} placeholder="Ej: -8 kg" />
        </Field>
      </div>
      <div className="mt-3">
        <Field label="Cita">
          <textarea value={quote} onChange={(e) => setQuote(e.target.value)} rows={3} className={inputClass} placeholder="Lo que dijo el alumno…" required />
        </Field>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-sm font-bold text-zinc-200">Imagen (opcional)</p>
        {imageUrl ? (
          <div className="mb-2 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="" className="h-16 w-16 rounded-full border border-white/10 object-cover" />
            <button
              type="button"
              onClick={() => {
                setImageMediaId("");
                setImageUrl("");
              }}
              className={rowBtn}
            >
              Quitar imagen
            </button>
          </div>
        ) : null}
        <ImageUploader
          bucket="content-media"
          pathPrefix=""
          mediaContext="testimonial"
          mediaOwnerKind="testimonial"
          orgId={orgId}
          onMediaSaved={(asset) => {
            setImageMediaId(asset.id);
            setImageUrl(asset.url);
            toast.success("Imagen lista.");
          }}
          hint="JPG, PNG o WebP · se optimiza automáticamente"
        />
      </div>

      {error ? <p className="mt-3 text-sm font-bold text-red-400">{error}</p> : null}
      <div className="mt-5 flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-[#85ff73] to-[#65ff4f] px-5 text-sm font-black uppercase tracking-wide text-black transition hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar"}
        </button>
        <button type="button" onClick={onCancel} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 px-5 text-sm font-bold text-zinc-300 transition hover:border-[#65ff4f]/50 hover:text-[#65ff4f]">
          Cancelar
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "mt-2 w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-white outline-none transition placeholder:text-zinc-600 hover:border-white/20 focus:border-[#65ff4f] focus:bg-black/50 focus:shadow-[0_0_0_3px_rgba(101,255,79,0.12)]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-bold text-zinc-200">
      {label}
      {children}
    </label>
  );
}
