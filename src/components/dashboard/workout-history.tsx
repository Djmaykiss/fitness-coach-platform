"use client";

import { useEffect, useState } from "react";
import { CalendarDays, CheckCircle2, Flame, History, Timer } from "lucide-react";
import { trainingService } from "@/services/training.service";
import { formatDate } from "@/lib/format";
import { formatMinutes } from "@/lib/workout";
import type { WorkoutResult } from "@/types";

const FEELING_LABEL: Record<string, string> = {
  dificil: "Difícil",
  adecuado: "Adecuado",
  facil: "Fácil",
};

/** Clave YYYY-MM-DD (hora local) de una fecha ISO. */
function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/**
 * Historial de entrenamientos DERIVADO de las sesiones reales del alumno
 * (modo entrenamiento). Muestra racha, calendario mensual con min/kcal por dia y
 * la lista de sesiones. Sin datos demo: si no hay sesiones, invita a entrenar.
 */
export function WorkoutHistory({ userId }: { userId: string }) {
  const [results, setResults] = useState<WorkoutResult[] | null>(null);

  useEffect(() => {
    let active = true;
    trainingService.getResultsForUser(userId).then((r) => {
      if (active) setResults(r);
    });
    return () => {
      active = false;
    };
  }, [userId]);

  if (!results) return null;

  // Agregado por dia.
  const byDay = new Map<string, { count: number; sec: number; kcal: number }>();
  for (const r of results) {
    const k = dayKey(r.date);
    const cur = byDay.get(k) ?? { count: 0, sec: 0, kcal: 0 };
    cur.count += 1;
    cur.sec += r.durationSec;
    cur.kcal += r.caloriesEst;
    byDay.set(k, cur);
  }

  // Racha: dias consecutivos con entrenamiento terminando hoy (o ayer).
  let streak = 0;
  const probe = new Date();
  // Si hoy no hay, la racha puede seguir contando desde ayer.
  if (!byDay.has(dayKey(probe.toISOString()))) probe.setDate(probe.getDate() - 1);
  for (;;) {
    if (byDay.has(dayKey(probe.toISOString()))) {
      streak += 1;
      probe.setDate(probe.getDate() - 1);
    } else break;
  }

  const totalSec = results.reduce((a, r) => a + r.durationSec, 0);
  const totalKcal = results.reduce((a, r) => a + r.caloriesEst, 0);

  // Calendario del mes actual.
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthName = now.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const keyFor = (d: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  return (
    <section className="premium-card mt-6 rounded-2xl p-6">
      <div className="flex items-center gap-3">
        <History className="text-[#65ff4f]" size={22} />
        <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
          Mi historial de entrenamientos
        </h2>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric icon={<Flame size={14} />} label="Racha" value={`${streak} días`} />
        <Metric icon={<CheckCircle2 size={14} />} label="Sesiones" value={String(results.length)} />
        <Metric icon={<Timer size={14} />} label="Minutos" value={String(Math.round(totalSec / 60))} />
        <Metric icon={<Flame size={14} />} label="Calorías*" value={String(totalKcal)} />
      </div>

      {results.length === 0 ? (
        <p className="mt-5 text-sm leading-6 text-zinc-400">
          Aún no has completado entrenamientos. Inicia el modo entrenamiento desde
          tu rutina de hoy para empezar tu historial.
        </p>
      ) : (
        <>
          {/* Calendario mensual */}
          <div className="mt-6">
            <p className="mb-3 text-sm font-bold capitalize text-zinc-300">
              {monthName}
            </p>
            <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] text-zinc-500">
              {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
                <span key={i} className="py-1 font-bold">
                  {d}
                </span>
              ))}
              {cells.map((d, i) => {
                if (d === null) return <span key={`e-${i}`} />;
                const info = byDay.get(keyFor(d));
                const isToday = d === now.getDate();
                return (
                  <div
                    key={d}
                    title={
                      info
                        ? `${formatMinutes(info.sec)} · ${info.kcal} kcal`
                        : undefined
                    }
                    className={`flex aspect-square flex-col items-center justify-center rounded-lg border text-xs ${
                      isToday ? "border-[#65ff4f]" : "border-white/10"
                    } ${info ? "bg-[#65ff4f]/15 text-white" : "bg-white/[0.02] text-zinc-500"}`}
                  >
                    <span className="font-bold">{d}</span>
                    {info ? (
                      <span className="text-[9px] leading-none text-[#65ff4f]">
                        {Math.round(info.sec / 60)}m
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lista de sesiones */}
          <div className="mt-6 space-y-2">
            {results.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-bold text-white">
                    <CalendarDays size={15} className="text-[#65ff4f]" />
                    {r.dayName}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {formatDate(r.date)} · {r.programName}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                  <Chip>{formatMinutes(r.durationSec)}</Chip>
                  <Chip>{r.caloriesEst} kcal</Chip>
                  <Chip>{r.exercises} ejercicios</Chip>
                  <span className="rounded-lg bg-[#65ff4f]/10 px-3 py-1 text-[#65ff4f]">
                    {FEELING_LABEL[r.feeling] ?? r.feeling}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-zinc-600">
            *Calorías estimadas de forma informativa.
          </p>
        </>
      )}
    </section>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-zinc-500">
        <span className="text-[#65ff4f]">{icon}</span>
        {label}
      </p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1 text-zinc-300">
      {children}
    </span>
  );
}
