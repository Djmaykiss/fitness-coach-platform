"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  BookOpen,
  CalendarClock,
  Dumbbell,
  Film,
  Flame,
  Gauge,
  ListChecks,
  Salad,
  Scale,
  Settings2,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
  Video,
  Workflow,
} from "lucide-react";
import { Bell } from "lucide-react";
import { adminDashboardService } from "@/services/dashboard.service";
import { notificationsService } from "@/services/notifications.service";
import { useSettings } from "@/context/settings-context";
import { AccessBadge } from "@/components/access-badge";
import { formatDate } from "@/lib/format";
import type { CoachNotification, CoachOverview } from "@/types";

export function CoachOverviewPanel({
  onNavigate,
}: {
  /** Si se provee, los accesos rapidos cambian de tab (y sub-tab) en vez de scroll. */
  onNavigate?: (tab: string, sub?: string) => void;
} = {}) {
  const { settings } = useSettings();
  const [data, setData] = useState<CoachOverview | null>(null);
  const [notifications, setNotifications] = useState<CoachNotification[]>([]);

  useEffect(() => {
    let active = true;
    adminDashboardService.getCoachOverview().then((d) => {
      if (active) setData(d);
    });
    notificationsService.getAll().then((n) => {
      if (active) setNotifications(n);
    });
    return () => {
      active = false;
    };
  }, []);

  const unread = notifications.filter((n) => !n.read).length;
  const latestNotifications = notifications.slice(0, 3);

  if (!data) {
    return <OverviewSkeleton />;
  }

  const money = (n: number) =>
    `${settings.currency === "USD" ? "$" : ""}${n.toLocaleString("es-ES")}${
      settings.currency && settings.currency !== "USD" ? ` ${settings.currency}` : ""
    }`;

  return (
    <div className="space-y-6">
      {/* Encabezado del negocio */}
      <div className="premium-card overflow-hidden rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <BrandLogo src={settings.logoUrl} name={settings.businessName} />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#65ff4f]">
                Panel del coach
              </p>
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                {settings.businessName}
              </h2>
              {settings.tagline ? (
                <p className="mt-0.5 text-sm text-zinc-400">{settings.tagline}</p>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                onNavigate ? onNavigate("notificaciones") : scrollToHeading("Notificaciones")
              }
              className="relative inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-300 transition hover:border-[#65ff4f]/50 hover:text-[#65ff4f]"
              aria-label={`Notificaciones${unread ? `, ${unread} sin leer` : ""}`}
            >
              <Bell size={20} />
              {unread > 0 ? (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
                  {unread}
                </span>
              ) : null}
            </button>
            <div className="rounded-xl border border-[#65ff4f]/25 bg-[#65ff4f]/[0.06] px-5 py-3 text-right">
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
                Ingresos estimados / mes
              </p>
              <p className="text-2xl font-black text-[#65ff4f]">
                {money(data.ingresosEstimados)}
              </p>
            </div>
          </div>
        </div>

        {latestNotifications.length > 0 ? (
          <div className="mt-5 border-t border-white/10 pt-4">
            <p className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#65ff4f]">
              <Bell size={14} />
              Últimas notificaciones
            </p>
            <ul className="space-y-1.5">
              {latestNotifications.map((n) => (
                <li key={n.id} className="flex items-center gap-2 text-sm text-zinc-300">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${n.read ? "bg-zinc-600" : "bg-[#65ff4f]"}`} />
                  <span className="truncate">{n.text}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {/* Accesos rápidos */}
      <div className="flex flex-wrap gap-2">
        {QUICK_LINKS.map((q) => (
          <button
            key={q.label}
            type="button"
            onClick={() =>
              onNavigate ? onNavigate(q.tab, q.sub) : scrollToHeading(q.match)
            }
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-zinc-300 transition hover:border-[#65ff4f]/50 hover:text-[#65ff4f]"
          >
            <q.icon size={14} />
            {q.label}
          </button>
        ))}
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Metric icon={Users} label="Alumnos activos" value={data.alumnosActivos} accent />
        <Metric icon={Users} label="Suspendidos" value={data.alumnosSuspendidos} />
        <Metric icon={Users} label="Vencidos" value={data.alumnosVencidos} />
        <Metric icon={Users} label="Total alumnos" value={data.alumnosTotal} />
        <Metric icon={Dumbbell} label="Programas" value={data.programas} />
        <Metric icon={ListChecks} label="Rutinas publicadas" value={data.rutinasPublicadas} />
        <Metric icon={BookOpen} label="Artículos" value={data.articulosPublicados} />
        <Metric icon={Dumbbell} label="Ejercicios" value={data.ejercicios} />
        <Metric icon={Video} label="Con video" value={data.ejerciciosConVideo} />
        <Metric icon={Flame} label="Entrenos hoy" value={data.entrenamientosHoy} accent />
        <Metric icon={CalendarClock} label="Entrenos semana" value={data.entrenamientosSemana} />
        <Metric icon={Film} label="Entrenos mes" value={data.entrenamientosMes} />
        <Metric icon={Gauge} label="Progreso prom." value={`${data.progresoPromedio}%`} />
        <Metric icon={Scale} label="Meta peso prom." value={`${data.metaPesoPromedio} kg`} />
        <Metric icon={BarChart3} label="IMC promedio" value={data.imcPromedio || "—"} />
        <Metric icon={TrendingUp} label="Renuevan pronto" value={data.proximasRenovaciones.length} />
      </div>

      {/* Gráfica + renovaciones */}
      <div className="grid gap-6 [&>*]:min-w-0 lg:grid-cols-[1.4fr_1fr]">
        <div className="premium-card rounded-2xl p-6">
          <p className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#65ff4f]">
            <BarChart3 size={15} />
            Entrenamientos (últimos 14 días)
          </p>
          <TrainingBars series={data.entrenamientosSerie} />
        </div>

        <div className="premium-card rounded-2xl p-6">
          <p className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#65ff4f]">
            <CalendarClock size={15} />
            Próximas renovaciones
          </p>
          {data.proximasRenovaciones.length === 0 ? (
            <p className="text-sm text-zinc-400">
              No hay renovaciones en los próximos 7 días.
            </p>
          ) : (
            <ul className="space-y-2">
              {data.proximasRenovaciones.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3"
                >
                  <span className="truncate font-semibold text-white">{r.name}</span>
                  <span className="shrink-0 text-xs font-bold text-zinc-400">
                    {formatDate(r.date)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Últimos alumnos + actividad reciente */}
      <div className="grid gap-6 [&>*]:min-w-0 lg:grid-cols-2">
        <div className="premium-card rounded-2xl p-6">
          <p className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#65ff4f]">
            <UserPlus size={15} />
            Últimos alumnos
          </p>
          {data.ultimosAlumnos.length === 0 ? (
            <p className="text-sm text-zinc-400">Aún no hay alumnos.</p>
          ) : (
            <ul className="space-y-2">
              {data.ultimosAlumnos.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3"
                >
                  <span className="truncate font-semibold text-white">{a.name}</span>
                  <AccessBadge status={a.accessStatus} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="premium-card rounded-2xl p-6">
          <p className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#65ff4f]">
            <Activity size={15} />
            Actividad reciente
          </p>
          {data.actividadReciente.length === 0 ? (
            <p className="text-sm text-zinc-400">Sin actividad todavía.</p>
          ) : (
            <ul className="space-y-2">
              {data.actividadReciente.map((a) => (
                <li key={a.id} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <span className="mt-0.5 shrink-0 text-[#65ff4f]">
                    {a.kind === "workout" ? <Flame size={15} /> : <Sparkles size={15} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-5 text-zinc-200">{a.text}</p>
                    <p className="text-xs text-zinc-500">{formatDate(a.date)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

const QUICK_LINKS = [
  { label: "Alumnos", match: "Clientes", tab: "alumnos", sub: undefined, icon: Users },
  { label: "Leads", match: "Leads", tab: "alumnos", sub: undefined, icon: UserPlus },
  { label: "Ejercicios", match: "Biblioteca de ejercicios", tab: "contenido", sub: "biblioteca", icon: Dumbbell },
  { label: "Programas", match: "Programas de entrenamiento", tab: "contenido", sub: "programas", icon: ListChecks },
  { label: "Nutrición", match: "Planes de nutrición", tab: "contenido", sub: "nutricion", icon: Salad },
  { label: "Notificaciones", match: "Notificaciones", tab: "notificaciones", sub: undefined, icon: Bell },
  { label: "CRM", match: "CRM", tab: "crm", sub: undefined, icon: Workflow },
  { label: "Descubre", match: "Descubre", tab: "contenido", sub: "descubre", icon: BookOpen },
  { label: "Onboarding", match: "Onboarding", tab: "contenido", sub: "onboarding", icon: Sparkles },
  { label: "Configuración", match: "Configuración del negocio", tab: "configuracion", sub: undefined, icon: Settings2 },
] as const;

/** Desplaza a la sección cuyo encabezado (h2) contiene el texto dado. */
function scrollToHeading(match: string) {
  const h2 = Array.from(document.querySelectorAll("h2")).find((h) =>
    (h.textContent || "").toLowerCase().includes(match.toLowerCase()),
  );
  if (h2) h2.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Metric({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: typeof Users;
  label: string;
  value: number | string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        accent
          ? "border-[#65ff4f]/30 bg-[#65ff4f]/[0.06]"
          : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">
          {label}
        </p>
        <Icon size={16} className={accent ? "text-[#65ff4f]" : "text-zinc-500"} />
      </div>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function TrainingBars({ series }: { series: { label: string; value: number }[] }) {
  const max = Math.max(1, ...series.map((s) => s.value));
  return (
    <div className="flex h-40 items-end justify-between gap-1.5">
      {series.map((s, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t bg-gradient-to-t from-[#65ff4f]/40 to-[#65ff4f] transition-all"
              style={{ height: `${Math.max(4, (s.value / max) * 100)}%` }}
              title={`${s.value} entrenamientos`}
            />
          </div>
          <span className="text-[9px] text-zinc-600">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

function BrandLogo({ src, name }: { src: string; name: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  const ok = Boolean(src) && failed !== src;
  if (ok) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        onError={() => setFailed(src)}
        className="h-14 w-14 shrink-0 rounded-xl border border-white/10 object-contain"
      />
    );
  }
  return (
    <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[#65ff4f]/30 bg-[#65ff4f]/10 text-lg font-black text-[#65ff4f]">
      {(name || "C").slice(0, 2).toUpperCase()}
    </span>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="premium-card h-28 animate-pulse rounded-2xl" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/[0.04]" />
        ))}
      </div>
    </div>
  );
}
