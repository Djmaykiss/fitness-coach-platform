"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Dumbbell,
  MessageCircle,
  Target,
  Trophy,
} from "lucide-react";
import { DashboardShell } from "@/layouts/dashboard-shell";
import { RequireAuth } from "@/components/require-auth";
import { StatCard } from "@/components/ui";
import { useAuth } from "@/context/auth-context";
import { clientDashboardService } from "@/services/dashboard.service";
import type { ClientProgress } from "@/types";

export default function ClientDashboardPage() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ClientProgress | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    clientDashboardService.getProgressForUser(user.id).then((data) => {
      if (active) setProgress(data);
    });
    return () => {
      active = false;
    };
  }, [user]);

  return (
    <RequireAuth role="client">
      <DashboardShell
        title="Bienvenido, Cliente"
        subtitle="Tu programa, tu progreso, tu proxima llamada y tus tareas de la semana en un solo lugar."
      >
        {progress ? (
          <ProgressView progress={progress} />
        ) : (
          <p className="text-zinc-400">Cargando tu progreso...</p>
        )}
      </DashboardShell>
    </RequireAuth>
  );
}

function ProgressView({ progress }: { progress: ClientProgress }) {
  const stats = [
    { label: "Peso inicial", value: progress.pesoInicial, icon: Trophy },
    { label: "Peso actual", value: progress.pesoActual, icon: Activity },
    { label: "Objetivo", value: progress.objetivo, icon: Target },
    { label: "Adherencia", value: progress.adherencia, icon: Dumbbell },
  ];

  const hasProgram = progress.semanasTotales > 0;

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="premium-card rounded-2xl p-6">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-[#65ff4f]">
            Programa asignado
          </p>
          <h2 className="mt-4 text-3xl font-black">{progress.programa}</h2>
          <p className="mt-3 text-zinc-400">
            {hasProgram
              ? `Semana ${progress.semanaActual} de ${progress.semanasTotales}. Manten la consistencia y registra tus avances.`
              : "Aun no tienes un programa asignado. Tu coach lo configurara pronto."}
          </p>
          <div className="mt-6">
            <div className="mb-2 flex justify-between text-sm text-zinc-400">
              <span>Estado del progreso</span>
              <span>{progress.progresoPct}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#65ff4f] transition-all"
                style={{ width: `${progress.progresoPct}%` }}
              />
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <MiniMetric label="Peso inicial" value={progress.pesoInicial} />
            <MiniMetric label="Peso actual" value={progress.pesoActual} />
            <MiniMetric label="Objetivo" value={progress.objetivo} />
          </div>
        </section>

        <section className="premium-card rounded-2xl p-6">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-[#65ff4f]">
            Proxima llamada
          </p>
          <h2 className="mt-4 text-3xl font-black">Jueves, 7:00 PM</h2>
          <p className="mt-3 text-zinc-400">
            Check-in semanal para revisar adherencia, cargas y ajustes del plan.
          </p>
          <button
            type="button"
            disabled
            className="mt-6 inline-flex min-h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-5 text-sm font-black uppercase tracking-wide text-zinc-500"
          >
            <MessageCircle size={18} />
            Contacto pendiente
          </button>
          <p className="mt-2 text-center text-xs text-zinc-600">
            El numero del coach se agregara despues.
          </p>
        </section>
      </div>

      <section className="premium-card mt-6 rounded-2xl p-6">
        <h2 className="text-2xl font-black">Proximas tareas</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {progress.tasks.map((task) => (
            <div
              key={task}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <CheckCircle2 className="text-[#65ff4f]" size={20} />
              <span className="text-sm font-semibold text-zinc-200">{task}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-xl font-black text-white">{value}</p>
    </div>
  );
}
