"use client";

import { useEffect, useState } from "react";
import {
  Images,
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Archive,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { transformationService } from "@/services/transformation.service";
import { useToast } from "@/context/toast-context";
import { isBlank } from "@/lib/validation";
import { currentOrgId } from "@/lib/current-org";
import { ImageUploader } from "@/components/media/image-uploader";
import type {
  ContentStatus,
  CreateTransformationInput,
  Transformation,
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

type Panel = { kind: "create" } | { kind: "edit"; item: Transformation } | null;

export function TransformationsManager() {
  const toast = useToast();
  const [items, setItems] = useState<Transformation[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  /** Id de la transformación para la que se pide confirmar consentimiento antes de publicar. */
  const [confirmFor, setConfirmFor] = useState<string | null>(null);

  async function load() {
    setItems(await transformationService.getTransformations());
    setLoaded(true);
  }
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function setStatus(item: Transformation, status: ContentStatus) {
    // Publicar exige consentimiento: si falta, abrir la confirmación en vez de publicar.
    if (status === "public" && !item.consentConfirmed) {
      setConfirmFor(item.id);
      return;
    }
    try {
      await transformationService.setStatus(item.id, status);
      await load();
      toast.success(`Transformación: ${STATUS_LABEL[status]}.`);
    } catch {
      toast.error("No se pudo cambiar el estado.");
    }
  }

  /** Confirma el consentimiento y publica en un solo flujo. */
  async function confirmAndPublish(item: Transformation) {
    try {
      await transformationService.setConsent(item.id, true);
      await transformationService.setStatus(item.id, "public");
      setConfirmFor(null);
      await load();
      toast.success("Consentimiento confirmado. Transformación publicada.");
    } catch {
      toast.error("No se pudo publicar.");
    }
  }

  async function revokeConsent(item: Transformation) {
    try {
      await transformationService.setConsent(item.id, false);
      await load();
      toast.success("Consentimiento retirado. Volvió a borrador.");
    } catch {
      toast.error("No se pudo actualizar el consentimiento.");
    }
  }

  async function move(item: Transformation, dir: -1 | 1) {
    const idx = items.findIndex((t) => t.id === item.id);
    const swap = idx + dir;
    if (swap < 0 || swap >= items.length) return;
    const ordered = [...items];
    [ordered[idx], ordered[swap]] = [ordered[swap], ordered[idx]];
    try {
      await transformationService.reorder(ordered.map((t) => t.id));
      await load();
    } catch {
      toast.error("No se pudo reordenar.");
    }
  }

  async function remove(item: Transformation) {
    try {
      await transformationService.deleteTransformation(item.id);
      await load();
      toast.success("Transformación eliminada.");
    } catch {
      toast.error("No se pudo eliminar.");
    }
  }

  return (
    <section className="premium-card mt-6 overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 p-6">
        <div>
          <h2 className="text-2xl font-black">Transformaciones</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Antes/Después para la landing. Solo se muestran las <b>públicas</b> con
            consentimiento confirmado.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPanel({ kind: "create" })}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-b from-[#85ff73] to-[#65ff4f] px-4 py-2 text-xs font-black uppercase tracking-wide text-black shadow-[0_6px_22px_-8px_rgba(101,255,79,0.5)] transition hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0"
        >
          <Plus size={16} />
          Nueva transformación
        </button>
      </div>

      <div className="p-6">
        {panel ? (
          <div className="mb-6 rounded-2xl border border-[#65ff4f]/20 bg-white/[0.02] p-5">
            <TransformationForm
              title={
                panel.kind === "create"
                  ? "Nueva transformación"
                  : `Editar: ${panel.item.clientName}`
              }
              initial={panel.kind === "edit" ? panel.item : undefined}
              onCancel={() => setPanel(null)}
              onSubmit={async (values) => {
                try {
                  if (panel.kind === "create") {
                    await transformationService.createTransformation(values);
                    toast.success(
                      "Transformación creada (borrador). Confirma el consentimiento y publícala.",
                    );
                  } else {
                    await transformationService.updateTransformation(panel.item.id, values);
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
          <p className="text-sm text-zinc-400">Cargando transformaciones...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-zinc-400">
            Aún no hay transformaciones. Crea la primera, confirma el consentimiento y
            publícala para mostrarla en la landing.
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item, i) => (
              <article
                key={item.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <ThumbPair item={item} />
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 font-black">
                      {item.clientName || "(sin nombre)"}
                      <StatusBadge status={item.status} />
                      <ConsentBadge confirmed={item.consentConfirmed} />
                    </p>
                    <p className="mt-0.5 truncate text-xs text-zinc-500">
                      {[item.title, item.result, item.duration].filter(Boolean).join(" · ")}
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
                    {item.consentConfirmed ? (
                      <button type="button" className={rowBtn} onClick={() => revokeConsent(item)}>
                        <ShieldAlert size={14} /> Quitar consentimiento
                      </button>
                    ) : null}
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
                </div>

                {confirmFor === item.id ? (
                  <ConsentConfirm
                    onCancel={() => setConfirmFor(null)}
                    onConfirm={() => confirmAndPublish(item)}
                  />
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ThumbPair({ item }: { item: Transformation }) {
  return (
    <span className="flex shrink-0 items-center gap-1">
      <Thumb url={item.beforeUrl} label="Antes" />
      <Thumb url={item.afterUrl} label="Después" after />
    </span>
  );
}

function Thumb({ url, label, after = false }: { url: string; label: string; after?: boolean }) {
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={label}
      title={label}
      className={`h-12 w-12 rounded-lg border object-cover ${after ? "border-[#65ff4f]/40" : "border-white/10"}`}
    />
  ) : (
    <span
      title={label}
      className={`inline-flex h-12 w-12 items-center justify-center rounded-lg border bg-white/[0.04] text-zinc-500 ${after ? "border-[#65ff4f]/30" : "border-white/10"}`}
    >
      <Images size={16} />
    </span>
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

function ConsentBadge({ confirmed }: { confirmed: boolean }) {
  return confirmed ? (
    <span className="inline-flex items-center gap-1 rounded-md border border-[#65ff4f]/25 bg-[#65ff4f]/5 px-2 py-0.5 text-[11px] font-bold text-[#65ff4f]">
      <ShieldCheck size={12} /> Consentimiento
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/25 bg-amber-400/5 px-2 py-0.5 text-[11px] font-bold text-amber-300">
      <ShieldAlert size={12} /> Sin consentimiento
    </span>
  );
}

function ConsentConfirm({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [checked, setChecked] = useState(false);
  return (
    <div className="mt-3 rounded-xl border border-amber-400/30 bg-amber-400/[0.06] p-4">
      <p className="flex items-center gap-2 text-sm font-bold text-amber-200">
        <ShieldAlert size={16} /> Confirmar autorización para publicar
      </p>
      <label className="mt-3 flex items-start gap-2 text-sm text-zinc-200">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-[#65ff4f]"
        />
        <span>
          Confirmo que tengo autorización del alumno para publicar sus imágenes
          Antes/Después en la landing.
        </span>
      </label>
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          disabled={!checked}
          onClick={onConfirm}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-[#85ff73] to-[#65ff4f] px-4 text-xs font-black uppercase tracking-wide text-black transition hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ShieldCheck size={14} /> Confirmar y publicar
        </button>
        <button type="button" onClick={onCancel} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/15 px-4 text-xs font-bold text-zinc-300 transition hover:border-white/30">
          Cancelar
        </button>
      </div>
    </div>
  );
}

function TransformationForm({
  title,
  initial,
  onSubmit,
  onCancel,
}: {
  title: string;
  initial?: Transformation;
  onSubmit: (values: CreateTransformationInput) => Promise<void>;
  onCancel: () => void;
}) {
  const toast = useToast();
  const [clientName, setClientName] = useState(initial?.clientName ?? "");
  const [ttl, setTtl] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [result, setResult] = useState(initial?.result ?? "");
  const [duration, setDuration] = useState(initial?.duration ?? "");
  const [beforeMediaId, setBeforeMediaId] = useState(initial?.beforeMediaId ?? "");
  const [beforeUrl, setBeforeUrl] = useState(initial?.beforeUrl ?? "");
  const [afterMediaId, setAfterMediaId] = useState(initial?.afterMediaId ?? "");
  const [afterUrl, setAfterUrl] = useState(initial?.afterUrl ?? "");
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
        if (isBlank(clientName)) {
          setError("El nombre del alumno es obligatorio.");
          return;
        }
        setError(null);
        setSaving(true);
        await onSubmit({
          clientName,
          title: ttl,
          description,
          result,
          duration,
          beforeMediaId,
          afterMediaId,
        });
        setSaving(false);
      }}
    >
      <h3 className="mb-4 text-lg font-black">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nombre del alumno">
          <input value={clientName} onChange={(e) => setClientName(e.target.value)} className={inputClass} placeholder="Ej: Carlos R." required />
        </Field>
        <Field label="Título / objetivo">
          <input value={ttl} onChange={(e) => setTtl(e.target.value)} className={inputClass} placeholder="Ej: Recomposición corporal" />
        </Field>
        <Field label="Resultado">
          <input value={result} onChange={(e) => setResult(e.target.value)} className={inputClass} placeholder="Ej: -8 kg en 12 semanas" />
        </Field>
        <Field label="Duración">
          <input value={duration} onChange={(e) => setDuration(e.target.value)} className={inputClass} placeholder="Ej: 12 semanas" />
        </Field>
      </div>
      <div className="mt-3">
        <Field label="Descripción">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={inputClass} placeholder="Enfoque del proceso…" />
        </Field>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <ImageSlot
          label="Imagen Antes"
          url={beforeUrl}
          orgId={orgId}
          onClear={() => {
            setBeforeMediaId("");
            setBeforeUrl("");
          }}
          onSaved={(id, url) => {
            setBeforeMediaId(id);
            setBeforeUrl(url);
            toast.success("Imagen Antes lista.");
          }}
        />
        <ImageSlot
          label="Imagen Después"
          url={afterUrl}
          orgId={orgId}
          onClear={() => {
            setAfterMediaId("");
            setAfterUrl("");
          }}
          onSaved={(id, url) => {
            setAfterMediaId(id);
            setAfterUrl(url);
            toast.success("Imagen Después lista.");
          }}
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

function ImageSlot({
  label,
  url,
  orgId,
  onSaved,
  onClear,
}: {
  label: string;
  url: string;
  orgId: string;
  onSaved: (id: string, url: string) => void;
  onClear: () => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold text-zinc-200">{label} (opcional)</p>
      {url ? (
        <div className="mb-2 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="h-20 w-20 rounded-lg border border-white/10 object-cover" />
          <button type="button" onClick={onClear} className={rowBtn}>
            Quitar
          </button>
        </div>
      ) : null}
      <ImageUploader
        bucket="transformation-images"
        pathPrefix=""
        mediaContext="transformation"
        mediaOwnerKind="transformation"
        orgId={orgId}
        onMediaSaved={(asset) => onSaved(asset.id, asset.url)}
        hint="JPG, PNG o WebP · se optimiza automáticamente"
      />
    </div>
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
