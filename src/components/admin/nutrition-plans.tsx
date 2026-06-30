"use client";

import { useEffect, useState } from "react";
import {
  CalendarPlus,
  Droplet,
  Flame,
  Pencil,
  Plus,
  Salad,
  Target,
  Trash2,
  UserCheck,
  Utensils,
} from "lucide-react";
import { nutritionService } from "@/services/nutrition.service";
import { adminDashboardService } from "@/services/dashboard.service";
import type {
  AdminClientRow,
  CreateNutritionPlanInput,
  NutritionPlan,
} from "@/types";

const OBJECTIVES = [
  "Perder grasa",
  "Ganar músculo",
  "Recomposición corporal",
  "Mantenimiento",
  "Rendimiento deportivo",
];

const primaryBtn =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-[#85ff73] to-[#65ff4f] px-5 text-sm font-black uppercase tracking-wide text-black shadow-[0_8px_30px_-8px_rgba(101,255,79,0.5)] transition duration-300 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0";
const secondaryBtn =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 px-5 text-sm font-bold text-zinc-300 transition duration-300 hover:border-[#65ff4f]/50 hover:bg-[#65ff4f]/5 hover:text-[#65ff4f]";
const dangerBtn =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-red-500/40 px-5 text-sm font-bold text-red-400 transition duration-300 hover:border-red-500/70 hover:bg-red-500/5 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60";
const rowBtn =
  "inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-bold text-zinc-300 transition hover:border-[#65ff4f]/50 hover:text-[#65ff4f]";
const rowBtnDanger =
  "inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-bold text-red-400 transition hover:border-red-500/60 hover:text-red-300";
const inputClass =
  "mt-2 w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-white outline-none transition duration-300 placeholder:text-zinc-600 hover:border-white/20 focus:border-[#65ff4f] focus:bg-black/50 focus:shadow-[0_0_0_3px_rgba(101,255,79,0.12)]";

type Panel =
  | { kind: "create" }
  | { kind: "edit"; plan: NutritionPlan }
  | { kind: "build"; planId: string }
  | { kind: "assign"; plan: NutritionPlan }
  | { kind: "delete"; plan: NutritionPlan }
  | null;

export function NutritionPlansManager() {
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [clients, setClients] = useState<AdminClientRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);

  async function load() {
    const [p, c] = await Promise.all([
      nutritionService.getPlans(),
      adminDashboardService.getClientRows(),
    ]);
    setPlans(p);
    setClients(c);
    setLoaded(true);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const building =
    panel?.kind === "build"
      ? plans.find((p) => p.id === panel.planId) ?? null
      : null;

  return (
    <section className="premium-card mt-6 overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 p-6">
        <h2 className="text-2xl font-black">Planes de nutrición</h2>
        <button
          type="button"
          onClick={() => setPanel({ kind: "create" })}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-b from-[#85ff73] to-[#65ff4f] px-4 py-2 text-xs font-black uppercase tracking-wide text-black shadow-[0_6px_22px_-8px_rgba(101,255,79,0.5)] transition duration-300 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.98]"
        >
          <Plus size={16} />
          Nuevo plan
        </button>
      </div>

      <div className="p-6">
        {panel ? (
          <div className="mb-6 rounded-2xl border border-[#65ff4f]/20 bg-white/[0.02] p-5">
            {panel.kind === "create" ? (
              <PlanForm
                title="Nuevo plan nutricional"
                onCancel={() => setPanel(null)}
                onSubmit={async (values) => {
                  await nutritionService.createPlan(values);
                  setPanel(null);
                  await load();
                }}
              />
            ) : null}
            {panel.kind === "edit" ? (
              <PlanForm
                title={`Editar: ${panel.plan.name}`}
                initial={panel.plan}
                onCancel={() => setPanel(null)}
                onSubmit={async (values) => {
                  await nutritionService.updatePlan(panel.plan.id, values);
                  setPanel(null);
                  await load();
                }}
              />
            ) : null}
            {panel.kind === "assign" ? (
              <AssignForm
                plan={panel.plan}
                clients={clients}
                onCancel={() => setPanel(null)}
                onAssign={async (clientId) => {
                  await nutritionService.assignToClient(clientId, panel.plan.id);
                  setPanel(null);
                  await load();
                }}
              />
            ) : null}
            {panel.kind === "delete" ? (
              <DeleteConfirm
                plan={panel.plan}
                onCancel={() => setPanel(null)}
                onConfirm={async () => {
                  await nutritionService.deletePlan(panel.plan.id);
                  setPanel(null);
                  await load();
                }}
              />
            ) : null}
            {panel.kind === "build" && building ? (
              <PlanBuilder
                plan={building}
                onClose={() => setPanel(null)}
                onChange={load}
              />
            ) : null}
          </div>
        ) : null}

        {!loaded ? (
          <p className="text-sm text-zinc-400">Cargando planes...</p>
        ) : plans.length === 0 ? (
          <p className="text-sm text-zinc-400">
            Aún no hay planes nutricionales. Crea el primero.
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {plans.map((plan) => (
              <article
                key={plan.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <h3 className="text-xl font-black">{plan.name}</h3>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                  <Chip icon={<Target size={13} />}>{plan.objective || "—"}</Chip>
                  <Chip icon={<Flame size={13} />}>{plan.calories || "—"}</Chip>
                  <Chip icon={<Droplet size={13} />}>{plan.water || "—"}</Chip>
                  <Chip icon={<CalendarPlus size={13} />}>
                    {plan.days.length} días
                  </Chip>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-400">
                  <span>P {plan.protein || "—"}</span>
                  <span>C {plan.carbs || "—"}</span>
                  <span>G {plan.fat || "—"}</span>
                </div>
                {plan.notes ? (
                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    {plan.notes}
                  </p>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" className={rowBtn} onClick={() => setPanel({ kind: "build", planId: plan.id })}>
                    <Utensils size={14} />
                    Días y comidas
                  </button>
                  <button type="button" className={rowBtn} onClick={() => setPanel({ kind: "assign", plan })}>
                    <UserCheck size={14} />
                    Asignar
                  </button>
                  <button type="button" className={rowBtn} onClick={() => setPanel({ kind: "edit", plan })}>
                    <Pencil size={14} />
                    Editar
                  </button>
                  <button type="button" className={rowBtnDanger} onClick={() => setPanel({ kind: "delete", plan })}>
                    <Trash2 size={14} />
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
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

function PlanForm({
  title,
  initial,
  onSubmit,
  onCancel,
}: {
  title: string;
  initial?: NutritionPlan;
  onSubmit: (values: CreateNutritionPlanInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [v, setV] = useState<CreateNutritionPlanInput>({
    name: initial?.name ?? "",
    objective: initial?.objective ?? OBJECTIVES[0],
    calories: initial?.calories ?? "",
    protein: initial?.protein ?? "",
    carbs: initial?.carbs ?? "",
    fat: initial?.fat ?? "",
    water: initial?.water ?? "",
    notes: initial?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof CreateNutritionPlanInput>(
    key: K,
    value: CreateNutritionPlanInput[K],
  ) => setV((prev) => ({ ...prev, [key]: value }));

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!v.name.trim()) return;
        setSaving(true);
        await onSubmit(v);
      }}
    >
      <h3 className="mb-4 text-lg font-black">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <Text label="Nombre del plan" value={v.name} onChange={(x) => set("name", x)} placeholder="Ej: Recomposición 2200 kcal" required />
        <label className="block text-sm font-bold text-zinc-200">
          Objetivo
          <select value={v.objective} onChange={(e) => set("objective", e.target.value)} className={inputClass}>
            {OBJECTIVES.map((o) => (
              <option key={o} value={o} className="bg-[#0a0d0b]">{o}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="mb-3 mt-5 text-xs font-black uppercase tracking-[0.2em] text-[#65ff4f]">
        Objetivo diario
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <Text label="Calorías" value={v.calories} onChange={(x) => set("calories", x)} placeholder="Ej: 2200 kcal" />
        <Text label="Proteínas" value={v.protein} onChange={(x) => set("protein", x)} placeholder="Ej: 170 g" />
        <Text label="Carbohidratos" value={v.carbs} onChange={(x) => set("carbs", x)} placeholder="Ej: 210 g" />
        <Text label="Grasas" value={v.fat} onChange={(x) => set("fat", x)} placeholder="Ej: 60 g" />
        <Text label="Agua recomendada" value={v.water} onChange={(x) => set("water", x)} placeholder="Ej: 3 L" />
      </div>
      <label className="mt-4 block text-sm font-bold text-zinc-200">
        Notas del coach
        <textarea rows={2} value={v.notes} onChange={(e) => set("notes", e.target.value)} className={inputClass} placeholder="Indicaciones generales del plan" />
      </label>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="submit" disabled={saving} className={primaryBtn}>
          {saving ? "Guardando..." : "Guardar plan"}
        </button>
        <button type="button" onClick={onCancel} className={secondaryBtn}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

function PlanBuilder({
  plan,
  onClose,
  onChange,
}: {
  plan: NutritionPlan;
  onClose: () => void;
  onChange: () => Promise<void>;
}) {
  const [dayName, setDayName] = useState("");

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="text-lg font-black">
          Días y comidas: <span className="text-[#65ff4f]">{plan.name}</span>
        </h3>
        <button type="button" onClick={onClose} className="text-sm font-bold text-zinc-500 hover:text-[#65ff4f]">
          Cerrar
        </button>
      </div>

      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!dayName.trim()) return;
          await nutritionService.addDay(plan.id, dayName);
          setDayName("");
          await onChange();
        }}
      >
        <div className="min-w-[220px] flex-1">
          <label className="block text-sm font-bold text-zinc-200">
            Nuevo día del plan
            <input className={inputClass} value={dayName} onChange={(e) => setDayName(e.target.value)} placeholder="Ej: Día estándar" />
          </label>
        </div>
        <button type="submit" className={secondaryBtn}>
          <CalendarPlus size={16} />
          Agregar día
        </button>
      </form>

      {plan.days.length === 0 ? (
        <p className="mt-5 text-sm text-zinc-400">
          Aún no hay días. Agrega el primero para añadir comidas.
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          {plan.days.map((day) => (
            <DayCard key={day.id} planId={plan.id} day={day} onChange={onChange} />
          ))}
        </div>
      )}
    </div>
  );
}

function DayCard({
  planId,
  day,
  onChange,
}: {
  planId: string;
  day: NutritionPlan["days"][number];
  onChange: () => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-black">
          <Salad size={16} className="text-[#65ff4f]" />
          {day.name}
        </p>
        <button
          type="button"
          className={rowBtnDanger}
          onClick={async () => {
            await nutritionService.deleteDay(planId, day.id);
            await onChange();
          }}
        >
          <Trash2 size={14} />
          Quitar día
        </button>
      </div>

      {day.meals.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {day.meals.map((meal) => (
            <li
              key={meal.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3"
            >
              <div className="min-w-0">
                <p className="font-bold text-white">{meal.name}</p>
                {meal.description ? (
                  <p className="text-sm text-zinc-400">{meal.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                className="shrink-0 text-zinc-500 transition hover:text-red-400"
                aria-label="Quitar comida"
                onClick={async () => {
                  await nutritionService.deleteMeal(planId, day.id, meal.id);
                  await onChange();
                }}
              >
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <form
        className="mt-3 grid gap-2 sm:grid-cols-[0.8fr_1.6fr_auto]"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!name.trim()) return;
          await nutritionService.addMeal(planId, day.id, { name, description });
          setName("");
          setDescription("");
          await onChange();
        }}
      >
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Comida (ej: Desayuno)" />
        <input className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Alimentos (ej: Avena, huevos y fruta)" />
        <button type="submit" className={`${secondaryBtn} mt-2`}>
          <Plus size={16} />
          Añadir
        </button>
      </form>
    </div>
  );
}

function AssignForm({
  plan,
  clients,
  onAssign,
  onCancel,
}: {
  plan: NutritionPlan;
  clients: AdminClientRow[];
  onAssign: (clientId: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [saving, setSaving] = useState(false);

  if (clients.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-zinc-400">
          No hay alumnos para asignar. Crea un alumno primero.
        </p>
        <button type="button" onClick={onCancel} className={secondaryBtn}>
          Cerrar
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!clientId) return;
        setSaving(true);
        await onAssign(clientId);
      }}
    >
      <h3 className="mb-4 text-lg font-black">
        Asignar <span className="text-[#65ff4f]">{plan.name}</span> a un alumno
      </h3>
      <label className="block text-sm font-bold text-zinc-200">
        Alumno
        <select value={clientId} onChange={(e) => setClientId(e.target.value)} className={inputClass}>
          {clients.map((c) => (
            <option key={c.id} value={c.id} className="bg-[#0a0d0b]">
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="submit" disabled={saving} className={primaryBtn}>
          <UserCheck size={16} />
          {saving ? "Asignando..." : "Asignar plan"}
        </button>
        <button type="button" onClick={onCancel} className={secondaryBtn}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

function DeleteConfirm({
  plan,
  onConfirm,
  onCancel,
}: {
  plan: NutritionPlan;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}) {
  const [saving, setSaving] = useState(false);
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-red-500/30 bg-red-500/[0.06] p-4 text-sm leading-6">
        <p className="font-bold text-white">¿Eliminar “{plan.name}”?</p>
        <p className="mt-1 text-zinc-400">
          Se borrará el plan con sus días y comidas. Los alumnos que lo tuvieran
          asignado dejarán de verlo. Esta acción no se puede deshacer.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={saving}
          className={dangerBtn}
          onClick={async () => {
            setSaving(true);
            await onConfirm();
          }}
        >
          <Trash2 size={16} />
          {saving ? "Eliminando..." : "Sí, eliminar plan"}
        </button>
        <button type="button" onClick={onCancel} className={secondaryBtn}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

function Text({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-bold text-zinc-200">
      {label}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={inputClass}
      />
    </label>
  );
}
