"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Compass,
  Eye,
  EyeOff,
  Flame,
  Layers,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { discoverService } from "@/services/discover.service";
import type {
  CreateDiscoverArticle,
  CreateDiscoverCategory,
  CreateDiscoverRoutine,
  DiscoverArticle,
  DiscoverCategory,
  DiscoverRoutine,
} from "@/types";

const LEVELS = ["Principiante", "Intermedio", "Avanzado"];
const ICON_OPTIONS = [
  { value: "dumbbell", label: "Mancuerna" },
  { value: "flame", label: "Llama" },
  { value: "activity", label: "Actividad" },
  { value: "target", label: "Diana" },
  { value: "zap", label: "Rayo" },
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

type Tab = "routines" | "categories" | "articles";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "routines", label: "Rutinas", icon: <Flame size={14} /> },
  { key: "categories", label: "Categorías", icon: <Layers size={14} /> },
  { key: "articles", label: "Artículos", icon: <BookOpen size={14} /> },
];

export function DiscoverManager() {
  const [tab, setTab] = useState<Tab>("routines");

  return (
    <section className="premium-card mt-6 overflow-hidden rounded-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 p-6">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-black">
            <Compass size={20} className="text-[#65ff4f]" />
            Descubre
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Administra el contenido que ven tus alumnos: rutinas destacadas,
            categorías y artículos. Solo lo publicado es visible para el alumno.
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
        {tab === "routines" ? <RoutinesSection /> : null}
        {tab === "categories" ? <CategoriesSection /> : null}
        {tab === "articles" ? <ArticlesSection /> : null}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Rutinas                                                                     */
/* -------------------------------------------------------------------------- */

type RoutinePanel =
  | { kind: "create" }
  | { kind: "edit"; item: DiscoverRoutine }
  | { kind: "delete"; item: DiscoverRoutine }
  | null;

function RoutinesSection() {
  const [items, setItems] = useState<DiscoverRoutine[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [panel, setPanel] = useState<RoutinePanel>(null);

  async function load() {
    setItems(await discoverService.getRoutines());
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
          Nueva rutina
        </button>
      </div>

      {panel ? (
        <div className="mb-6 rounded-2xl border border-[#65ff4f]/20 bg-white/[0.02] p-5">
          {panel.kind === "create" ? (
            <RoutineForm
              title="Nueva rutina destacada"
              onCancel={() => setPanel(null)}
              onSubmit={async (values) => {
                await discoverService.createRoutine(values);
                setPanel(null);
                await load();
              }}
            />
          ) : null}
          {panel.kind === "edit" ? (
            <RoutineForm
              title={`Editar: ${panel.item.name}`}
              initial={panel.item}
              onCancel={() => setPanel(null)}
              onSubmit={async (values) => {
                await discoverService.updateRoutine(panel.item.id, values);
                setPanel(null);
                await load();
              }}
            />
          ) : null}
          {panel.kind === "delete" ? (
            <DeleteConfirm
              name={panel.item.name}
              onCancel={() => setPanel(null)}
              onConfirm={async () => {
                await discoverService.deleteRoutine(panel.item.id);
                setPanel(null);
                await load();
              }}
            />
          ) : null}
        </div>
      ) : null}

      {!loaded ? (
        <p className="text-sm text-zinc-400">Cargando rutinas...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-zinc-400">Aún no hay rutinas. Crea la primera.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((r) => (
            <article key={r.id} className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-lg font-black">{r.name}</p>
                <PublishBadge published={r.published} />
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold">
                <Chip>{r.category || "—"}</Chip>
                <Chip>{r.level || "—"}</Chip>
                {r.minutes ? <Chip>{r.minutes}</Chip> : null}
                {r.duration ? <Chip>{r.duration}</Chip> : null}
              </div>
              {r.description ? (
                <p className="mt-3 text-sm leading-6 text-zinc-400">{r.description}</p>
              ) : null}
              <CardActions
                published={r.published}
                onTogglePublish={async () => {
                  await discoverService.setRoutinePublished(r.id, !r.published);
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

function RoutineForm({
  title,
  initial,
  onSubmit,
  onCancel,
}: {
  title: string;
  initial?: DiscoverRoutine;
  onSubmit: (values: CreateDiscoverRoutine) => Promise<void>;
  onCancel: () => void;
}) {
  const [v, setV] = useState<CreateDiscoverRoutine>({
    name: initial?.name ?? "",
    category: initial?.category ?? "",
    level: initial?.level ?? LEVELS[1],
    duration: initial?.duration ?? "",
    minutes: initial?.minutes ?? "",
    description: initial?.description ?? "",
    image: initial?.image ?? "",
  });
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof CreateDiscoverRoutine>(
    key: K,
    value: CreateDiscoverRoutine[K],
  ) => setV((prev) => ({ ...prev, [key]: value }));

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!v.name.trim()) return;
        setSaving(true);
        await onSubmit(v);
      }}
    >
      <h3 className="mb-4 text-lg font-black">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <Text label="Título" value={v.name} onChange={(x) => set("name", x)} required />
        <Text label="Categoría" value={v.category} onChange={(x) => set("category", x)} placeholder="Ej: Cuerpo completo" />
        <label className="block text-sm font-bold text-zinc-200">
          Nivel
          <select value={v.level} onChange={(e) => set("level", e.target.value)} className={inputClass}>
            {LEVELS.map((l) => (
              <option key={l} value={l} className="bg-[#0a0d0b]">
                {l}
              </option>
            ))}
          </select>
        </label>
        <Text label="Duración" value={v.duration} onChange={(x) => set("duration", x)} placeholder="Ej: 6 semanas" />
        <Text label="Minutos" value={v.minutes} onChange={(x) => set("minutes", x)} placeholder="Ej: 30 min" />
        <Text label="Imagen (URL, opcional)" value={v.image} onChange={(x) => set("image", x)} placeholder="https://..." />
      </div>
      <div className="mt-3">
        <Area label="Descripción" value={v.description} onChange={(x) => set("description", x)} />
      </div>
      <FormActions saving={saving} onCancel={onCancel} label="Guardar rutina" />
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/* Categorías                                                                  */
/* -------------------------------------------------------------------------- */

type CategoryPanel =
  | { kind: "create" }
  | { kind: "edit"; item: DiscoverCategory }
  | { kind: "delete"; item: DiscoverCategory }
  | null;

function CategoriesSection() {
  const [items, setItems] = useState<DiscoverCategory[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [panel, setPanel] = useState<CategoryPanel>(null);

  async function load() {
    setItems(await discoverService.getCategories());
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
          Nueva categoría
        </button>
      </div>

      {panel ? (
        <div className="mb-6 rounded-2xl border border-[#65ff4f]/20 bg-white/[0.02] p-5">
          {panel.kind === "create" ? (
            <CategoryForm
              title="Nueva categoría"
              onCancel={() => setPanel(null)}
              onSubmit={async (values) => {
                await discoverService.createCategory(values);
                setPanel(null);
                await load();
              }}
            />
          ) : null}
          {panel.kind === "edit" ? (
            <CategoryForm
              title={`Editar: ${panel.item.label}`}
              initial={panel.item}
              onCancel={() => setPanel(null)}
              onSubmit={async (values) => {
                await discoverService.updateCategory(panel.item.id, values);
                setPanel(null);
                await load();
              }}
            />
          ) : null}
          {panel.kind === "delete" ? (
            <DeleteConfirm
              name={panel.item.label}
              onCancel={() => setPanel(null)}
              onConfirm={async () => {
                await discoverService.deleteCategory(panel.item.id);
                setPanel(null);
                await load();
              }}
            />
          ) : null}
        </div>
      ) : null}

      {!loaded ? (
        <p className="text-sm text-zinc-400">Cargando categorías...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-zinc-400">Aún no hay categorías. Crea la primera.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <article key={c.id} className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-lg font-black">{c.label}</p>
                <PublishBadge published={c.published} />
              </div>
              <p className="mt-1 text-sm text-zinc-400">{c.description}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                <Chip>Icono: {c.icon || "—"}</Chip>
                {c.muscleGroups.length > 0 ? (
                  <Chip>{c.muscleGroups.join(", ")}</Chip>
                ) : null}
              </div>
              <CardActions
                published={c.published}
                onTogglePublish={async () => {
                  await discoverService.setCategoryPublished(c.id, !c.published);
                  await load();
                }}
                onEdit={() => setPanel({ kind: "edit", item: c })}
                onDelete={() => setPanel({ kind: "delete", item: c })}
              />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryForm({
  title,
  initial,
  onSubmit,
  onCancel,
}: {
  title: string;
  initial?: DiscoverCategory;
  onSubmit: (values: CreateDiscoverCategory) => Promise<void>;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? ICON_OPTIONS[0].value);
  const [groups, setGroups] = useState((initial?.muscleGroups ?? []).join(", "));
  const [saving, setSaving] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!label.trim()) return;
        setSaving(true);
        await onSubmit({
          label,
          description,
          icon,
          muscleGroups: groups
            .split(",")
            .map((g) => g.trim())
            .filter(Boolean),
        });
      }}
    >
      <h3 className="mb-4 text-lg font-black">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <Text label="Nombre" value={label} onChange={setLabel} required />
        <label className="block text-sm font-bold text-zinc-200">
          Icono
          <select value={icon} onChange={(e) => setIcon(e.target.value)} className={inputClass}>
            {ICON_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-[#0a0d0b]">
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-3">
        <Area label="Descripción" value={description} onChange={setDescription} />
      </div>
      <div className="mt-3">
        <Text
          label="Grupos musculares relacionados (separados por coma)"
          value={groups}
          onChange={setGroups}
          placeholder="Ej: Pecho, Espalda, Core"
        />
        <p className="mt-1 text-xs text-zinc-500">
          Deben coincidir con el grupo muscular de los ejercicios de la biblioteca
          para mostrar cuántos ejercicios tiene la categoría.
        </p>
      </div>
      <FormActions saving={saving} onCancel={onCancel} label="Guardar categoría" />
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/* Artículos                                                                   */
/* -------------------------------------------------------------------------- */

type ArticlePanel =
  | { kind: "create" }
  | { kind: "edit"; item: DiscoverArticle }
  | { kind: "delete"; item: DiscoverArticle }
  | null;

function ArticlesSection() {
  const [items, setItems] = useState<DiscoverArticle[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [panel, setPanel] = useState<ArticlePanel>(null);

  async function load() {
    setItems(await discoverService.getArticles());
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
          Nuevo artículo
        </button>
      </div>

      {panel ? (
        <div className="mb-6 rounded-2xl border border-[#65ff4f]/20 bg-white/[0.02] p-5">
          {panel.kind === "create" ? (
            <ArticleForm
              title="Nuevo artículo"
              onCancel={() => setPanel(null)}
              onSubmit={async (values) => {
                await discoverService.createArticle(values);
                setPanel(null);
                await load();
              }}
            />
          ) : null}
          {panel.kind === "edit" ? (
            <ArticleForm
              title={`Editar: ${panel.item.title}`}
              initial={panel.item}
              onCancel={() => setPanel(null)}
              onSubmit={async (values) => {
                await discoverService.updateArticle(panel.item.id, values);
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
                await discoverService.deleteArticle(panel.item.id);
                setPanel(null);
                await load();
              }}
            />
          ) : null}
        </div>
      ) : null}

      {!loaded ? (
        <p className="text-sm text-zinc-400">Cargando artículos...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-zinc-400">Aún no hay artículos. Crea el primero.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => (
            <article key={a.id} className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-lg font-black leading-snug">{a.title}</p>
                <PublishBadge published={a.published} />
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold">
                <Chip>{a.category || "—"}</Chip>
                {a.readTime ? <Chip>{a.readTime}</Chip> : null}
              </div>
              {a.content ? (
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-400">
                  {a.content}
                </p>
              ) : null}
              <CardActions
                published={a.published}
                onTogglePublish={async () => {
                  await discoverService.setArticlePublished(a.id, !a.published);
                  await load();
                }}
                onEdit={() => setPanel({ kind: "edit", item: a })}
                onDelete={() => setPanel({ kind: "delete", item: a })}
              />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function ArticleForm({
  title,
  initial,
  onSubmit,
  onCancel,
}: {
  title: string;
  initial?: DiscoverArticle;
  onSubmit: (values: CreateDiscoverArticle) => Promise<void>;
  onCancel: () => void;
}) {
  const [v, setV] = useState<CreateDiscoverArticle>({
    title: initial?.title ?? "",
    category: initial?.category ?? "",
    readTime: initial?.readTime ?? "",
    content: initial?.content ?? "",
    image: initial?.image ?? "",
  });
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof CreateDiscoverArticle>(
    key: K,
    value: CreateDiscoverArticle[K],
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
        <Text label="Categoría" value={v.category} onChange={(x) => set("category", x)} placeholder="Ej: Nutrición" />
        <Text label="Tiempo de lectura" value={v.readTime} onChange={(x) => set("readTime", x)} placeholder="Ej: 4 min" />
        <Text label="Imagen (URL, opcional)" value={v.image} onChange={(x) => set("image", x)} placeholder="https://..." />
      </div>
      <div className="mt-3">
        <Area label="Contenido" value={v.content} onChange={(x) => set("content", x)} rows={5} />
      </div>
      <FormActions saving={saving} onCancel={onCancel} label="Guardar artículo" />
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/* Reutilizables                                                               */
/* -------------------------------------------------------------------------- */

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
          Se quitará de la sección Descubre. No se puede deshacer.
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
    <span className="inline-flex items-center rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1 text-zinc-300">
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
