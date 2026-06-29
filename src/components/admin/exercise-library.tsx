"use client";

import { useEffect, useState } from "react";
import { Dumbbell, Pencil, Plus, Trash2 } from "lucide-react";
import { exerciseLibraryService } from "@/services/exercise-library.service";
import type { CreateLibraryExerciseInput, LibraryExercise } from "@/types";

const DIFFICULTIES = ["Principiante", "Intermedio", "Avanzado"];

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

type Panel =
  | { kind: "create" }
  | { kind: "edit"; exercise: LibraryExercise }
  | { kind: "delete"; exercise: LibraryExercise }
  | null;

export function ExerciseLibraryManager() {
  const [exercises, setExercises] = useState<LibraryExercise[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);

  async function load() {
    setExercises(await exerciseLibraryService.getExercises());
    setLoaded(true);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  return (
    <section className="premium-card mt-6 overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 p-6">
        <div>
          <h2 className="text-2xl font-black">Biblioteca de ejercicios</h2>
          <p className="mt-1 text-sm text-zinc-400">
            El catálogo que usarás para armar los programas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPanel({ kind: "create" })}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-b from-[#85ff73] to-[#65ff4f] px-4 py-2 text-xs font-black uppercase tracking-wide text-black shadow-[0_6px_22px_-8px_rgba(101,255,79,0.5)] transition duration-300 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.98]"
        >
          <Plus size={16} />
          Nuevo ejercicio
        </button>
      </div>

      <div className="p-6">
        {panel ? (
          <div className="mb-6 rounded-2xl border border-[#65ff4f]/20 bg-white/[0.02] p-5">
            {panel.kind === "create" ? (
              <ExerciseForm
                title="Nuevo ejercicio"
                onCancel={() => setPanel(null)}
                onSubmit={async (values) => {
                  await exerciseLibraryService.createExercise(values);
                  setPanel(null);
                  await load();
                }}
              />
            ) : null}
            {panel.kind === "edit" ? (
              <ExerciseForm
                title={`Editar: ${panel.exercise.name}`}
                initial={panel.exercise}
                onCancel={() => setPanel(null)}
                onSubmit={async (values) => {
                  await exerciseLibraryService.updateExercise(
                    panel.exercise.id,
                    values,
                  );
                  setPanel(null);
                  await load();
                }}
              />
            ) : null}
            {panel.kind === "delete" ? (
              <DeleteConfirm
                exercise={panel.exercise}
                onCancel={() => setPanel(null)}
                onConfirm={async () => {
                  await exerciseLibraryService.deleteExercise(panel.exercise.id);
                  setPanel(null);
                  await load();
                }}
              />
            ) : null}
          </div>
        ) : null}

        {!loaded ? (
          <p className="text-sm text-zinc-400">Cargando biblioteca...</p>
        ) : exercises.length === 0 ? (
          <p className="text-sm text-zinc-400">
            Aún no hay ejercicios. Crea el primero.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exercises.map((ex) => (
              <article
                key={ex.id}
                className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <p className="flex items-center gap-2 text-lg font-black">
                  <Dumbbell size={16} className="text-[#65ff4f]" />
                  {ex.name}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                  <Chip>{ex.muscleGroup || "—"}</Chip>
                  <Chip>{ex.difficulty || "—"}</Chip>
                  {ex.equipment ? <Chip>{ex.equipment}</Chip> : null}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={rowBtn}
                    onClick={() => setPanel({ kind: "edit", exercise: ex })}
                  >
                    <Pencil size={14} />
                    Editar
                  </button>
                  <button
                    type="button"
                    className={rowBtnDanger}
                    onClick={() => setPanel({ kind: "delete", exercise: ex })}
                  >
                    <Trash2 size={14} />
                    Eliminar
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

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1 text-zinc-300">
      {children}
    </span>
  );
}

function ExerciseForm({
  title,
  initial,
  onSubmit,
  onCancel,
}: {
  title: string;
  initial?: LibraryExercise;
  onSubmit: (values: CreateLibraryExerciseInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [v, setV] = useState<CreateLibraryExerciseInput>({
    name: initial?.name ?? "",
    muscleGroup: initial?.muscleGroup ?? "",
    secondaryMuscles: initial?.secondaryMuscles ?? "",
    image: initial?.image ?? "",
    gif: initial?.gif ?? "",
    video: initial?.video ?? "",
    equipment: initial?.equipment ?? "",
    difficulty: initial?.difficulty ?? DIFFICULTIES[1],
    description: initial?.description ?? "",
    technique: initial?.technique ?? "",
    commonMistakes: initial?.commonMistakes ?? "",
    coachTips: initial?.coachTips ?? "",
    variants: initial?.variants ?? "",
    substitutions: initial?.substitutions ?? "",
    recommendedTime: initial?.recommendedTime ?? "",
    recommendedRest: initial?.recommendedRest ?? "",
  });
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof CreateLibraryExerciseInput>(
    key: K,
    value: CreateLibraryExerciseInput[K],
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

      <Legend>Datos básicos</Legend>
      <div className="grid gap-3 sm:grid-cols-2">
        <Text label="Nombre" value={v.name} onChange={(x) => set("name", x)} required />
        <Text label="Grupo muscular" value={v.muscleGroup} onChange={(x) => set("muscleGroup", x)} placeholder="Ej: Pecho" />
        <Text label="Músculos secundarios" value={v.secondaryMuscles} onChange={(x) => set("secondaryMuscles", x)} placeholder="Ej: Tríceps, hombro" />
        <Text label="Equipo" value={v.equipment} onChange={(x) => set("equipment", x)} placeholder="Ej: Barra y banco" />
        <label className="block text-sm font-bold text-zinc-200">
          Dificultad
          <select
            value={v.difficulty}
            onChange={(e) => set("difficulty", e.target.value)}
            className={inputClass}
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d} className="bg-[#0a0d0b]">
                {d}
              </option>
            ))}
          </select>
        </label>
      </div>

      <Legend>Multimedia (opcional)</Legend>
      <div className="grid gap-3 sm:grid-cols-3">
        <Text label="Imagen (URL)" value={v.image} onChange={(x) => set("image", x)} placeholder="https://..." />
        <Text label="GIF (URL)" value={v.gif} onChange={(x) => set("gif", x)} placeholder="https://..." />
        <Text label="Video YouTube (URL)" value={v.video} onChange={(x) => set("video", x)} placeholder="https://youtube.com/..." />
      </div>

      <Legend>Contenido técnico</Legend>
      <Area label="Descripción" value={v.description} onChange={(x) => set("description", x)} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Area label="Técnica correcta" value={v.technique} onChange={(x) => set("technique", x)} />
        <Area label="Errores comunes" value={v.commonMistakes} onChange={(x) => set("commonMistakes", x)} />
        <Area label="Consejos del coach" value={v.coachTips} onChange={(x) => set("coachTips", x)} />
        <Area label="Variantes" value={v.variants} onChange={(x) => set("variants", x)} />
        <Area label="Sustituciones" value={v.substitutions} onChange={(x) => set("substitutions", x)} />
      </div>

      <Legend>Tiempos recomendados</Legend>
      <div className="grid gap-3 sm:grid-cols-2">
        <Text label="Tiempo recomendado" value={v.recommendedTime} onChange={(x) => set("recommendedTime", x)} placeholder="Ej: 45 s o —" />
        <Text label="Descanso recomendado" value={v.recommendedRest} onChange={(x) => set("recommendedRest", x)} placeholder="Ej: 90 s" />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="submit" disabled={saving} className={primaryBtn}>
          {saving ? "Guardando..." : "Guardar ejercicio"}
        </button>
        <button type="button" onClick={onCancel} className={secondaryBtn}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

function DeleteConfirm({
  exercise,
  onConfirm,
  onCancel,
}: {
  exercise: LibraryExercise;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}) {
  const [saving, setSaving] = useState(false);
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-red-500/30 bg-red-500/[0.06] p-4 text-sm leading-6">
        <p className="font-bold text-white">¿Eliminar “{exercise.name}”?</p>
        <p className="mt-1 text-zinc-400">
          Se quitará de la biblioteca. Los programas que ya lo usaban conservan el
          nombre, pero dejarán de mostrar su ficha completa. No se puede deshacer.
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

function Legend({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 mt-5 text-xs font-black uppercase tracking-[0.2em] text-[#65ff4f]">
      {children}
    </p>
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-bold text-zinc-200">
      {label}
      <textarea
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </label>
  );
}
