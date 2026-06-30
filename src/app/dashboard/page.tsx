"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Dumbbell,
  MessageCircle,
  PauseCircle,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Target,
  Trophy,
} from "lucide-react";
import { DashboardShell } from "@/layouts/dashboard-shell";
import { RequireAuth } from "@/components/require-auth";
import { AccessBadge } from "@/components/access-badge";
import { EvaluationDetails } from "@/components/evaluation-details";
import { TrainingProgramView } from "@/components/dashboard/training-program-view";
import { NutritionPlanView } from "@/components/dashboard/nutrition-plan-view";
import { PremiumDashboard } from "@/components/dashboard/premium-dashboard";
import { StatCard } from "@/components/ui";
import { useAuth } from "@/context/auth-context";
import { clientDashboardService } from "@/services/dashboard.service";
import type { ClientAccess } from "@/services/dashboard.service";
import { coachConfig, whatsappUrl } from "@/config/coachConfig";
import { formatDate } from "@/lib/format";
import type { ClientProgress, LeadEvaluation } from "@/types";

export default function ClientDashboardPage() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ClientProgress | null>(null);
  const [access, setAccess] = useState<ClientAccess | null>(null);
  const [accessLoaded, setAccessLoaded] = useState(false);
  const [evaluation, setEvaluation] = useState<LeadEvaluation | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    clientDashboardService.getProgressForUser(user.id).then((data) => {
      if (active) setProgress(data);
    });
    clientDashboardService.getAccessForUser(user.id).then((data) => {
      if (!active) return;
      setAccess(data);
      setAccessLoaded(true);
    });
    clientDashboardService.getEvaluationForUser(user.id).then((data) => {
      if (active) setEvaluation(data);
    });
    return () => {
      active = false;
    };
  }, [user]);

  // El acceso bloquea las funciones premium cuando NO esta activo (vencido o
  // pausado). Solo se condiciona el renderizado: nada se elimina.
  const locked = access != null && access.accessStatus !== "Activo";

  // Nombre real del alumno. "Cliente" es el placeholder de la cuenta demo: se
  // trata como ausencia de nombre para no saludar "Hola, Cliente".
  const realName =
    user?.firstName && user.firstName !== "Cliente" ? user.firstName : "";

  return (
    <RequireAuth role="client">
      <DashboardShell
        title={
          locked
            ? `Hola${realName ? `, ${realName}` : ""}`
            : `Bienvenido, ${user?.firstName ?? ""}`
        }
        subtitle={
          locked
            ? ""
            : "Tu programa, tu progreso, tu próxima llamada y tus tareas de la semana en un solo lugar."
        }
        minimalNav
        navName={realName}
      >
        {!accessLoaded ? (
          <p className="text-zinc-400">Cargando tu acceso...</p>
        ) : locked && access ? (
          <LockedDashboard access={access} name={realName} />
        ) : (
          <>
            {access ? <AccessNotice access={access} /> : null}
            {progress ? (
              <ProgressView progress={progress} />
            ) : (
              <p className="text-zinc-400">Cargando tu progreso...</p>
            )}
            {evaluation ? (
              <section className="premium-card mt-6 rounded-2xl p-6">
                <h2 className="text-2xl font-black">Mi evaluación inicial</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Los datos que registraste al comenzar.
                </p>
                <div className="mt-5">
                  <EvaluationDetails evaluation={evaluation} />
                </div>
              </section>
            ) : null}
            {user ? <TrainingProgramView userId={user.id} /> : null}
            {user ? <NutritionPlanView userId={user.id} /> : null}
            {user ? <PremiumDashboard userId={user.id} /> : null}
          </>
        )}
      </DashboardShell>
    </RequireAuth>
  );
}

function AccessNotice({ access }: { access: ClientAccess }) {
  const { accessStatus, accessExpiresAt } = access;

  const config = {
    Activo: {
      icon: ShieldCheck,
      tone: "border-[#65ff4f]/30 bg-[#65ff4f]/[0.06]",
      iconTone: "text-[#65ff4f]",
      title: "Tu acceso está activo",
      message: `Tienes acceso a tu plan hasta el ${formatDate(accessExpiresAt)}.`,
    },
    Vencido: {
      icon: ShieldAlert,
      tone: "border-red-500/30 bg-red-500/[0.06]",
      iconTone: "text-red-400",
      title: "Tu acceso venció",
      message: `Tu acceso terminó el ${formatDate(
        accessExpiresAt,
      )}. Renueva con tu coach para seguir entrenando.`,
    },
    Pausado: {
      icon: PauseCircle,
      tone: "border-amber-400/30 bg-amber-400/[0.06]",
      iconTone: "text-amber-300",
      title: "Tu acceso está en pausa",
      message:
        "Tu acceso está pausado temporalmente. Contacta a tu coach para reactivarlo.",
    },
  }[accessStatus];

  const Icon = config.icon;

  return (
    <section
      className={`mb-6 flex items-start gap-4 rounded-2xl border p-5 ${config.tone}`}
    >
      <div className={`mt-0.5 shrink-0 ${config.iconTone}`}>
        <Icon size={24} />
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-black">{config.title}</h2>
          <AccessBadge status={accessStatus} />
        </div>
        <p className="mt-1 text-sm leading-6 text-zinc-400">{config.message}</p>
      </div>
    </section>
  );
}

