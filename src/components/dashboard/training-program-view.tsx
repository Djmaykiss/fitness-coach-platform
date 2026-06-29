"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Dumbbell,
  Flame,
  Target,
} from "lucide-react";
import { trainingService } from "@/services/training.service";
import type { AssignedTraining, TrainingDay } from "@/types";

/**
 * Programa de entrenamiento asignado al alumno (lectura). Muestra el programa,
 * sus dias, la rutina de hoy con sus ejercicios y permite marcar el entrenamiento
 * como completado (persistido en localStorage por el servicio).
 */
export function TrainingProgramView({ userId }: { userId: string }) {
  const [data, setData] = useState<AssignedTraining | null>(null);
  const [loaded, setLoaded] = useState(false);

  function load() {
    return trainingService.getAssignedForUser(userId).then((result) => {
      setData(result);
      setLoaded(true);
    });
  }

  useEffect(() => {
    let active = true;
    trainingService.getAssignedForUser(userId).then((result) => {
      if (!active) return;
      setData(result);
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

  const { program, completedDayIds } = data;
  const completed = new Set(completedDayIds);
  // Rutina de hoy: el primer día no completado; si están todos hechos, el primero.
  const focusDay =
    program.days.find((d) => !completed.has(d.id)) ?? program.days[0] ?? null;

  async function toggle(dayId: string, done: boolean) {
    await trainingService.toggleDayForUser(userId, dayId, done);
    await load();
  }

  const doneCount = program.days.filter((d) => completed.has(d.id)).length;

  return (
    <section className="mt-6 space-y-6">
      <div className="flex items-center gap-3">
        <Dumbbell className="text-[#65ff4f]" size={22} />
        <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
          Mi programa de entrenamiento
        </h2>
      </div>

      {/* Cabecera del programa */}
      <div className="premium-card rounded-2xl p-6">
        <h3 className="text-2xl font-black">{program.name}</h3>
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
          <Chip icon={<Target size={13} />}>{program.objective || "—"}</Chip>
          <Chip>{program.level || "—"}</Chip>
          <Chip>{program.duration || "—"}</Chip>
          <Chip icon={<CalendarDays size={13} />}>
            {program.days.length} días
          </Chip>
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

      {/* Rutina de hoy */}
      {focusDay ? (
        <div className="premium-card rounded-2xl border border-[#65ff4f]/30 p-6">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#65ff4f]">
            <Flame size={16} />
            Rutina de hoy
          </div>
          <DayBlock
            day={focusDay}
            done={completed.has(focusDay.id)}
            highlight
            onToggle={(done) => toggle(focusDay.id, done)}
          />
        </div>
      ) : (
        <p className="text-sm text-zinc-400">
          Este programa aún no tiene días configurados.
        </p>
      )}

      {/* Todos los días */}
      {program.days.length > 0 ? (
        <div className="premium-card rounded-2xl p-6">
          <h3 className="text-lg font-black">Días de entrenamiento</h3>
          <div className="mt-4 space-y-4">
            {program.days.map((day) => (
              <DayBlock
                key={day.id}
                day={day}
                done={completed.has(day.id)}
                onToggle={(done) => toggle(day.id, done)}
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
  onToggle,
}: {
  day: TrainingDay;
  done: boolean;
  highlight?: boolean;
  onToggle: (done: boolean) => void;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight
          ? "mt-4 border-white/10 bg-white/[0.02]"
          : "border-white/10 bg-white/[0.03]"
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
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="py-2 pr-3 font-black">Ejercicio</th>
                <th className="py-2 pr-3 font-black">Series</th>
                <th className="py-2 pr-3 font-black">Reps</th>
                <th className="py-2 pr-3 font-black">Descanso</th>
                <th className="py-2 font-black">Notas</th>
              </tr>
            </thead>
            <tbody>
              {day.exercises.map((ex) => (
                <tr key={ex.id} className="border-t border-white/10">
                  <td className="py-2 pr-3 font-semibold text-white">{ex.name}</td>
                  <td className="py-2 pr-3 text-zinc-300">{ex.sets || "—"}</td>
                  <td className="py-2 pr-3 text-zinc-300">{ex.reps || "—"}</td>
                  <td className="py-2 pr-3 text-zinc-300">{ex.rest || "—"}</td>
                  <td className="py-2 text-zinc-400">{ex.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-2 text-sm text-zinc-500">Sin ejercicios en este día.</p>
      )}

      <button
        type="button"
        onClick={() => onToggle(!done)}
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
