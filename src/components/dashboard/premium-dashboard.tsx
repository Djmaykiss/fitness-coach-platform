"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  Award,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Circle,
  Dumbbell,
  Flame,
  Folder,
  GlassWater,
  History,
  ImageIcon,
  Lock,
  Moon,
  Play,
  Plus,
  Ruler,
  Salad,
  Send,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Utensils,
} from "lucide-react";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import { LineChart } from "@/components/dashboard/charts";
import { coachingService } from "@/services/coaching.service";
import { formatDate } from "@/lib/format";
import type {
  Achievement,
  BodyMeasurement,
  BodyMetrics,
  ChatMessage,
  CheckIn,
  ChecklistState,
  CoachingDashboard,
  ComplianceData,
  GoalData,
  HistoryEvent,
  MetricSeries,
  NutritionState,
  ProgressPhoto,
  Resource,
  TodayRoutine,
} from "@/types";

export function PremiumDashboard({ userId }: { userId: string }) {
  const [data, setData] = useState<CoachingDashboard | null>(null);

  async function load() {
    const result = await coachingService.getDashboard(userId);
    setData(result);
  }

  useEffect(() => {
    let active = true;
    coachingService.getDashboard(userId).then((result) => {
      if (active) setData(result);
    });
    return () => {
      active = false;
    };
  }, [userId]);

  if (!data) {
    return (
      <p className="mt-6 text-zinc-400">Cargando tu plataforma de coaching...</p>
    );
  }

  const clientId = data.clientId;

  async function toggle(listKey: string, itemKey: string, done: boolean) {
    await coachingService.toggleCheck(clientId, listKey, itemKey, done);
    await load();
  }

  return (
    <div className="mt-10 space-y-6">
      <div className="flex items-center gap-3">
        <Sparkles className="text-[#65ff4f]" size={22} />
        <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
          Tu plataforma de coaching
        </h2>
      </div>

      <TransformationBar percent={data.transformationPct} />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <GoalCard goal={data.goal} percent={data.transformationPct} />
        <NextCheckIn checkIn={data.checkIn} />
      </div>

      <ProgressCharts metrics={data.metrics} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Measurements items={data.measurements} />
        <BodyMetricsCard metrics={data.bodyMetrics} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Compliance data={data.compliance} />
        <Checklist
          title="Objetivos de la semana"
          eyebrow="Semana"
          icon={Target}
          state={data.weeklyGoals}
          onToggle={(key, done) => toggle("weekly-goals", key, done)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <TrainingCalendar />
        <TodayRoutineCard routine={data.routine} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Nutrition
          state={data.nutrition}
          onToggle={(key, done) => toggle("nutrition", key, done)}
        />
        <Checklist
          title="Recordatorios"
          eyebrow="Hoy"
          icon={CheckCircle2}
          state={data.reminders}
          onToggle={(key, done) => toggle("reminders", key, done)}
        />
      </div>

      <BeforeAfter before={data.beforeAfter.before} after={data.beforeAfter.after} />

      <ProgressGallery
        photos={data.photos}
        onAdd={async (photo) => {
          await coachingService.addPhoto(clientId, photo);
          await load();
        }}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Achievements items={data.achievements} />
        <Timeline events={data.history} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <CoachChat initial={data.chat} />
        <Resources items={data.resources} />
      </div>
    </div>
  );
}

/* ====================== UI compartida ====================== */

function SectionCard({
  title,
  eyebrow,
  icon: Icon,
  action,
  children,
  className = "",
}: {
  title: string;
  eyebrow?: string;
  icon?: ComponentType<LucideProps>;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`premium-card rounded-2xl p-6 ${className}`}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {Icon ? (
            <span className="inline-flex rounded-lg border border-[#65ff4f]/20 bg-[#65ff4f]/10 p-2 text-[#65ff4f] shadow-[0_0_20px_-6px_rgba(101,255,79,0.5)]">
              <Icon size={18} />
            </span>
          ) : null}
          <div>
            {eyebrow ? (
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#65ff4f]">
                {eyebrow}
              </p>
            ) : null}
            <h3 className="text-lg font-black">{title}</h3>
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Bar({ value, tone = "#65ff4f" }: { value: number; tone?: string }) {
  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: tone }}
      />
    </div>
  );
}

