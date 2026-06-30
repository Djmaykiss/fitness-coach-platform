"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  ClipboardList,
  Droplet,
  Flame,
  Salad,
  Target,
  Utensils,
} from "lucide-react";
import { nutritionService } from "@/services/nutrition.service";
import type { AssignedNutrition, NutritionPlanDay } from "@/types";

/**
 * Plan nutricional asignado al alumno: macros diarios, agua recomendada, comidas
 * del día y todos los días, con checklist para marcar comidas completadas. El
 * progreso se persiste en localStorage vía `nutritionService`.
 */
export function NutritionPlanView({ userId }: { userId: string }) {
  const [data, setData] = useState<AssignedNutrition | null>(null);
  const [loaded, setLoaded] = useState(false);

  function load() {
    return nutritionService.getAssignedForUser(userId).then((result) => {
      setData(result);
      setLoaded(true);
    });
  }

  useEffect(() => {
    let active = true;
    nutritionService.getAssignedForUser(userId).then((result) => {
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
          <Salad className="text-[#65ff4f]" size={22} />
          <h2 className="text-2xl font-black">Mi plan de nutrición</h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Aún no tienes un plan nutricional asignado. Tu coach lo configurará pronto.
        </p>
      </section>
    );
  }

  const { plan, completedMealIds } = data;
  const completed = new Set(completedMealIds);
  const dayDone = (d: NutritionPlanDay) =>
    d.meals.length > 0 && d.meals.every((m) => completed.has(m.id));
  const focusDay = plan.days.find((d) => !dayDone(d)) ?? plan.days[0] ?? null;

  async function toggleMeal(mealId: string, done: boolean) {
    await nutritionService.toggleMealForUser(userId, mealId, done);
    await load();
  }

  const macros = [
    { label: "Calorías", value: plan.calories, icon: Flame },
    { label: "Proteínas", value: plan.protein, icon: Target },
    { label: "Carbohidratos", value: plan.carbs, icon: Utensils },
    { label: "Grasas", value: plan.fat, icon: Salad },
  ];

  return (
    <section className="mt-6 space-y-6">
      <div className="flex items-center gap-3">
        <Salad className="text-[#65ff4f]" size={22} />
        <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
          Mi plan de nutrición
        </h2>
      </div>

      <div className="premium-card rounded-2xl p-6">
        <h3 className="text-2xl font-black">{plan.name}</h3>
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
          <Chip icon={<Target size={13} />}>{plan.objective || "—"}</Chip>
          <Chip icon={<CalendarDays size={13} />}>{plan.days.length} días</Chip>
        </div>

        {/* Macros diarios */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {macros.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.label}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
              >
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-zinc-500">
                  <Icon size={13} className="text-[#65ff4f]" />
                  {m.label}
                </p>
                <p className="mt-1 text-lg font-black text-white">
                  {m.value || "—"}
                </p>
              </div>
            );
          })}
        </div>

        {/* Agua recomendada */}
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-[#65ff4f]/20 bg-[#65ff4f]/[0.05] p-4">
          <Droplet className="shrink-0 text-[#65ff4f]" size={20} />
          <p className="text-sm text-zinc-200">
            <span className="font-bold">Agua recomendada:</span>{" "}
            {plan.water || "—"}
          </p>
        </div>

        {plan.notes ? (
          <div className="mt-3 flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <ClipboardList className="mt-0.5 shrink-0 text-[#65ff4f]" size={18} />
            <p className="text-sm leading-6 text-zinc-300">{plan.notes}</p>
          </div>
        ) : null}
      </div>

      {/* Comidas de hoy */}
      {focusDay ? (
        <div className="premium-card rounded-2xl border border-[#65ff4f]/30 p-6">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#65ff4f]">
            <Flame size={16} />
            Comidas de hoy
          </div>
          <DayBlock
            day={focusDay}
            completed={completed}
            highlight
            onToggleMeal={toggleMeal}
          />
        </div>
      ) : (
        <p className="text-sm text-zinc-400">
          Este plan aún no tiene días configurados.
        </p>
      )}

      {/* Todos los días */}
      {plan.days.length > 0 ? (
        <div className="premium-card rounded-2xl p-6">
          <h3 className="text-lg font-black">Días del plan</h3>
          <div className="mt-4 space-y-4">
            {plan.days.map((day) => (
              <DayBlock
                key={day.id}
                day={day}
                completed={completed}
                onToggleMeal={toggleMeal}
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
  completed,
  highlight = false,
  onToggleMeal,
}: {
  day: NutritionPlanDay;
  completed: Set<string>;
  highlight?: boolean;
  onToggleMeal: (mealId: string, done: boolean) => void;
}) {
  const doneCount = day.meals.filter((m) => completed.has(m.id)).length;
  const allDone = day.meals.length > 0 && doneCount === day.meals.length;

  return (
    <div
      className={`rounded-xl border border-white/10 p-4 ${
        highlight ? "mt-4 bg-white/[0.02]" : "bg-white/[0.03]"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-black">
          <Salad size={16} className="text-[#65ff4f]" />
          {day.name}
        </p>
        <span
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-black uppercase tracking-wide ${
            allDone
              ? "bg-[#65ff4f]/10 text-[#65ff4f]"
              : "bg-white/[0.05] text-zinc-400"
          }`}
        >
          {allDone ? <CheckCircle2 size={14} /> : null}
          {doneCount}/{day.meals.length} comidas
        </span>
      </div>

      {day.meals.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {day.meals.map((meal) => {
            const checked = completed.has(meal.id);
            return (
              <li key={meal.id}>
                <button
                  type="button"
                  onClick={() => onToggleMeal(meal.id, !checked)}
                  className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition ${
                    checked
                      ? "border-[#65ff4f]/40 bg-[#65ff4f]/[0.06]"
                      : "border-white/10 bg-white/[0.03] hover:border-[#65ff4f]/30"
                  }`}
                >
                  {checked ? (
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#65ff4f]" />
                  ) : (
                    <Circle size={18} className="mt-0.5 shrink-0 text-zinc-600" />
                  )}
                  <span className="min-w-0">
                    <span
                      className={`block font-bold ${checked ? "text-[#65ff4f]" : "text-white"}`}
                    >
                      {meal.name}
                    </span>
                    {meal.description ? (
                      <span className="block text-sm text-zinc-400">
                        {meal.description}
                      </span>
                    ) : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-zinc-500">Sin comidas en este día.</p>
      )}

      {allDone ? (
        <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-black text-[#65ff4f]">
          <CheckCircle2 size={16} />
          Día completado
        </p>
      ) : null}
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
