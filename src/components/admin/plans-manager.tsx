"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Crown,
  GripVertical,
  Pencil,
  Plus,
  Power,
  Trash2,
  X,
} from "lucide-react";
import { plansService } from "@/services/plans.service";
import { useToast } from "@/context/toast-context";
import type { CreatePlanInput, Plan } from "@/types";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#65ff4f] focus:bg-black/50 focus:shadow-[0_0_0_3px_rgba(101,255,79,0.12)]";
const rowBtn =
  "inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-2.5 py-1.5 text-[11px] font-bold text-zinc-300 transition hover:border-[#65ff4f]/50 hover:text-[#65ff4f] disabled:cursor-not-allowed disabled:opacity-40";

const EMPTY: CreatePlanInput = {
  name: "",
  priceLabel: "",
  modality: "100% Online",
  idealFor: "",
  features: [],
  buttonLabel: "Comenzar",
  color: "#65ff4f",
  image: "",
  recommended: false,
  active: true,
};

/** Administración de planes comerciales (CRUD + activar + recomendado + reordenar). */
export function PlansManager() {
  const toast = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [editing, setEditing] = useState<Plan | "new" | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  async function load() {
    setPlans(await plansService.getPlans());
  }
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function move(from: number, to: number) {
    if (to < 0 || to >= plans.length || from === to) return;
    const ids = plans.map((p) => p.id);
    const [id] = ids.splice(from, 1);
    ids.splice(to, 0, id);
    // Optimista + persistir.
    setPlans((prev) => {
      const copy = [...prev];
      const [p] = copy.splice(from, 1);
      copy.splice(to, 0, p);
      return copy;
    });
    await plansService.reorder(ids);
    await load();
  }

  async function toggleActive(plan: Plan) {
    await plansService.setActive(plan.id, !plan.active);
    await load();
    toast.success(plan.active ? "Plan desactivado." : "Plan activado.");
  }
  async function recommend(plan: Plan) {
    await plansService.setRecommended(plan.id);
    await load();
    toast.success(`"${plan.name}" es ahora el recomendado.`);
  }
  async function remove(plan: Plan) {
    await plansService.deletePlan(plan.id);
    await load();
    toast.success("Plan eliminado.");
  }

  if (editing) {
    return (
      <PlanEditor
        plan={editing === "new" ? null : editing}
        onCancel={() => setEditing(null)}
        onSaved={async () => {
          setEditing(null);
          await load();
        }}
      />
    );
  }

  return (
    <section className="premium-card overflow-hidden rounded-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4 sm:p-5">
        <div className="min-w-0">
          <h2 className="text-xl font-black">Planes</h2>
          <p className="mt-1 hidden text-sm text-zinc-400 sm:block">
            Planes comerciales de la landing. Arrastra para reordenar.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-gradient-to-b from-[#85ff73] to-[#65ff4f] px-4 text-sm font-black uppercase tracking-wide text-black transition hover:brightness-110"
        >
          <Plus size={16} /> Nuevo plan
        </button>
      </div>

      <div className="space-y-3 p-4 sm:p-5">
        {plans.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">
            Aún no hay planes. Crea el primero con “Nuevo plan”.
          </p>
        ) : (
          plans.map((plan, i) => (
            <div
              key={plan.id}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null) move(dragIndex, i);
                setDragIndex(null);
              }}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 transition hover:border-white/20"
              style={{ borderLeft: `3px solid ${plan.color || "#65ff4f"}` }}
            >
              <span className="cursor-grab text-zinc-600" title="Arrastra para reordenar">
                <GripVertical size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-bold text-white">
                  {plan.name || "(sin nombre)"}
                  {plan.recommended ? (
                    <span className="inline-flex items-center gap-1 rounded bg-[#65ff4f]/15 px-1.5 py-0.5 text-[10px] font-black uppercase text-[#65ff4f]">
                      <Crown size={11} /> Recomendado
                    </span>
                  ) : null}
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-black uppercase ${
                      plan.active
                        ? "bg-emerald-400/15 text-emerald-300"
                        : "bg-zinc-500/15 text-zinc-400"
                    }`}
                  >
                    {plan.active ? "Activo" : "Inactivo"}
                  </span>
                </p>
                <p className="truncate text-xs text-zinc-500">
                  {plan.priceLabel || "Sin precio"} · {plan.features.length} beneficios
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className={rowBtn} title="Subir">
                  <ArrowUp size={13} />
                </button>
                <button type="button" onClick={() => move(i, i + 1)} disabled={i === plans.length - 1} className={rowBtn} title="Bajar">
                  <ArrowDown size={13} />
                </button>
                <button type="button" onClick={() => recommend(plan)} className={rowBtn} disabled={plan.recommended}>
                  <Crown size={13} /> Recomendar
                </button>
                <button type="button" onClick={() => toggleActive(plan)} className={rowBtn}>
                  <Power size={13} /> {plan.active ? "Desactivar" : "Activar"}
                </button>
                <button type="button" onClick={() => setEditing(plan)} className={rowBtn}>
                  <Pencil size={13} /> Editar
                </button>
                <button type="button" onClick={() => remove(plan)} className={`${rowBtn} hover:border-red-500/60 hover:text-red-400`}>
                  <Trash2 size={13} /> Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function PlanEditor({
  plan,
  onCancel,
  onSaved,
}: {
  plan: Plan | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const initial = useMemo<CreatePlanInput>(
    () =>
      plan
        ? {
            name: plan.name,
            priceLabel: plan.priceLabel,
            modality: plan.modality,
            idealFor: plan.idealFor,
            features: plan.features,
            buttonLabel: plan.buttonLabel,
            color: plan.color,
            image: plan.image,
            recommended: plan.recommended,
            active: plan.active,
          }
        : EMPTY,
    [plan],
  );

  const [form, setForm] = useState<CreatePlanInput>(initial);
  const [featuresText, setFeaturesText] = useState(initial.features.join("\n"));
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof CreatePlanInput>(k: K, v: CreatePlanInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    if (!form.name.trim()) {
      toast.error("El plan necesita un nombre.");
      return;
    }
    setSaving(true);
    const payload: CreatePlanInput = {
      ...form,
      features: featuresText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    if (plan) await plansService.updatePlan(plan.id, payload);
    else await plansService.createPlan(payload);
    toast.success(plan ? "Plan actualizado." : "Plan creado.");
    onSaved();
  }

  return (
    <section className="premium-card overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b border-white/10 p-4 sm:p-5">
        <h2 className="text-xl font-black">{plan ? "Editar plan" : "Nuevo plan"}</h2>
        <button type="button" onClick={onCancel} className={rowBtn}>
          <X size={13} /> Cancelar
        </button>
      </div>

      <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-2">
        <Field label="Nombre">
          <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="ENCIENDE" />
        </Field>
        <Field label="Precio (texto libre)">
          <input className={inputClass} value={form.priceLabel} onChange={(e) => set("priceLabel", e.target.value)} placeholder="$67–97/mes" />
        </Field>
        <Field label="Modalidad">
          <input className={inputClass} value={form.modality} onChange={(e) => set("modality", e.target.value)} placeholder="100% Online" />
        </Field>
        <Field label="Texto del botón">
          <input className={inputClass} value={form.buttonLabel} onChange={(e) => set("buttonLabel", e.target.value)} placeholder="Comenzar Ahora" />
        </Field>
        <Field label="Ideal para" className="md:col-span-2">
          <textarea rows={2} className={inputClass} value={form.idealFor} onChange={(e) => set("idealFor", e.target.value)} placeholder="Personas que quieren..." />
        </Field>
        <Field label="Beneficios (uno por línea)" className="md:col-span-2">
          <textarea rows={6} className={inputClass} value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} placeholder={"Programa de 4 semanas\nCheck-in semanal\n..."} />
        </Field>
        <Field label="Color de la tarjeta">
          <div className="flex items-center gap-3">
            <input type="color" value={form.color} onChange={(e) => set("color", e.target.value)} className="h-10 w-14 cursor-pointer rounded-lg border border-white/10 bg-black/35" />
            <input className={inputClass} value={form.color} onChange={(e) => set("color", e.target.value)} placeholder="#65ff4f" />
          </div>
        </Field>
        <Field label="Imagen (URL, opcional)">
          <input className={inputClass} value={form.image} onChange={(e) => set("image", e.target.value)} placeholder="https://..." />
        </Field>
        <div className="flex flex-wrap items-center gap-6 md:col-span-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-zinc-300">
            <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="h-4 w-4 accent-[#65ff4f]" />
            Activo (visible en la landing)
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-zinc-300">
            <input type="checkbox" checked={form.recommended} onChange={(e) => set("recommended", e.target.checked)} className="h-4 w-4 accent-[#65ff4f]" />
            Recomendado (destacado)
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-white/10 p-4 sm:p-5">
        <button type="button" onClick={onCancel} className={rowBtn}>
          Cancelar
        </button>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-gradient-to-b from-[#85ff73] to-[#65ff4f] px-5 text-sm font-black uppercase tracking-wide text-black transition hover:brightness-110 disabled:opacity-50"
        >
          <Check size={16} /> {plan ? "Guardar cambios" : "Crear plan"}
        </button>
      </div>
    </section>
  );
}

function Field({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-zinc-400">
        {label}
      </span>
      {children}
    </label>
  );
}
