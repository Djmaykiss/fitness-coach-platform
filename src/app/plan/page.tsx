"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Dumbbell,
  Flame,
  Gauge,
  MapPin,
  Sparkles,
} from "lucide-react";
import { DashboardShell } from "@/layouts/dashboard-shell";
import { RequireAuth } from "@/components/require-auth";
import { useAuth } from "@/context/auth-context";
import { planService } from "@/services/plan.service";
import type { PlanSummary } from "@/services/plan.service";

export default function PlanPage() {
  return (
    <RequireAuth role="client">
      <PlanScreen />
    </RequireAuth>
  );
}

function PlanScreen() {
  const { user } = useAuth();
  const realName =
    user?.firstName && user.firstName !== "Cliente" ? user.firstName : "";
  const [plan, setPlan] = useState<PlanSummary | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    planService.getPlanForUser(user.id).then((p) => {
      if (!active) return;
      setPlan(p);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, [user]);

  return (
    <DashboardShell
      title="Obtener mi plan"
      subtitle={
        realName
          ? `${realName}, este es el plan que preparamos para ti.`
          : "Este es el plan que preparamos para ti."
      }
      minimalNav
      navName={realName}
      navHref="/perfil"
    >
      {!loaded ? (
        <p className="text-zinc-400">Preparando tu plan…</p>
      ) : !plan ? (
        <p className="text-zinc-400">
          Aún no hay un plan configurado. Tu coach lo asignará pronto.
        </p>
      ) : (
        <div className="mx-auto max-w-3xl">
          {/* Tarjeta principal */}
          <section className="premium-card overflow-hidden rounded-3xl border border-[#65ff4f]/30 p-6 sm:p-8">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#65ff4f]">
              <Sparkles size={16} />
              Plan recomendado
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              {plan.planName}
            </h2>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Metric icon={<MapPin size={14} />} label="Zona principal" value={plan.mainZone} />
              <Metric icon={<Gauge size={14} />} label="Nivel" value={plan.level} />
              <Metric icon={<CalendarDays size={14} />} label="Duración" value={plan.duration} />
              <Metric icon={<Flame size={14} />} label="Calorías" value={plan.caloriesEst} />
            </div>

            {/* Vista previa de semanas */}
            <div className="mt-6">
              <p className="mb-2 text-sm font-black uppercase tracking-wide text-zinc-500">
                {plan.weeks} semanas de progreso
              </p>
              <div className="flex snap-x gap-2 overflow-x-auto pb-1">
                {Array.from({ length: plan.weeks }, (_, i) => (
                  <div
                    key={i}
                    className="flex h-12 w-16 shrink-0 snap-start flex-col items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-xs"
                  >
                    <span className="font-black text-white">S{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Vista previa de ejercicios */}
          {plan.days.length > 0 ? (
            <section className="premium-card mt-6 rounded-2xl p-6">
              <h3 className="text-lg font-black">Vista previa de tu semana</h3>
              <div className="mt-4 space-y-4">
                {plan.days.map((day) => (
                  <div
                    key={day.id}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <p className="flex items-center gap-2 font-black">
                      <Dumbbell size={16} className="text-[#65ff4f]" />
                      {day.name}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      {day.exercises.slice(0, 5).map((ex) => (
                        <span
                          key={ex.id}
                          className="rounded-lg border border-white/10 bg-black/20 px-3 py-1 text-zinc-300"
                        >
                          {ex.name} · {ex.sets}×{ex.reps}
                        </span>
                      ))}
                      {day.exercises.length > 5 ? (
                        <span className="rounded-lg px-2 py-1 text-zinc-500">
                          +{day.exercises.length - 5} más
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <p className="mt-6 text-sm text-zinc-400">
              Tu coach está terminando de configurar los ejercicios de tu plan.
            </p>
          )}

          <p className="mt-6 text-center text-xs text-zinc-600">
            Información orientativa sobre tu plan. No constituye una promesa de
            resultados garantizados.
          </p>

          <Link
            href="/dashboard"
            className="mt-4 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-[#85ff73] to-[#65ff4f] px-6 text-base font-black uppercase tracking-wide text-black shadow-[0_10px_40px_-10px_rgba(101,255,79,0.6)] transition duration-300 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.99]"
          >
            Entrar a mi plan
            <ArrowRight size={20} />
          </Link>
        </div>
      )}
    </DashboardShell>
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
      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-zinc-500">
        <span className="text-[#65ff4f]">{icon}</span>
        {label}
      </p>
      <p className="mt-1 text-base font-black text-white">{value}</p>
    </div>
  );
}
