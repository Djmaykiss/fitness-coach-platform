"use client";

import { useEffect, useState } from "react";
import {
  CalendarPlus,
  Dumbbell,
  ListPlus,
  Pencil,
  Plus,
  Target,
  Trash2,
  UserCheck,
} from "lucide-react";
import { trainingService } from "@/services/training.service";
import { exerciseLibraryService } from "@/services/exercise-library.service";
import { adminDashboardService } from "@/services/dashboard.service";
import type {
  AdminClientRow,
  CreateTrainingProgramInput,
  LibraryExercise,
  TrainingProgram,
} from "@/types";

const OBJECTIVES = [
  "Perder grasa",
  "Ganar músculo",
  "Recomposición corporal",
  "Tonificar",
  "Mejorar condición física",
  "Rendimiento deportivo",
];
const LEVELS = ["Principiante", "Intermedio", "Avanzado"];

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
  "mt-2 h-11 w-full rounded-lg border border-white/10 bg-black/35 px-3 text-white outline-none transition duration-300 placeholder:text-zinc-600 hover:border-white/20 focus:border-[#65ff4f] focus:bg-black/50 focus:shadow-[0_0_0_3px_rgba(101,255,79,0.12)]";

type Panel =
  | { kind: "create" }
  | { kind: "edit"; program: TrainingProgram }
  | { kind: "build"; programId: string }
  | { kind: "assign"; program: TrainingProgram }
  | { kind: "delete"; program: TrainingProgram }
  | null;

