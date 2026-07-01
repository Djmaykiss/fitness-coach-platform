"use client";

import { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  Gift,
  MessageSquareQuote,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { onboardingContentService } from "@/services/onboarding-content.service";
import type {
  CreateOnboardingMessage,
  CreateOnboardingPrediction,
  CreateOnboardingReward,
  OnboardingMessage,
  OnboardingPrediction,
  OnboardingReward,
} from "@/types";

/** Objetivos del onboarding (para segmentar mensajes y predicciones) + General. */
const OBJECTIVE_OPTIONS = [
  "General",
  "Perder grasa",
  "Ganar músculo",
  "Recomposición corporal",
  "Tonificar",
  "Mejorar condición física",
  "Rendimiento deportivo",
];

const REWARD_ICON_OPTIONS = [
  { value: "target", label: "Diana" },
  { value: "trophy", label: "Trofeo" },
  { value: "sparkles", label: "Destellos" },
  { value: "gift", label: "Regalo" },
  { value: "star", label: "Estrella" },
  { value: "medal", label: "Medalla" },
];

const primaryBtn =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-[#85ff73] to-[#65ff4f] px-5 text-sm font-black uppercase tracking-wide text-black shadow-[0_8px_30px_-8px_rgba(101,255,79,0.5)] transition duration-300 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0";
const secondaryBtn =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 px-5 text-sm font-bold text-zinc-300 transition duration-300 hover:border-[#65ff4f]/50 hover:bg-[#65ff4f]/5 hover:text-[#65ff4f]";
const dangerBtn =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-red-500/40 px-5 text-sm font-bold text-red-400 transition duration-300 hover:border-red-500/70 hover:bg-red-500/5 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60";
const rowBtn =
  "inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-bold text-zinc-300 transition hover:border-[#65ff4f]/50 hover:text-[#65ff4f]";
const rowBtnDanger =
  "inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-bold text-red-400 transition hover:border-red-500/60 hover:text-red-300";
const inputClass =
  "mt-2 w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-white outline-none transition duration-300 placeholder:text-zinc-600 hover:border-white/20 focus:border-[#65ff4f] focus:bg-black/50 focus:shadow-[0_0_0_3px_rgba(101,255,79,0.12)]";

type Tab = "messages" | "rewards" | "predictions";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "messages", label: "Mensajes", icon: <MessageSquareQuote size={14} /> },
  { key: "rewards", label: "Recompensas", icon: <Gift size={14} /> },
  { key: "predictions", label: "Predicción", icon: <TrendingUp size={14} /> },
];

export function OnboardingContentManager() {
  const [tab, setTab] = useState<Tab>("messages");

  return (
    <section className="premium-card mt-6 overflow-hidden rounded-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 p-6">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-black">
            <Sparkles size={20} className="text-[#65ff4f]" />
            Onboarding
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Administra los mensajes motivacionales, recompensas y textos de
            predicción que verá el alumno al evaluarse. Solo lo publicado se usa.
          </p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-white/10 px-4 pt-4 sm:px-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-t-lg border-b-2 px-4 py-2 text-sm font-bold transition ${
              tab === t.key
                ? "border-[#65ff4f] text-[#65ff4f]"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {tab === "messages" ? <MessagesSection /> : null}
        {tab === "rewards" ? <RewardsSection /> : null}
        {tab === "predictions" ? <PredictionsSection /> : null}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Mensajes motivacionales                                                     */
/* -------------------------------------------------------------------------- */

type MessagePanel =
  | { kind: "create" }
  | { kind: "edit"; item: OnboardingMessage }
  | { kind: "delete"; item: OnboardingMessage }
  | null;

function MessagesSection() {
  const [items, setItems] = useState<OnboardingMessage[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [panel, setPanel] = useState<MessagePanel>(null);

  async function load() {
    setItems(await onboardingContentService.getMessages());
    setLoaded(true);
  }
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  return (
    <div>
      <div className="mb-5 flex justify-end">
        <button type="button" onClick={() => setPanel({ kind: "create" })} className={primaryBtn}>
          <Plus size={16} />
          Nuevo mensaje
        </button>
      </div>

      {panel ? (
        <div className="mb-6 rounded-2xl border border-[#65ff4f]/20 bg-white/[0.02] p-5">
          {panel.kind === "create" ? (
            <MessageForm
              title="Nuevo mensaje motivacional"
              onCancel={() => setPanel(null)}
              onSubmit={async (values) => {
                await onboardingContentService.createMessage(values);
                setPanel(null);
                await load();
              }}
            />
          ) : null}
          {panel.kind === "edit" ? (
            <MessageForm
              title="Editar mensaje"
              initial={panel.item}
              onCancel={() => setPanel(null)}
              onSubmit={async (values) => {
                await onboardingContentService.updateMessage(panel.item.id, values);
                setPanel(null);
                await load();
              }}
            />
          ) : null}
          {panel.kind === "delete" ? (
            <DeleteConfirm
              name={panel.item.message}
              onCancel={() => setPanel(null)}
              onConfirm={async () => {
                await onboardingContentService.deleteMessage(panel.item.id);
                setPanel(null);
                await load();
              }}
            />
          ) : null}
        </div>
      ) : null}

      {!loaded ? (
        <p className="text-sm text-zinc-400">Cargando mensajes...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-zinc-400">Aún no hay mensajes. Crea el primero.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((m) => (
            <article key={m.id} className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-start justify-between gap-2">
                <Chip>{m.category || "General"}</Chip>
                <PublishBadge published={m.published} />
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-200">“{m.message}”</p>
              <CardActions
                published={m.published}
                onTogglePublish={async () => {
                  await onboardingContentService.setMessagePublished(m.id, !m.published);
                  await load();
                }}
                onEdit={() => setPanel({ kind: "edit", item: m })}
                onDelete={() => setPanel({ kind: "delete", item: m })}
              />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function MessageForm({
  title,
  initial,
  onSubmit,
  onCancel,
}: {
  title: string;
  initial?: OnboardingMessage;
  onSubmit: (values: CreateOnboardingMessage) => Promise<void>;
  onCancel: () => void;
}) {
  const [message, setMessage] = useState(initial?.message ?? "");
  const [category, setCategory] = useState(initial?.category ?? "General");
  const [saving, setSaving] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        setSaving(true);
        await onSubmit({ message, category });
      }}
    >
      <h3 className="mb-4 text-lg font-black">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <ObjectiveSelect label="Segmento" value={category} onChange={setCategory} />
      </div>
      <div className="mt-3">
        <Area label="Mensaje" value={message} onChange={setMessage} rows={3} />
      </div>
      <FormActions saving={saving} onCancel={onCancel} label="Guardar mensaje" />
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/* Recompensas                                                                 */
/* -------------------------------------------------------------------------- */

type RewardPanel =
  | { kind: "create" }
  | { kind: "edit"; item: OnboardingReward }
  | { kind: "delete"; item: OnboardingReward }
  | null;

function RewardsSection() {
  const [items, setItems] = useState<OnboardingReward[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [panel, setPanel] = useState<RewardPanel>(null);

  async function load() {
    setItems(await onboardingContentService.getRewards());
    setLoaded(true);
  }
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  return (
    <div>
      <div className="mb-5 flex justify-end">
        <button type="button" onClick={() => setPanel({ kind: "create" })} className={primaryBtn}>
          <Plus size={16} />
          Nueva recompensa
        </button>
      </div>

      {panel ? (
        <div className="mb-6 rounded-2xl border border-[#65ff4f]/20 bg-white/[0.02] p-5">
          {panel.kind === "create" ? (
            <RewardForm
              title="Nueva recompensa"
              onCancel={() => setPanel(null)}
              onSubmit={async (values) => {
                await onboardingContentService.createReward(values);
                setPanel(null);
                await load();
              }}
            />
          ) : null}
          {panel.kind === "edit" ? (
            <RewardForm
              title={`Editar: ${panel.item.title}`}
              initial={panel.item}
              onCancel={() => setPanel(null)}
              onSubmit={async (values) => {
                await onboardingContentService.updateReward(panel.item.id, values);
                setPanel(null);
                await load();
              }}
            />
          ) : null}
          {panel.kind === "delete" ? (
            <DeleteConfirm
              name={panel.item.title}
              onCancel={() => setPanel(null)}
              onConfirm={async () => {
                await onboardingContentService.deleteReward(panel.item.id);
                setPanel(null);
                await load();
              }}
            />
          ) : null}
        </div>
      ) : null}

      {!loaded ? (
        <p className="text-sm text-zinc-400">Cargando recompensas...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-zinc-400">Aún no hay recompensas. Crea la primera.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((r) => (
            <article key={r.id} className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-lg font-black">{r.title}</p>
                <PublishBadge published={r.published} />
              </div>
              <Chip>Icono: {r.icon || "—"}</Chip>
              {r.description ? (
                <p className="mt-3 text-sm leading-6 text-zinc-400">{r.description}</p>
              ) : null}
              <CardActions
                published={r.published}
                onTogglePublish={async () => {
                  await onboardingContentService.setRewardPublished(r.id, !r.published);
                  await load();
                }}
                onEdit={() => setPanel({ kind: "edit", item: r })}
                onDelete={() => setPanel({ kind: "delete", item: r })}
              />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function RewardForm({
  title,
  initial,
  onSubmit,
  onCancel,
}: {
  title: string;
  initial?: OnboardingReward;
  onSubmit: (values: CreateOnboardingReward) => Promise<void>;
  onCancel: () => void;
}) {
  const [v, setV] = useState<CreateOnboardingReward>({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    icon: initial?.icon ?? REWARD_ICON_OPTIONS[0].value,
  });
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof CreateOnboardingReward>(
    key: K,
    value: CreateOnboardingReward[K],
  ) => setV((prev) => ({ ...prev, [key]: value }));

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!v.title.trim()) return;
        setSaving(true);
        await onSubmit(v);
      }}
    >
      <h3 className="mb-4 text-lg font-black">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <Text label="Título" value={v.title} onChange={(x) => set("title", x)} required />
        <label className="block text-sm font-bold text-zinc-200">
          Icono
          <select value={v.icon} onChange={(e) => set("icon", e.target.value)} className={inputClass}>
            {REWARD_ICON_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-[#0a0d0b]">
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-3">
        <Area label="Descripción" value={v.description} onChange={(x) => set("description", x)} />
      </div>
      <FormActions saving={saving} onCancel={onCancel} label="Guardar recompensa" />
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/* Predicciones                                                                */
/* -------------------------------------------------------------------------- */

type PredictionPanel =
  | { kind: "create" }
  | { kind: "edit"; item: OnboardingPrediction }
  | { kind: "delete"; item: OnboardingPrediction }
  | null;

function PredictionsSection() {
  const [items, setItems] = useState<OnboardingPrediction[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [panel, setPanel] = useState<PredictionPanel>(null);

  async function load() {
    setItems(await onboardingContentService.getPredictions());
    setLoaded(true);
  }
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  return (
    <div>
      <div className="mb-5 flex justify-end">
        <button type="button" onClick={() => setPanel({ kind: "create" })} className={primaryBtn}>
          <Plus size={16} />
          Nueva predicción
        </button>
      </div>

      {panel ? (
        <div className="mb-6 rounded-2xl border border-[#65ff4f]/20 bg-white/[0.02] p-5">
          {panel.kind === "create" ? (
            <PredictionForm
              title="Nueva predicción"
              onCancel={() => setPanel(null)}
              onSubmit={async (values) => {
                await onboardingContentService.createPrediction(values);
                setPanel(null);
                await load();
              }}
            />
          ) : null}
          {panel.kind === "edit" ? (
            <PredictionForm
              title={`Editar: ${panel.item.title}`}
              initial={panel.item}
              onCancel={() => setPanel(null)}
              onSubmit={async (values) => {
                await onboardingContentService.updatePrediction(panel.item.id, values);
                setPanel(null);
                await load();
              }}
            />
          ) : null}
          {panel.kind === "delete" ? (
            <DeleteConfirm
              name={panel.item.title}
              onCancel={() => setPanel(null)}
              onConfirm={async () => {
                await onboardingContentService.deletePrediction(panel.item.id);
                setPanel(null);
                await load();
              }}
            />
          ) : null}
        </div>
      ) : null}

      {!loaded ? (
        <p className="text-sm text-zinc-400">Cargando predicciones...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-zinc-400">Aún no hay predicciones. Crea la primera.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <article key={p.id} className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-lg font-black leading-snug">{p.title}</p>
                <PublishBadge published={p.published} />
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold">
                <Chip>{p.objective || "General"}</Chip>
                {p.timeframe ? <Chip>{p.timeframe}</Chip> : null}
              </div>
              {p.body ? (
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-400">{p.body}</p>
              ) : null}
              <CardActions
                published={p.published}
                onTogglePublish={async () => {
                  await onboardingContentService.setPredictionPublished(p.id, !p.published);
                  await load();
                }}
                onEdit={() => setPanel({ kind: "edit", item: p })}
                onDelete={() => setPanel({ kind: "delete", item: p })}
              />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function PredictionForm({
  title,
  initial,
  onSubmit,
  onCancel,
}: {
  title: string;
  initial?: OnboardingPrediction;
  onSubmit: (values: CreateOnboardingPrediction) => Promise<void>;
  onCancel: () => void;
}) {
  const [v, setV] = useState<CreateOnboardingPrediction>({
    objective: initial?.objective ?? "General",
    title: initial?.title ?? "",
    body: initial?.body ?? "",
    timeframe: initial?.timeframe ?? "",
  });
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof CreateOnboardingPrediction>(
    key: K,
    value: CreateOnboardingPrediction[K],
  ) => setV((prev) => ({ ...prev, [key]: value }));

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!v.title.trim()) return;
        setSaving(true);
        await onSubmit(v);
      }}
    >
      <h3 className="mb-4 text-lg font-black">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <ObjectiveSelect
          label="Objetivo"
          value={v.objective}
          onChange={(x) => set("objective", x)}
        />
        <Text label="Horizonte" value={v.timeframe} onChange={(x) => set("timeframe", x)} placeholder="Ej: 12 semanas" />
      </div>
      <div className="mt-3">
        <Text label="Título" value={v.title} onChange={(x) => set("title", x)} required />
      </div>
      <div className="mt-3">
        <Area label="Texto de predicción" value={v.body} onChange={(x) => set("body", x)} rows={4} />
      </div>
      <FormActions saving={saving} onCancel={onCancel} label="Guardar predicción" />
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/* Reutilizables                                                               */
/* -------------------------------------------------------------------------- */

function ObjectiveSelect({
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
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
        {OBJECTIVE_OPTIONS.map((o) => (
          <option key={o} value={o} className="bg-[#0a0d0b]">
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function PublishBadge({ published }: { published: boolean }) {
  return published ? (
    <span className="shrink-0 rounded-full border border-[#65ff4f]/30 bg-[#65ff4f]/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-[#65ff4f]">
      Publicado
    </span>
  ) : (
    <span className="shrink-0 rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-zinc-500">
      Borrador
    </span>
  );
}

function CardActions({
  published,
  onTogglePublish,
  onEdit,
  onDelete,
}: {
  published: boolean;
  onTogglePublish: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <button type="button" className={rowBtn} onClick={onTogglePublish}>
        {published ? <EyeOff size={14} /> : <Eye size={14} />}
        {published ? "Despublicar" : "Publicar"}
      </button>
      <button type="button" className={rowBtn} onClick={onEdit}>
        <Pencil size={14} />
        Editar
      </button>
      <button type="button" className={rowBtnDanger} onClick={onDelete}>
        <Trash2 size={14} />
        Eliminar
      </button>
    </div>
  );
}

function DeleteConfirm({
  name,
  onConfirm,
  onCancel,
}: {
  name: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}) {
  const [saving, setSaving] = useState(false);
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-red-500/30 bg-red-500/[0.06] p-4 text-sm leading-6">
        <p className="font-bold text-white">¿Eliminar “{name}”?</p>
        <p className="mt-1 text-zinc-400">
          Se quitará del contenido del onboarding. No se puede deshacer.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={saving}
          className={dangerBtn}
          onClick={async () => {
            setSaving(true);
            await onConfirm();
          }}
        >
          <Trash2 size={16} />
          {saving ? "Eliminando..." : "Sí, eliminar"}
        </button>
        <button type="button" onClick={onCancel} className={secondaryBtn}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

function FormActions({
  saving,
  onCancel,
  label,
}: {
  saving: boolean;
  onCancel: () => void;
  label: string;
}) {
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <button type="submit" disabled={saving} className={primaryBtn}>
        {saving ? "Guardando..." : label}
      </button>
      <button type="button" onClick={onCancel} className={secondaryBtn}>
        Cancelar
      </button>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex w-fit items-center rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-bold text-zinc-300">
      {children}
    </span>
  );
}

function Text({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-bold text-zinc-200">
      {label}
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
  rows = 2,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="block text-sm font-bold text-zinc-200">
      {label}
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </label>
  );
}
