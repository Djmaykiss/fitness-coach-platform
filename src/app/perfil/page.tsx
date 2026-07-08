"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowLeft,
  CalendarClock,
  CreditCard,
  Dumbbell,
  Flame,
  MessageCircle,
  Ruler,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
} from "lucide-react";
import { DashboardShell } from "@/layouts/dashboard-shell";
import { RequireAuth } from "@/components/require-auth";
import { LineChart } from "@/components/dashboard/charts";
import { useAuth } from "@/context/auth-context";
import { clientDashboardService } from "@/services/dashboard.service";
import { trainingService } from "@/services/training.service";
import { metricsService } from "@/services/metrics.service";
import { plansService } from "@/services/plans.service";
import { metricSeries } from "@/data/coaching";
import { coachConfig, whatsappUrl } from "@/config/coachConfig";
import { formatDate } from "@/lib/format";
import type {
  ChartPoint,
  ClientPlan,
  ClientProgress,
  LeadEvaluation,
  WorkoutResult,
} from "@/types";

function num(value: string | undefined): number {
  const n = Number.parseFloat(String(value ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

export default function ProfilePage() {
  return (
    <RequireAuth role="client">
      <Profile />
    </RequireAuth>
  );
}

function Profile() {
  const { user } = useAuth();
  const realName =
    user?.firstName && user.firstName !== "Cliente" ? user.firstName : "";

  const [evaluation, setEvaluation] = useState<LeadEvaluation | null>(null);
  const [progress, setProgress] = useState<ClientProgress | null>(null);
  const [results, setResults] = useState<WorkoutResult[]>([]);
  const [clientPlan, setClientPlan] = useState<ClientPlan | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    Promise.all([
      clientDashboardService.getEvaluationForUser(user.id),
      clientDashboardService.getProgressForUser(user.id),
      trainingService.getResultsForUser(user.id),
    ]).then(([e, p, r]) => {
      if (!active) return;
      setEvaluation(e);
      setProgress(p);
      setResults(r);
    });
    plansService
      .getClientPlanForUser(user.id)
      .then((cp) => {
        if (active) setClientPlan(cp);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [user]);

  const startW = num(evaluation?.weight) || num(progress?.pesoInicial);
  const nowW = num(progress?.pesoActual) || startW;
  const targetW = num(evaluation?.targetWeight);
  const heightCm = num(evaluation?.height);

  const metrics =
    heightCm > 0 && nowW > 0
      ? metricsService.compute({
          weightKg: nowW,
          heightCm,
          age: num(evaluation?.age) || 30,
          sex: evaluation?.sex ?? "",
          targetKg: targetW || nowW,
        })
      : null;

  const weightSeries: ChartPoint[] =
    startW > 0 && nowW > 0 && targetW > 0
      ? [
          { label: "Inicio", value: startW },
          { label: "Actual", value: nowW },
          { label: "Meta", value: targetW },
        ]
      : metricSeries.weight;

  const totalSec = results.reduce((a, r) => a + r.durationSec, 0);
  const totalKcal = results.reduce((a, r) => a + r.caloriesEst, 0);

  return (
    <DashboardShell
      title="Mi perfil"
      subtitle={realName ? `Hola, ${realName}.` : "Tu resumen personal."}
      minimalNav
      navName={realName}
      navHref="/perfil"
    >
      <div className="mb-5">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold text-zinc-200 transition hover:border-[#65ff4f]/50 hover:text-[#65ff4f]"
        >
          <ArrowLeft size={16} /> Volver al panel
        </Link>
      </div>

      {/* Plan contratado */}
      <section className="premium-card mb-6 rounded-2xl p-6">
        <p className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-[#65ff4f]">
          <CreditCard size={16} /> Plan contratado
        </p>
        {clientPlan ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Info icon={<Sparkles size={14} />} label="Plan" value={clientPlan.planName || "—"} highlight />
            <Info icon={<Activity size={14} />} label="Estado" value={clientPlan.status || "—"} />
            <Info icon={<CalendarClock size={14} />} label="Inicio" value={clientPlan.startDate ? formatDate(clientPlan.startDate) : "—"} />
            <Info icon={<CalendarClock size={14} />} label="Renovación" value={clientPlan.renewalDate ? formatDate(clientPlan.renewalDate) : "—"} />
          </div>
        ) : (
          <p className="text-sm text-zinc-400">
            Aún no tienes un plan contratado. Escríbele a tu coach para elegir el tuyo.
          </p>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        {/* Datos + gráfica */}
        <section className="premium-card rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#65ff4f]/30 bg-[#65ff4f]/10 text-2xl font-black text-[#65ff4f]">
              {(realName || "A").charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-black">{realName || "Alumno"}</h2>
              <p className="text-sm text-zinc-400">{user?.email}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <Info icon={<Activity size={14} />} label="Peso actual" value={nowW > 0 ? `${nowW} kg` : "—"} />
            <Info icon={<Target size={14} />} label="Peso objetivo" value={targetW > 0 ? `${targetW} kg` : "—"} highlight />
            <Info icon={<Ruler size={14} />} label="IMC" value={metrics ? `${metrics.imc}` : "—"} />
          </div>
          {metrics ? (
            <p className="mt-2 text-xs text-zinc-500">
              IMC {metrics.imc} · {metrics.imcLabel} (referencia informativa)
            </p>
          ) : null}

          <div className="mt-6">
            <p className="mb-2 flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-[#65ff4f]">
              <TrendingUp size={16} />
              Peso
            </p>
            <LineChart data={weightSeries} />
            <div className="mt-1 flex justify-between text-[11px] text-zinc-500">
              {weightSeries.map((p) => (
                <span key={p.label}>{p.label}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Totales + contacto */}
        <section className="premium-card rounded-2xl p-6">
          <h3 className="text-lg font-black">Tu actividad</h3>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Info icon={<Dumbbell size={14} />} label="Entrenamientos" value={String(results.length)} />
            <Info icon={<Timer size={14} />} label="Minutos" value={String(Math.round(totalSec / 60))} />
            <Info icon={<Flame size={14} />} label="Calorías*" value={String(totalKcal)} />
          </div>
          <p className="mt-2 text-xs text-zinc-600">
            *Calorías estimadas de forma informativa.
          </p>

          <div className="mt-6 rounded-xl border border-[#65ff4f]/20 bg-[#65ff4f]/[0.05] p-4">
            <p className="text-sm font-bold text-zinc-200">Tu coach</p>
            <p className="mt-1 text-sm text-zinc-400">{coachConfig.name}</p>
            <a
              href={whatsappUrl(
                `Hola ${coachConfig.name}, soy ${realName || "tu alumno"}. Tengo una consulta.`,
              )}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-[#85ff73] to-[#65ff4f] px-5 text-sm font-black uppercase tracking-wide text-black shadow-[0_8px_30px_-8px_rgba(101,255,79,0.5)] transition duration-300 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.98]"
            >
              <MessageCircle size={18} />
              Contactar por WhatsApp
            </a>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}

function Info({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-zinc-500">
        <span className="text-[#65ff4f]">{icon}</span>
        {label}
      </p>
      <p className={`mt-1 text-xl font-black ${highlight ? "text-[#65ff4f]" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}