export function TrainingProgramsManager() {
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [clients, setClients] = useState<AdminClientRow[]>([]);
  const [library, setLibrary] = useState<LibraryExercise[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);

  async function load() {
    const [p, c, lib] = await Promise.all([
      trainingService.getPrograms(),
      adminDashboardService.getClientRows(),
      exerciseLibraryService.getExercises(),
    ]);
    setPrograms(p);
    setClients(c);
    setLibrary(lib);
    setLoaded(true);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  // El programa abierto en el builder se relee siempre desde la lista fresca.
  const building =
    panel?.kind === "build"
      ? programs.find((p) => p.id === panel.programId) ?? null
      : null;

  return (
    <section className="premium-card mt-6 overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 p-6">
        <h2 className="text-2xl font-black">Programas de entrenamiento</h2>
        <button
          type="button"
          onClick={() => setPanel({ kind: "create" })}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-b from-[#85ff73] to-[#65ff4f] px-4 py-2 text-xs font-black uppercase tracking-wide text-black shadow-[0_6px_22px_-8px_rgba(101,255,79,0.5)] transition duration-300 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.98]"
        >
          <Plus size={16} />
          Nuevo programa
        </button>
      </div>

      <div className="p-6">
        {/* Panel activo (crear / editar / builder / asignar / eliminar) */}
        {panel ? (
          <div className="mb-6 rounded-2xl border border-[#65ff4f]/20 bg-white/[0.02] p-5">
            {panel.kind === "create" ? (
              <ProgramForm
                title="Nuevo programa de entrenamiento"
                onCancel={() => setPanel(null)}
                onSubmit={async (values) => {
                  await trainingService.createProgram(values);
                  setPanel(null);
                  await load();
                }}
              />
            ) : null}

            {panel.kind === "edit" ? (
              <ProgramForm
                title={`Editar: ${panel.program.name}`}
                initial={panel.program}
                onCancel={() => setPanel(null)}
                onSubmit={async (values) => {
                  await trainingService.updateProgram(panel.program.id, values);
                  setPanel(null);
                  await load();
                }}
              />
            ) : null}

            {panel.kind === "assign" ? (
              <AssignForm
                program={panel.program}
                clients={clients}
                onCancel={() => setPanel(null)}
                onAssign={async (clientId) => {
                  await trainingService.assignToClient(clientId, panel.program.id);
                  setPanel(null);
                  await load();
                }}
              />
            ) : null}

            {panel.kind === "delete" ? (
              <DeleteConfirm
                program={panel.program}
                onCancel={() => setPanel(null)}
                onConfirm={async () => {
                  await trainingService.deleteProgram(panel.program.id);
                  setPanel(null);
                  await load();
                }}
              />
            ) : null}

            {panel.kind === "build" && building ? (
              <ProgramBuilder
                program={building}
                library={library}
                onClose={() => setPanel(null)}
                onChange={load}
              />
            ) : null}
          </div>
        ) : null}

        {/* Lista de programas */}
        {!loaded ? (
          <p className="text-sm text-zinc-400">Cargando programas...</p>
        ) : programs.length === 0 ? (
          <p className="text-sm text-zinc-400">
            Aún no hay programas de entrenamiento. Crea el primero.
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {programs.map((program) => (
              <article
                key={program.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <h3 className="text-xl font-black">{program.name}</h3>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                  <Chip icon={<Target size={13} />}>{program.objective || "—"}</Chip>
                  <Chip>{program.level || "—"}</Chip>
                  <Chip>{program.duration || "—"}</Chip>
                  <Chip icon={<CalendarPlus size={13} />}>
                    {program.days.length} días
                  </Chip>
                </div>
                {program.notes ? (
                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    {program.notes}
                  </p>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={rowBtn}
                    onClick={() => setPanel({ kind: "build", programId: program.id })}
                  >
                    <ListPlus size={14} />
                    Días y ejercicios
                  </button>
                  <button
                    type="button"
                    className={rowBtn}
                    onClick={() => setPanel({ kind: "assign", program })}
                  >
                    <UserCheck size={14} />
                    Asignar
                  </button>
                  <button
                    type="button"
                    className={rowBtn}
                    onClick={() => setPanel({ kind: "edit", program })}
                  >
                    <Pencil size={14} />
                    Editar
                  </button>
                  <button
                    type="button"
                    className={rowBtnDanger}
                    onClick={() => setPanel({ kind: "delete", program })}
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

function Chip({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1 text-zinc-300">
      {icon}
      {children}
    </span>
  );
}

/* ---------- Formulario de datos del programa ---------- */
function ProgramForm({
  title,
  initial,
  onSubmit,
  onCancel,
}: {
  title: string;
  initial?: TrainingProgram;
  onSubmit: (values: CreateTrainingProgramInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [objective, setObjective] = useState(initial?.objective ?? OBJECTIVES[0]);
  const [level, setLevel] = useState(initial?.level ?? LEVELS[0]);
  const [duration, setDuration] = useState(initial?.duration ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [saving, setSaving] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setSaving(true);
        await onSubmit({ name, objective, level, duration, notes });
      }}
    >
      <h3 className="mb-4 text-lg font-black">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre del programa">
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Hipertrofia 3 días"
            required
          />
        </Field>
        <Field label="Duración">
          <input
            className={inputClass}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Ej: 8 semanas"
          />
        </Field>
        <Field label="Objetivo">
          <Select value={objective} onChange={setObjective} options={OBJECTIVES} />
        </Field>
        <Field label="Nivel">
          <Select value={level} onChange={setLevel} options={LEVELS} />
        </Field>
      </div>
      <Field label="Notas del coach">
        <textarea
          className={`${inputClass} h-auto py-2`}
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Indicaciones generales del programa"
        />
      </Field>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="submit" disabled={saving} className={primaryBtn}>
          {saving ? "Guardando..." : "Guardar programa"}
        </button>
        <button type="button" onClick={onCancel} className={secondaryBtn}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

/* ---------- Builder de días y ejercicios ---------- */
function ProgramBuilder({
  program,
  library,
  onClose,
  onChange,
}: {
  program: TrainingProgram;
  library: LibraryExercise[];
  onClose: () => void;
  onChange: () => Promise<void>;
}) {
  const [dayName, setDayName] = useState("");

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="text-lg font-black">
          Días y ejercicios:{" "}
          <span className="text-[#65ff4f]">{program.name}</span>
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-bold text-zinc-500 hover:text-[#65ff4f]"
        >
          Cerrar
        </button>
      </div>

      {/* Agregar día */}
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!dayName.trim()) return;
          await trainingService.addDay(program.id, dayName);
          setDayName("");
          await onChange();
        }}
      >
        <div className="min-w-[220px] flex-1">
          <Field label="Nuevo día de entrenamiento">
            <input
              className={inputClass}
              value={dayName}
              onChange={(e) => setDayName(e.target.value)}
              placeholder="Ej: Día 1 · Pecho y tríceps"
            />
          </Field>
        </div>
        <button type="submit" className={secondaryBtn}>
          <CalendarPlus size={16} />
          Agregar día
        </button>
      </form>

      {program.days.length === 0 ? (
        <p className="mt-5 text-sm text-zinc-400">
          Aún no hay días. Agrega el primero para añadir ejercicios.
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          {program.days.map((day) => (
            <DayCard
              key={day.id}
              programId={program.id}
              day={day}
              library={library}
              onChange={onChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DayCard({
  programId,
  day,
  library,
  onChange,
}: {
  programId: string;
  day: TrainingProgram["days"][number];
  library: LibraryExercise[];
  onChange: () => Promise<void>;
}) {
  const [exerciseId, setExerciseId] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [rest, setRest] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-black">
          <Dumbbell size={16} className="text-[#65ff4f]" />
          {day.name}
        </p>
        <button
          type="button"
          className={rowBtnDanger}
          onClick={async () => {
            await trainingService.deleteDay(programId, day.id);
            await onChange();
          }}
        >
          <Trash2 size={14} />
          Quitar día
        </button>
      </div>

      {day.exercises.length > 0 ? (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="py-2 pr-3 font-black">Ejercicio</th>
                <th className="py-2 pr-3 font-black">Series</th>
                <th className="py-2 pr-3 font-black">Reps</th>
                <th className="py-2 pr-3 font-black">Descanso</th>
                <th className="py-2 pr-3 font-black">Notas</th>
                <th className="py-2 font-black"></th>
              </tr>
            </thead>
            <tbody>
              {day.exercises.map((ex) => (
                <tr key={ex.id} className="border-t border-white/10">
                  <td className="py-2 pr-3 font-semibold text-white">{ex.name}</td>
                  <td className="py-2 pr-3 text-zinc-300">{ex.sets || "—"}</td>
                  <td className="py-2 pr-3 text-zinc-300">{ex.reps || "—"}</td>
                  <td className="py-2 pr-3 text-zinc-300">{ex.rest || "—"}</td>
                  <td className="py-2 pr-3 text-zinc-400">{ex.notes || "—"}</td>
                  <td className="py-2 text-right">
                    <button
                      type="button"
                      className="text-zinc-500 transition hover:text-red-400"
                      aria-label="Quitar ejercicio"
                      onClick={async () => {
                        await trainingService.deleteExercise(programId, day.id, ex.id);
                        await onChange();
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* Agregar ejercicio desde la biblioteca */}
      {library.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">
          Crea ejercicios en la biblioteca para poder añadirlos a este día.
        </p>
      ) : (
        <form
          className="mt-3 grid gap-2 sm:grid-cols-[1.6fr_0.6fr_0.7fr_0.8fr_1.1fr_auto]"
          onSubmit={async (e) => {
            e.preventDefault();
            const picked = library.find((l) => l.id === exerciseId);
            if (!picked) return;
            await trainingService.addExercise(programId, day.id, {
              exerciseId: picked.id,
              name: picked.name,
              sets,
              reps,
              rest: rest || picked.recommendedRest,
              notes,
            });
            setExerciseId("");
            setSets("");
            setReps("");
            setRest("");
            setNotes("");
            await onChange();
          }}
        >
          <select
            className={inputClass}
            value={exerciseId}
            onChange={(e) => setExerciseId(e.target.value)}
          >
            <option value="" className="bg-[#0a0d0b]">
              Elegir ejercicio…
            </option>
            {library.map((l) => (
              <option key={l.id} value={l.id} className="bg-[#0a0d0b]">
                {l.name} · {l.muscleGroup || "—"}
              </option>
            ))}
          </select>
          <input className={inputClass} value={sets} onChange={(e) => setSets(e.target.value)} placeholder="Series" />
          <input className={inputClass} value={reps} onChange={(e) => setReps(e.target.value)} placeholder="Reps" />
          <input className={inputClass} value={rest} onChange={(e) => setRest(e.target.value)} placeholder="Descanso" />
          <input className={inputClass} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas" />
          <button type="submit" disabled={!exerciseId} className={`${secondaryBtn} disabled:cursor-not-allowed disabled:opacity-50`}>
            <Plus size={16} />
            Añadir
          </button>
        </form>
      )}
    </div>
  );
}

/* ---------- Asignar a alumno ---------- */
function AssignForm({
  program,
  clients,
  onAssign,
  onCancel,
}: {
  program: TrainingProgram;
  clients: AdminClientRow[];
  onAssign: (clientId: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [saving, setSaving] = useState(false);

  if (clients.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-zinc-400">
          No hay alumnos para asignar. Crea un alumno primero.
        </p>
        <button type="button" onClick={onCancel} className={secondaryBtn}>
          Cerrar
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!clientId) return;
        setSaving(true);
        await onAssign(clientId);
      }}
    >
      <h3 className="mb-4 text-lg font-black">
        Asignar <span className="text-[#65ff4f]">{program.name}</span> a un alumno
      </h3>
      <Field label="Alumno">
        <Select
          value={clientId}
          onChange={setClientId}
          options={clients.map((c) => c.id)}
          labels={Object.fromEntries(clients.map((c) => [c.id, c.name]))}
        />
      </Field>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="submit" disabled={saving} className={primaryBtn}>
          <UserCheck size={16} />
          {saving ? "Asignando..." : "Asignar programa"}
        </button>
        <button type="button" onClick={onCancel} className={secondaryBtn}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

/* ---------- Confirmación de borrado ---------- */
function DeleteConfirm({
  program,
  onConfirm,
  onCancel,
}: {
  program: TrainingProgram;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}) {
  const [saving, setSaving] = useState(false);
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-red-500/30 bg-red-500/[0.06] p-4 text-sm leading-6">
        <p className="font-bold text-white">¿Eliminar “{program.name}”?</p>
        <p className="mt-1 text-zinc-400">
          Se borrará el programa con sus días y ejercicios. Los alumnos que lo
          tuvieran asignado dejarán de verlo. Esta acción no se puede deshacer.
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
          {saving ? "Eliminando..." : "Sí, eliminar programa"}
        </button>
        <button type="button" onClick={onCancel} className={secondaryBtn}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

/* ---------- Helpers de formulario ---------- */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="mt-4 block text-sm font-bold text-zinc-200 first:mt-0">
      {label}
      {children}
    </label>
  );
}

function Select({
  value,
  onChange,
  options,
  labels,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  labels?: Record<string, string>;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputClass}
    >
      {options.map((option) => (
        <option key={option} value={option} className="bg-[#0a0d0b]">
          {labels?.[option] ?? option}
        </option>
      ))}
    </select>
  );
}
