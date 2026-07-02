"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CalendarClock,
  CheckCheck,
  ClipboardCheck,
  Clock,
  Dumbbell,
  Flame,
  UserPlus,
  Users,
} from "lucide-react";
import { notificationsService } from "@/services/notifications.service";
import { useToast } from "@/context/toast-context";
import { formatDate } from "@/lib/format";
import type {
  CoachNotification,
  NotificationPriority,
  NotificationType,
} from "@/types";

const TYPE_META: Record<
  NotificationType,
  { label: string; icon: typeof Bell }
> = {
  lead: { label: "Leads", icon: UserPlus },
  client: { label: "Alumnos", icon: Users },
  workout: { label: "Entrenamientos", icon: Flame },
  inactivity: { label: "Inactividad", icon: Clock },
  program: { label: "Programas", icon: Dumbbell },
  access: { label: "Accesos", icon: CalendarClock },
  evaluation: { label: "Evaluaciones", icon: ClipboardCheck },
  gap: { label: "Pendientes", icon: AlertCircle },
};

const PRIORITY_META: Record<
  NotificationPriority,
  { label: string; dot: string; text: string }
> = {
  alta: { label: "Alta", dot: "bg-red-500", text: "text-red-300" },
  media: { label: "Media", dot: "bg-amber-400", text: "text-amber-300" },
  baja: { label: "Baja", dot: "bg-[#65ff4f]", text: "text-[#65ff4f]" },
};

export function NotificationsCenter() {
  const toast = useToast();
  const [items, setItems] = useState<CoachNotification[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [typeFilter, setTypeFilter] = useState<NotificationType | "todas">("todas");
  const [priorityFilter, setPriorityFilter] = useState<NotificationPriority | "todas">("todas");

  async function load() {
    setItems(await notificationsService.getAll());
    setLoaded(true);
  }
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const unread = items.filter((n) => !n.read).length;
  const filtered = items.filter(
    (n) =>
      (typeFilter === "todas" || n.type === typeFilter) &&
      (priorityFilter === "todas" || n.priority === priorityFilter),
  );

  async function markRead(id: string) {
    await notificationsService.markRead(id);
    await load();
  }
  async function markAll() {
    await notificationsService.markAllRead();
    await load();
    toast.success("Todas marcadas como leídas.");
  }

  const usedTypes = Array.from(new Set(items.map((n) => n.type)));

  return (
    <section id="notificaciones" className="premium-card mt-6 overflow-hidden rounded-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 p-6">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-black">
            <span className="relative">
              <Bell size={20} className="text-[#65ff4f]" />
              {unread > 0 ? (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
                  {unread}
                </span>
              ) : null}
            </span>
            Notificaciones
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            {unread > 0 ? `${unread} sin leer` : "Todo al día"} · derivadas de la actividad real.
          </p>
        </div>
        <button
          type="button"
          onClick={markAll}
          disabled={unread === 0}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/15 px-4 text-sm font-bold text-zinc-300 transition hover:border-[#65ff4f]/50 hover:text-[#65ff4f] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <CheckCheck size={16} />
          Marcar todas como leídas
        </button>
      </div>

      {/* Filtros */}
      <div className="space-y-3 border-b border-white/10 px-6 py-4">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <Chip active={typeFilter === "todas"} onClick={() => setTypeFilter("todas")}>Todos los tipos</Chip>
          {usedTypes.map((t) => (
            <Chip key={t} active={typeFilter === t} onClick={() => setTypeFilter(t)}>
              {TYPE_META[t].label}
            </Chip>
          ))}
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <Chip active={priorityFilter === "todas"} onClick={() => setPriorityFilter("todas")}>Toda prioridad</Chip>
          {(["alta", "media", "baja"] as NotificationPriority[]).map((p) => (
            <Chip key={p} active={priorityFilter === p} onClick={() => setPriorityFilter(p)}>
              Prioridad {PRIORITY_META[p].label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="p-6">
        {!loaded ? (
          <p className="text-sm text-zinc-400">Cargando notificaciones...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-zinc-400">No hay notificaciones con estos filtros.</p>
        ) : (
          <ul className="space-y-2">
            {filtered.map((n) => {
              const meta = TYPE_META[n.type];
              const prio = PRIORITY_META[n.priority];
              const Icon = n.priority === "alta" ? AlertTriangle : meta.icon;
              return (
                <li
                  key={n.id}
                  className={`flex items-start gap-3 rounded-xl border p-3 transition ${
                    n.read
                      ? "border-white/5 bg-white/[0.01] opacity-60"
                      : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  <span className={`mt-0.5 shrink-0 ${prio.text}`}>
                    <Icon size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-5 text-zinc-100">{n.text}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
                      <span className="inline-flex items-center gap-1">
                        <span className={`h-1.5 w-1.5 rounded-full ${prio.dot}`} />
                        {prio.label}
                      </span>
                      <span>· {meta.label}</span>
                      {n.date ? <span>· {formatDate(n.date)}</span> : null}
                    </p>
                  </div>
                  {!n.read ? (
                    <button
                      type="button"
                      onClick={() => markRead(n.id)}
                      className="shrink-0 rounded-lg border border-white/15 px-2.5 py-1 text-[11px] font-bold text-zinc-300 transition hover:border-[#65ff4f]/50 hover:text-[#65ff4f]"
                    >
                      Marcar leída
                    </button>
                  ) : (
                    <span className="shrink-0 text-[11px] font-bold text-zinc-600">Leída</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
        active
          ? "border-[#65ff4f] bg-[#65ff4f]/10 text-[#65ff4f]"
          : "border-white/10 bg-white/[0.03] text-zinc-300 hover:border-[#65ff4f]/40"
      }`}
    >
      {children}
    </button>
  );
}