/** Imagen con placeholder elegante si no existe (preparada para fotos reales). */
function MediaImg({
  src,
  alt,
  rounded = "rounded-xl",
}: {
  src: string;
  alt: string;
  rounded?: string;
}) {
  const [ok, setOk] = useState(Boolean(src));
  return (
    <div
      className={`relative aspect-[3/4] w-full overflow-hidden bg-white/[0.04] ${rounded}`}
    >
      {ok && src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="200px"
          className="object-cover"
          onError={() => setOk(false)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-zinc-600">
          <ImageIcon size={28} />
        </div>
      )}
    </div>
  );
}

/* ====================== Secciones ====================== */

/* 17. Barra principal de transformación */
function TransformationBar({ percent }: { percent: number }) {
  return (
    <section className="premium-card rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="text-[#65ff4f]" size={20} />
          <p className="text-sm font-black uppercase tracking-[0.22em] text-[#65ff4f]">
            Transformación
          </p>
        </div>
        <span className="text-2xl font-black text-white">{percent}%</span>
      </div>
      <div className="mt-4">
        <Bar value={percent} />
      </div>
      <p className="mt-3 text-sm text-zinc-400">
        Vas avanzando hacia tu meta. Mantén la constancia 💪
      </p>
    </section>
  );
}

/* 8. Progreso hacia la meta */
function GoalCard({ goal, percent }: { goal: GoalData; percent: number }) {
  const remaining = Math.max(0, Math.round((goal.currentWeight - goal.targetWeight) * 10) / 10);
  return (
    <SectionCard title="Progreso hacia la meta" eyebrow="Meta" icon={Target}>
      <p className="text-2xl font-black">{goal.meta}</p>
      <div className="mt-5 grid grid-cols-3 gap-3">
        <Tile label="Peso inicial" value={`${goal.startWeight} kg`} />
        <Tile label="Peso actual" value={`${goal.currentWeight} kg`} highlight />
        <Tile label="Objetivo" value={`${goal.targetWeight} kg`} />
      </div>
      <div className="mt-5 flex items-center justify-between text-sm text-zinc-400">
        <span>Te faltan {remaining} kg</span>
        <span className="font-black text-[#65ff4f]">{percent}%</span>
      </div>
      <div className="mt-2">
        <Bar value={percent} />
      </div>
    </SectionCard>
  );
}

/* 18. Próximo Check-In */
function NextCheckIn({ checkIn }: { checkIn: CheckIn }) {
  return (
    <SectionCard title="Próximo check-in" eyebrow="Agenda" icon={CalendarCheck}>
      <p className="text-2xl font-black">{formatDate(checkIn.date)}</p>
      <p className="mt-1 text-zinc-400">
        {checkIn.time} · {checkIn.coach}
      </p>
      <div className="mt-4 inline-flex rounded-lg bg-[#65ff4f]/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-[#65ff4f]">
        {checkIn.status}
      </div>
      <button
        type="button"
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-5 text-sm font-bold text-zinc-300 transition hover:border-[#65ff4f]/50 hover:text-[#65ff4f]"
      >
        <CalendarDays size={16} />
        Reprogramar
      </button>
    </SectionCard>
  );
}

/* 2. Gráficas de progreso */
function ProgressCharts({ metrics }: { metrics: MetricSeries }) {
  const charts: { key: keyof MetricSeries; label: string; unit: string }[] = [
    { key: "weight", label: "Peso", unit: "kg" },
    { key: "waist", label: "Cintura", unit: "cm" },
    { key: "fat", label: "Grasa corporal", unit: "%" },
    { key: "muscle", label: "Masa muscular", unit: "%" },
  ];
  return (
    <SectionCard title="Gráficas de progreso" eyebrow="Tendencias" icon={Activity}>
      <div className="grid gap-5 sm:grid-cols-2">
        {charts.map((c) => {
          const series = metrics[c.key];
          const first = series[0]?.value ?? 0;
          const last = series[series.length - 1]?.value ?? 0;
          const delta = Math.round((last - first) * 10) / 10;
          const positive = c.key === "muscle" ? delta >= 0 : delta <= 0;
          return (
            <div
              key={c.key}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
            >
              <div className="mb-2 flex items-end justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                    {c.label}
                  </p>
                  <p className="text-xl font-black">
                    {last}
                    <span className="ml-1 text-sm font-bold text-zinc-500">
                      {c.unit}
                    </span>
                  </p>
                </div>
                <span
                  className={`text-xs font-black ${positive ? "text-[#65ff4f]" : "text-red-400"}`}
                >
                  {delta > 0 ? "+" : ""}
                  {delta} {c.unit}
                </span>
              </div>
              <LineChart data={series} />
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

/* 5. Medidas corporales */
function Measurements({ items }: { items: BodyMeasurement[] }) {
  return (
    <SectionCard title="Medidas corporales" eyebrow="Cuerpo" icon={Ruler}>
      <div className="grid grid-cols-2 gap-3">
        {items.map((m) => {
          const diff = Math.round((m.current - m.start) * 10) / 10;
          const good = m.key === "cintura" || m.key === "peso" || m.key === "cuello"
            ? diff <= 0
            : diff >= 0;
          return (
            <div
              key={m.key}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                {m.label}
              </p>
              <p className="mt-1 text-lg font-black">
                {m.current} {m.unit}
              </p>
              <p
                className={`mt-0.5 text-xs font-bold ${good ? "text-[#65ff4f]" : "text-amber-300"}`}
              >
                {diff > 0 ? "+" : ""}
                {diff} {m.unit} vs inicio
              </p>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

/* 16. Métricas corporales (calculadas) */
function BodyMetricsCard({ metrics }: { metrics: BodyMetrics }) {
  const tiles = [
    { label: "IMC", value: `${metrics.imc}`, sub: metrics.imcLabel },
    { label: "Peso ideal", value: `${metrics.idealWeight} kg`, sub: "IMC 22" },
    { label: "Peso restante", value: `${metrics.remainingKg} kg`, sub: "hasta meta" },
    { label: "Calorías", value: `${metrics.calories}`, sub: "kcal/día" },
    { label: "Agua", value: `${metrics.water} L`, sub: "al día" },
    { label: "Proteína", value: `${metrics.protein} g`, sub: "diaria" },
    { label: "Carbohidratos", value: `${metrics.carbs} g`, sub: "diarios" },
    { label: "Grasas", value: `${metrics.fat} g`, sub: "diarias" },
  ];
  return (
    <SectionCard title="Métricas corporales" eyebrow="Cálculo" icon={Flame}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
        {tiles.map((t) => (
          <div
            key={t.label}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
              {t.label}
            </p>
            <p className="mt-1 text-lg font-black text-[#65ff4f]">{t.value}</p>
            <p className="text-[11px] text-zinc-500">{t.sub}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

/* 6. Cumplimiento general */
function Compliance({ data }: { data: ComplianceData }) {
  const rows: { label: string; value: number; icon: ComponentType<LucideProps> }[] = [
    { label: "Entrenamiento", value: data.training, icon: Dumbbell },
    { label: "Nutrición", value: data.nutrition, icon: Salad },
    { label: "Agua", value: data.water, icon: GlassWater },
    { label: "Sueño", value: data.sleep, icon: Moon },
  ];
  return (
    <SectionCard title="Cumplimiento general" eyebrow="Hábitos" icon={Activity}>
      <div className="space-y-4">
        {rows.map((r) => {
          const Icon = r.icon;
          return (
            <div key={r.label}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-zinc-300">
                  <Icon size={15} className="text-[#65ff4f]" />
                  {r.label}
                </span>
                <span className="font-black">{r.value}%</span>
              </div>
              <Bar value={r.value} />
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

/* 3 / 14. Checklist genérico (objetivos / recordatorios) */
function Checklist({
  title,
  eyebrow,
  icon,
  state,
  onToggle,
}: {
  title: string;
  eyebrow: string;
  icon: ComponentType<LucideProps>;
  state: ChecklistState;
  onToggle: (key: string, done: boolean) => void;
}) {
  return (
    <SectionCard
      title={title}
      eyebrow={eyebrow}
      icon={icon}
      action={
        <span className="text-sm font-black text-[#65ff4f]">
          {state.percent}%
        </span>
      }
    >
      <div className="mb-4">
        <Bar value={state.percent} />
      </div>
      <ul className="space-y-2">
        {state.items.map((item) => (
          <li key={item.key}>
            <button
              type="button"
              onClick={() => onToggle(item.key, !item.done)}
              className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition hover:border-[#65ff4f]/30"
            >
              {item.done ? (
                <CheckCircle2 className="shrink-0 text-[#65ff4f]" size={20} />
              ) : (
                <Circle className="shrink-0 text-zinc-600" size={20} />
              )}
              <span
                className={`text-sm font-semibold ${item.done ? "text-zinc-400 line-through" : "text-zinc-200"}`}
              >
                {item.label}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

/* 11. Nutrición */
function Nutrition({
  state,
  onToggle,
}: {
  state: NutritionState;
  onToggle: (key: string, done: boolean) => void;
}) {
  return (
    <SectionCard
      title="Plan alimenticio"
      eyebrow="Nutrición"
      icon={Utensils}
      action={<span className="text-sm font-black text-[#65ff4f]">{state.percent}%</span>}
    >
      <div className="mb-4">
        <Bar value={state.percent} />
      </div>
      <ul className="space-y-2">
        {state.meals.map((meal) => (
          <li key={meal.key}>
            <button
              type="button"
              onClick={() => onToggle(meal.key, !meal.done)}
              className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition hover:border-[#65ff4f]/30"
            >
              {meal.done ? (
                <CheckCircle2 className="shrink-0 text-[#65ff4f]" size={20} />
              ) : (
                <Circle className="shrink-0 text-zinc-600" size={20} />
              )}
              <span className="min-w-0">
                <span
                  className={`block text-sm font-bold ${meal.done ? "text-zinc-400 line-through" : "text-white"}`}
                >
                  {meal.label}
                </span>
                <span className="block text-xs text-zinc-500">{meal.items}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

/* 4. Calendario de entrenamiento */
function TrainingCalendar() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const monthName = today.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7; // lunes = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function status(day: number): "trained" | "full" | "pending" {
    if (day > today.getDate()) return "pending";
    if (day % 9 === 0) return "full";
    if (day % 3 === 0 || day % 4 === 0) return "trained";
    return "pending";
  }

  return (
    <SectionCard title="Calendario de entrenamiento" eyebrow="Mes" icon={CalendarDays}>
      <p className="mb-3 text-sm font-bold capitalize text-zinc-300">{monthName}</p>
      <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] text-zinc-500">
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
          <span key={i} className="py-1 font-bold">
            {d}
          </span>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <span key={`e-${i}`} />;
          const s = status(day);
          const isToday = day === today.getDate();
          return (
            <div
              key={day}
              className={`flex aspect-square flex-col items-center justify-center rounded-lg border text-xs ${
                isToday
                  ? "border-[#65ff4f] text-white"
                  : "border-white/10 text-zinc-400"
              } ${s === "trained" ? "bg-[#65ff4f]/10" : s === "full" ? "bg-[#65ff4f]/20" : "bg-white/[0.02]"}`}
            >
              <span className="font-bold">{day}</span>
              <span className="leading-none">
                {s === "full" ? (
                  <Star size={10} className="text-[#65ff4f]" fill="#65ff4f" />
                ) : s === "trained" ? (
                  <CheckCircle2 size={10} className="text-[#65ff4f]" />
                ) : (
                  <Circle size={9} className="text-zinc-600" />
                )}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1">
          <CheckCircle2 size={12} className="text-[#65ff4f]" /> Entrenado
        </span>
        <span className="flex items-center gap-1">
          <Star size={12} className="text-[#65ff4f]" /> 100%
        </span>
        <span className="flex items-center gap-1">
          <Circle size={11} className="text-zinc-600" /> Pendiente
        </span>
      </div>
    </SectionCard>
  );
}

/* 10. Rutina del día */
function TodayRoutineCard({ routine }: { routine: TodayRoutine }) {
  return (
    <SectionCard title="Rutina del día" eyebrow="Hoy" icon={Dumbbell}>
      <p className="text-2xl font-black">{routine.name}</p>
      <p className="mt-1 text-sm text-zinc-400">{routine.focus}</p>
      <div className="mt-5 grid grid-cols-3 gap-3">
        <Tile label="Duración" value={routine.duration} />
        <Tile label="Calorías" value={routine.calories} />
        <Tile label="Nivel" value={routine.level} />
      </div>
      <button
        type="button"
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#65ff4f] px-5 text-sm font-black uppercase tracking-wide text-black transition hover:bg-[#85ff73]"
      >
        <Play size={18} />
        Iniciar entrenamiento
      </button>
    </SectionCard>
  );
}

/* 15. Comparador Antes / Después */
function BeforeAfter({ before, after }: { before: string; after: string }) {
  const [pos, setPos] = useState(50);
  return (
    <SectionCard title="Antes / Después" eyebrow="Comparador" icon={Sparkles}>
      <div className="relative mx-auto aspect-[3/4] max-w-sm overflow-hidden rounded-2xl">
        <div className="transformation-tile absolute inset-0">
          <DemoImg src={before} label="Antes" textTone="text-zinc-300" />
        </div>
        <div
          className="transformation-tile transformation-tile-after absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        >
          <DemoImg src={after} label="Después" textTone="text-black" />
        </div>
        <div
          className="absolute inset-y-0 w-0.5 bg-[#65ff4f]"
          style={{ left: `${pos}%` }}
        />
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Comparar antes y después"
        className="mt-4 w-full accent-[#65ff4f]"
      />
    </SectionCard>
  );
}

function DemoImg({
  src,
  label,
  textTone,
}: {
  src: string;
  label: string;
  textTone: string;
}) {
  const [ok, setOk] = useState(Boolean(src));
  return (
    <div className="relative h-full w-full">
      {ok && src ? (
        <Image
          src={src}
          alt={label}
          fill
          sizes="384px"
          className="object-cover"
          onError={() => setOk(false)}
        />
      ) : null}
      <span
        className={`absolute left-3 top-3 rounded-md bg-black/40 px-2 py-1 text-xs font-bold uppercase tracking-wide backdrop-blur ${ok && src ? "text-white" : textTone}`}
      >
        {label}
      </span>
    </div>
  );
}

/* 1. Galería de progreso / Mi transformación */
function ProgressGallery({
  photos,
  onAdd,
}: {
  photos: ProgressPhoto[];
  onAdd: (photo: {
    date: string;
    front: string;
    side: string;
    back: string;
    note: string;
  }) => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!date) return;
    setSaving(true);
    await onAdd({ date, front: "", side: "", back: "", note });
    setSaving(false);
    setOpen(false);
    setDate("");
    setNote("");
  }

  return (
    <SectionCard
      title="Mi transformación"
      eyebrow="Galería de progreso"
      icon={ImageIcon}
      action={
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#65ff4f] px-4 py-2 text-xs font-black uppercase tracking-wide text-black transition hover:bg-[#85ff73]"
        >
          <Plus size={16} />
          Agregar
        </button>
      }
    >
      {open ? (
        <div className="mb-6 rounded-xl border border-[#65ff4f]/20 bg-white/[0.03] p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-bold text-zinc-200">
              Fecha
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black/35 px-3 text-white outline-none focus:border-[#65ff4f]"
              />
            </label>
            <label className="block text-sm font-bold text-zinc-200">
              Nota (opcional)
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Cómo te sentiste..."
                className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black/35 px-3 text-white outline-none placeholder:text-zinc-600 focus:border-[#65ff4f]"
              />
            </label>
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            Las fotos (frente, perfil, espalda) se podrán subir al conectar el
            almacenamiento. Por ahora se guarda el registro con su fecha y nota.
          </p>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              disabled={saving || !date}
              onClick={submit}
              className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#65ff4f] px-5 text-sm font-black uppercase tracking-wide text-black transition hover:bg-[#85ff73] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar registro"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-white/15 px-5 text-sm font-bold text-zinc-300"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : null}

      {photos.length === 0 ? (
        <p className="text-sm text-zinc-400">
          Aún no tienes registros. Agrega tu primer progreso.
        </p>
      ) : (
        <div className="space-y-6">
          {photos.map((photo) => (
            <div key={photo.id} className="relative pl-6">
              <span className="absolute left-0 top-2 h-3 w-3 rounded-full bg-[#65ff4f]" />
              <span className="absolute left-[5px] top-5 h-[calc(100%-1rem)] w-px bg-white/10" />
              <p className="text-sm font-black text-[#65ff4f]">
                {formatDate(photo.date)}
              </p>
              {photo.note ? (
                <p className="mt-1 text-sm text-zinc-400">{photo.note}</p>
              ) : null}
              <div className="mt-3 grid grid-cols-3 gap-3">
                <MediaImg src={photo.front} alt="Frente" />
                <MediaImg src={photo.side} alt="Perfil" />
                <MediaImg src={photo.back} alt="Espalda" />
              </div>
              <div className="mt-1 grid grid-cols-3 gap-3 text-center text-[11px] text-zinc-500">
                <span>Frente</span>
                <span>Perfil</span>
                <span>Espalda</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

/* 7. Sistema de logros */
function Achievements({ items }: { items: Achievement[] }) {
  return (
    <SectionCard title="Logros" eyebrow="Insignias" icon={Award}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((a) => (
          <div
            key={a.key}
            className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center ${
              a.unlocked
                ? "border-[#65ff4f]/30 bg-[#65ff4f]/[0.06]"
                : "border-white/10 bg-white/[0.02] opacity-60"
            }`}
          >
            {a.unlocked ? (
              <Trophy className="text-[#65ff4f]" size={26} />
            ) : (
              <Lock className="text-zinc-600" size={24} />
            )}
            <span
              className={`text-xs font-bold ${a.unlocked ? "text-zinc-200" : "text-zinc-500"}`}
            >
              {a.label}
            </span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

/* 9. Historial del alumno */
function Timeline({ events }: { events: HistoryEvent[] }) {
  return (
    <SectionCard title="Historial" eyebrow="Tu camino" icon={History}>
      <ul className="space-y-4">
        {events.map((e, i) => (
          <li key={`${e.date}-${i}`} className="relative pl-6">
            {i < events.length - 1 ? (
              <span className="absolute left-[5px] top-4 h-[calc(100%+0.5rem)] w-px bg-white/10" />
            ) : null}
            <span
              className={`absolute left-0 top-1.5 h-3 w-3 rounded-full ${e.done ? "bg-[#65ff4f]" : "border border-zinc-600 bg-transparent"}`}
            />
            <p className="text-sm font-bold text-zinc-200">{e.label}</p>
            <p className="text-xs text-zinc-500">{formatDate(e.date)}</p>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

/* 12. Chat con el coach */
function CoachChat({ initial }: { initial: ChatMessage[] }) {
  const [messages, setMessages] = useState<ChatMessage[]>(initial);
  const [text, setText] = useState("");

  function send() {
    const trimmed = text.trim();
    if (!trimmed) return;
    const time = new Date().toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setMessages((prev) => [...prev, { from: "alumno", text: trimmed, time }]);
    setText("");
  }

  return (
    <SectionCard title="Chat con tu coach" eyebrow="Mensajes" icon={Send}>
      <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.from === "alumno" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                m.from === "alumno"
                  ? "bg-[#65ff4f] text-black"
                  : "border border-white/10 bg-white/[0.04] text-zinc-200"
              }`}
            >
              <p>{m.text}</p>
              <p
                className={`mt-1 text-[10px] ${m.from === "alumno" ? "text-black/60" : "text-zinc-500"}`}
              >
                {m.time}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          placeholder="Escribe un mensaje..."
          className="h-11 flex-1 rounded-lg border border-white/10 bg-black/35 px-3 text-white outline-none placeholder:text-zinc-600 focus:border-[#65ff4f]"
        />
        <button
          type="button"
          onClick={send}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-[#65ff4f] px-4 text-black transition hover:bg-[#85ff73]"
        >
          <Send size={18} />
        </button>
      </div>
    </SectionCard>
  );
}

/* 13. Recursos */
function Resources({ items }: { items: Resource[] }) {
  return (
    <SectionCard title="Recursos" eyebrow="Biblioteca" icon={Folder}>
      <ul className="space-y-2">
        {items.map((r) => (
          <li
            key={r.key}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3"
          >
            <span className="inline-flex rounded-lg border border-[#65ff4f]/20 bg-[#65ff4f]/10 px-2 py-1 text-[11px] font-black uppercase text-[#65ff4f]">
              {r.type}
            </span>
            <span className="text-sm font-semibold text-zinc-200">{r.label}</span>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

/* Tile reutilizable */
function Tile({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
      <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p
        className={`mt-1 text-base font-black ${highlight ? "text-[#65ff4f]" : "text-white"}`}
      >
        {value}
      </p>
    </div>
  );
}
