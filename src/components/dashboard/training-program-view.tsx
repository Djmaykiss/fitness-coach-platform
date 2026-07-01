"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Circle,
  Dumbbell,
  Flame,
  ImageIcon,
  Play,
  Target,
} from "lucide-react";
import { trainingService } from "@/services/training.service";
import { exerciseLibraryService } from "@/services/exercise-library.service";
import type {
  AssignedTraining,
  LibraryExercise,
  TrainingDay,
  TrainingExercise,
} from "@/types";

/** Cuántas series tiene una prescripción (ej. "4" -> 4). 0 si no es numérico. */
function seriesCount(sets: string): number {
  const n = Number.parseInt(sets, 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 12) : 0;
}

/**
 * Programa de entrenamiento del alumno: muestra la rutina de hoy, los días y, por
 * cada ejercicio, su ficha completa (resuelta desde la biblioteca) y un checklist
 * por series. Todo el progreso se persiste en localStorage vía `trainingService`.
 */
export function TrainingProgramView({ userId }: { userId: string }) {
  const [data, setData] = useState<AssignedTraining | null>(null);
  const [library, setLibrary] = useState<Record<string, LibraryExercise>>({});
  const [loaded, setLoaded] = useState(false);

  async function load() {
    const [assigned, lib] = await Promise.all([
      trainingService.getAssignedForUser(userId),
      exerciseLibraryService.getExercises(),
    ]);
    setData(assigned);
    setLibrary(Object.fromEntries(lib.map((e) => [e.id, e])));
    setLoaded(true);
  }

  useEffect(() => {
    let active = true;
    Promise.all([
      trainingService.getAssignedForUser(userId),
      exerciseLibraryService.getExercises(),
    ]).then(([assigned, lib]) => {
      if (!active) return;
      setData(assigned);
      setLibrary(Object.fromEntries(lib.map((e) => [e.id, e])));
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, [userId]);

  if (!loaded) return null;

  if (!data) {
    return (
      <section className="premium-card mt-6 rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <Dumbbell className="text-[#65ff4f]" size={22} />
          <h2 className="text-2xl font-black">Mi programa de entrenamiento</h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Aún no tienes un programa asignado. Tu coach lo configurará pronto.
        </p>
      </section>
    );
  }

  const { program, completedDayIds, seriesProgress } = data;
  const completedDays = new Set(completedDayIds);
  const focusDay =
    program.days.find((d) => !completedDays.has(d.id)) ?? program.days[0] ?? null;
  const doneCount = program.days.filter((d) => completedDays.has(d.id)).length;

  async function toggleDay(dayId: string, done: boolean) {
    await trainingService.toggleDayForUser(userId, dayId, done);
    await load();
  }
  async function toggleSeries(exId: string, index: number, done: boolean) {
    await trainingService.toggleSeriesForUser(userId, exId, index, done);
    await load();
  }

  return (
    <section className="mt-6 space-y-6">
      <div className="flex items-center gap-3">
        <Dumbbell className="text-[#65ff4f]" size={22} />
        <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
          Mi programa de entrenamiento
        </h2>
      </div>

      <div className="premium-card rounded-2xl p-6">
        <h3 className="text-2xl font-black">{program.name}</h3>
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
          <Chip icon={<Target size={13} />}>{program.objective || "—"}</Chip>
          <Chip>{program.level || "—"}</Chip>
          <Chip>{program.duration || "—"}</Chip>
          <Chip icon={<CalendarDays size={13} />}>{program.days.length} días</Chip>
          <Chip icon={<CheckCircle2 size={13} />}>
            {doneCount}/{program.days.length} completados
          </Chip>
        </div>
        {program.notes ? (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#65ff4f]/20 bg-[#65ff4f]/[0.05] p-4">
            <ClipboardList className="mt-0.5 shrink-0 text-[#65ff4f]" size={18} />
            <p className="text-sm leading-6 text-zinc-200">{program.notes}</p>
          </div>
        ) : null}
      </div>

      {focusDay ? (
        <div className="premium-card rounded-2xl border border-[#65ff4f]/30 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#65ff4f]">
              <Flame size={16} />
              Rutina de hoy
            </div>
            <Link
              href={`/entrenar?day=${focusDay.id}`}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-[#85ff73] to-[#65ff4f] px-5 text-sm font-black uppercase tracking-wide text-black shadow-[0_8px_30px_-8px_rgba(101,255,79,0.5)] transition duration-300 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.98]"
            >
              <Play size={16} />
              Iniciar modo entrenamiento
            </Link>
          </div>
          <DayBlock
            day={focusDay}
            done={completedDays.has(focusDay.id)}
            library={library}
            seriesProgress={seriesProgress}
            highlight
            onToggleDay={(done) => toggleDay(focusDay.id, done)}
            onToggleSeries={toggleSeries}
          />
        </div>
      ) : (
        <p className="text-sm text-zinc-400">
          Este programa aún no tiene días configurados.
        </p>
      )}

      {program.days.length > 0 ? (
        <div className="premium-card rounded-2xl p-6">
          <h3 className="text-lg font-black">Días de entrenamiento</h3>
          <div className="mt-4 space-y-4">
            {program.days.map((day) => (
              <DayBlock
                key={day.id}
                day={day}
                done={completedDays.has(day.id)}
                library={library}
                seriesProgress={seriesProgress}
                onToggleDay={(done) => toggleDay(day.id, done)}
                onToggleSeries={toggleSeries}
              />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function DayBlock({
  day,
  done,
  highlight = false,
  library,
  seriesProgress,
  onToggleDay,
  onToggleSeries,
}: {
  day: TrainingDay;
  done: boolean;
  highlight?: boolean;
  library: Record<string, LibraryExercise>;
  seriesProgress: Record<string, number[]>;
  onToggleDay: (done: boolean) => void;
  onToggleSeries: (exId: string, index: number, done: boolean) => void;
}) {
  return (
    <div
      className={`rounded-xl border border-white/10 p-4 ${
        highlight ? "mt-4 bg-white/[0.02]" : "bg-white/[0.03]"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-black">
          <Dumbbell size={16} className="text-[#65ff4f]" />
          {day.name}
        </p>
        {done ? (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#65ff4f]/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-[#65ff4f]">
            <CheckCircle2 size={14} />
            Completado
          </span>
        ) : null}
      </div>

      {day.exercises.length > 0 ? (
        <div className="mt-3 space-y-2">
          {day.exercises.map((ex) => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              detail={ex.exerciseId ? library[ex.exerciseId] : undefined}
              completedSeries={seriesProgress[ex.id] ?? []}
              onToggleSeries={(index, value) =>
                onToggleSeries(ex.id, index, value)
              }
            />
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-zinc-500">Sin ejercicios en este día.</p>
      )}

      <button
        type="button"
        onClick={() => onToggleDay(!done)}
        className={
          done
            ? "mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#65ff4f]/40 px-5 text-sm font-black uppercase tracking-wide text-[#65ff4f] transition duration-300 hover:bg-[#65ff4f]/10"
            : "mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-[#85ff73] to-[#65ff4f] px-5 text-sm font-black uppercase tracking-wide text-black shadow-[0_8px_30px_-8px_rgba(101,255,79,0.5)] transition duration-300 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.98]"
        }
      >
        <CheckCircle2 size={18} />
        {done ? "Entrenamiento completado" : "Marcar entrenamiento completado"}
      </button>
    </div>
  );
}

function ExerciseCard({
  exercise,
  detail,
  completedSeries,
  onToggleSeries,
}: {
  exercise: TrainingExercise;
  detail?: LibraryExercise;
  completedSeries: number[];
  onToggleSeries: (index: number, done: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const total = seriesCount(exercise.sets);
  const doneSet = new Set(completedSeries);
  const exerciseDone = total > 0 && doneSet.size >= total;

  return (
    <div className="rounded-xl border border-white/10 bg-black/20">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 p-3 text-left"
      >
        <span className="min-w-0">
          <span className="flex items-center gap-2 font-bold text-white">
            {exerciseDone ? (
              <CheckCircle2 size={16} className="shrink-0 text-[#65ff4f]" />
            ) : (
              <Circle size={16} className="shrink-0 text-zinc-600" />
            )}
            <span className="truncate">{exercise.name}</span>
          </span>
          <span className="mt-0.5 block pl-6 text-xs text-zinc-500">
            {[
              detail?.muscleGroup,
              exercise.sets && exercise.reps
                ? `${exercise.sets} × ${exercise.reps}`
                : exercise.sets || exercise.reps,
              exercise.rest ? `Descanso ${exercise.rest}` : "",
            ]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div className="border-t border-white/10 p-4">
          {/* Multimedia */}
          <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
            <Media
              src={detail?.gif || detail?.image || ""}
              alt={exercise.name}
            />
          </div>
          {detail?.video ? (
            <a
              href={detail.video}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#65ff4f]/40 px-5 text-sm font-black uppercase tracking-wide text-[#65ff4f] transition duration-300 hover:bg-[#65ff4f]/10"
            >
              <Play size={16} />
              Ver demostración
            </a>
          ) : null}

          {/* Datos */}
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
            {detail?.equipment ? <Chip>{detail.equipment}</Chip> : null}
            {detail?.difficulty ? <Chip>{detail.difficulty}</Chip> : null}
          </div>
          {detail ? (
            <div className="mt-4 space-y-3">
              <Field label="Músculos trabajados">
                {[detail.muscleGroup, detail.secondaryMuscles]
                  .filter(Boolean)
                  .join(" · ") || "—"}
              </Field>
              {detail.technique ? (
                <Field label="Técnica correcta">{detail.technique}</Field>
              ) : null}
              {detail.commonMistakes ? (
                <Field label="Errores comunes">{detail.commonMistakes}</Field>
              ) : null}
              {detail.coachTips ? (
                <Field label="Consejos del coach">{detail.coachTips}</Field>
              ) : null}
            </div>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">
              Este ejercicio no tiene ficha en la biblioteca.
            </p>
          )}

          {exercise.notes ? (
            <p className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm leading-6 text-zinc-300">
              <span className="font-bold text-zinc-200">Nota del coach:</span>{" "}
              {exercise.notes}
            </p>
          ) : null}

          {/* Checklist por series */}
          {total > 0 ? (
            <div className="mt-4">
              <p className="text-xs font-black uppercase tracking-wide text-zinc-500">
                Series
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {Array.from({ length: total }, (_, i) => {
                  const checked = doneSet.has(i);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onToggleSeries(i, !checked)}
                      className={`inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm font-bold transition ${
                        checked
                          ? "border-[#65ff4f] bg-[#65ff4f]/10 text-[#65ff4f]"
                          : "border-white/10 bg-white/[0.03] text-zinc-300 hover:border-[#65ff4f]/40"
                      }`}
                    >
                      {checked ? (
                        <CheckCircle2 size={15} />
                      ) : (
                        <Circle size={15} />
                      )}
                      Serie {i + 1}
                    </button>
                  );
                })}
              </div>
              {exerciseDone ? (
                <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-black text-[#65ff4f]">
                  <CheckCircle2 size={16} />
                  Ejercicio completado
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Media({ src, alt }: { src: string; alt: string }) {
  const [ok, setOk] = useState(Boolean(src));
  if (!src || !ok) {
    return (
      <div className="flex aspect-video w-full items-center justify-center text-zinc-600">
        <ImageIcon size={32} />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="aspect-video w-full object-contain"
      onError={() => setOk(false)}
    />
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-wide text-[#65ff4f]">
        {label}
      </p>
      <p className="mt-1 text-sm leading-6 text-zinc-300">{children}</p>
    </div>
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