/** Configuracion visual por estado de acceso bloqueado (vencido / pausado). */
const LOCKED_CONFIG: Record<
  "Vencido" | "Pausado",
  {
    icon: typeof ShieldAlert;
    iconWrap: string;
    title: string;
    dateLabel: string;
    message: string;
  }
> = {
  Vencido: {
    icon: ShieldAlert,
    iconWrap: "border-red-500/30 bg-red-500/[0.08] text-red-400",
    title: "Tu acceso ha vencido",
    dateLabel: "Venció el",
    message:
      "Renueva tu acceso para recuperar todas las funciones de tu plataforma.",
  },
  Pausado: {
    icon: PauseCircle,
    iconWrap: "border-amber-400/30 bg-amber-400/[0.08] text-amber-300",
    title: "Tu acceso está en pausa",
    dateLabel: "Vigente hasta el",
    message:
      "Reactiva tu acceso para recuperar todas las funciones de tu plataforma.",
  },
};

/**
 * Vista restringida cuando el acceso NO esta activo (vencido o pausado).
 * Oculta TODOS los modulos premium: solo muestra el estado y como recuperarlo.
 */
function LockedDashboard({
  access,
  name,
}: {
  access: ClientAccess;
  name: string;
}) {
  const config =
    access.accessStatus === "Pausado"
      ? LOCKED_CONFIG.Pausado
      : LOCKED_CONFIG.Vencido;
  const Icon = config.icon;

  return (
    <section className="premium-card mx-auto max-w-xl rounded-3xl p-8 text-center sm:p-10">
      <div
        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border ${config.iconWrap}`}
      >
        <Icon size={30} />
      </div>

      <h2 className="mt-6 text-2xl font-black tracking-tight sm:text-3xl">
        {config.title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-zinc-400 sm:text-base">
        Tu plan se encuentra temporalmente desactivado.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <span className="text-xs font-bold uppercase tracking-wide text-zinc-500">
          Estado
        </span>
        <AccessBadge status={access.accessStatus} />
      </div>

      {access.accessExpiresAt ? (
        <p className="mt-3 text-sm text-zinc-400">
          {config.dateLabel}{" "}
          <span className="font-bold text-zinc-200">
            {formatDate(access.accessExpiresAt)}
          </span>
        </p>
      ) : null}

      <p className="mx-auto mt-5 max-w-md text-base leading-7 text-zinc-300">
        {config.message}
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <a
          href={whatsappUrl(
            `Hola ${coachConfig.name}, soy ${name || "tu alumno"}. Quiero renovar mi acceso a la plataforma.`,
          )}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-[#85ff73] to-[#65ff4f] px-6 text-sm font-black uppercase tracking-wide text-black shadow-[0_8px_30px_-8px_rgba(101,255,79,0.5)] transition duration-300 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.98]"
        >
          <RefreshCw size={18} />
          Renovar acceso
        </a>
        <a
          href={whatsappUrl(
            `Hola ${coachConfig.name}, soy ${name || "tu alumno"}. Tengo una consulta sobre mi plan.`,
          )}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-6 text-sm font-black uppercase tracking-wide text-white transition duration-300 hover:border-[#65ff4f]/50 hover:bg-[#65ff4f]/10"
        >
          <MessageCircle size={18} />
          Contactar coach
        </a>
      </div>
      <p className="mt-4 text-xs text-zinc-600">
        Se abrirá WhatsApp para escribirle a tu coach.
      </p>
    </section>
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
              ? `Semana ${progress.semanaActual} de ${progress.semanasTotales}. Mantén la consistencia y registra tus avances.`
              : "Aún no tienes un programa asignado. Tu coach lo configurará pronto."}
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
            Próxima llamada
          </p>
          <h2 className="mt-4 text-3xl font-black">Jueves, 7:00 PM</h2>
          <p className="mt-3 text-zinc-400">
            Check-in semanal para revisar adherencia, cargas y ajustes del plan.
          </p>
          <a
            href={whatsappUrl(
              `Hola ${coachConfig.name}, quiero coordinar mi próximo check-in.`,
            )}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-[#85ff73] to-[#65ff4f] px-5 text-sm font-black uppercase tracking-wide text-black shadow-[0_8px_30px_-8px_rgba(101,255,79,0.5)] transition duration-300 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.98]"
          >
            <MessageCircle size={18} />
            Contactar coach
          </a>
          <p className="mt-2 text-center text-xs text-zinc-600">
            Se abrirá WhatsApp con {coachConfig.name}.
          </p>
        </section>
      </div>

      <section className="premium-card mt-6 rounded-2xl p-6">
        <h2 className="text-2xl font-black">Próximas tareas</h2>
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
