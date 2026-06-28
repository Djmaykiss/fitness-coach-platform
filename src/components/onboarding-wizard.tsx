"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Dumbbell,
  Flame,
  HeartPulse,
  PersonStanding,
  Repeat,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import { onboardingService } from "@/services/onboarding.service";
import {
  AVAILABILITY_DAYS,
  BODY_TYPES,
  BREAD_OPTIONS,
  DAIRY_OPTIONS,
  LEVELS,
  NUTRITION_OPTIONS,
  OBJECTIVES,
  PLACES,
  RICE_OPTIONS,
  SEAFOOD_OPTIONS,
  SEXES,
  SLEEP_OPTIONS,
  YES_NO,
} from "@/data/onboarding";

const TOTAL_STEPS = 11;

const OBJECTIVE_ICONS: Record<string, ComponentType<LucideProps>> = {
  "Perder grasa": Flame,
  "Ganar músculo": Dumbbell,
  "Recomposición corporal": Repeat,
  Tonificar: Sparkles,
  "Mejorar condición física": HeartPulse,
  "Rendimiento deportivo": Trophy,
};

type WizardData = {
  name: string;
  email: string;
  phone: string;
  age: string;
  sex: string;
  weight: string;
  height: string;
  waist: string;
  bodyType: string;
  objective: string;
  level: string;
  place: string;
  availability: string;
  sleep: string;
  nutrition: string;
  // Datos personales extra
  address: string;
  // Antecedentes
  hypertension: string;
  hepatitis: string;
  surgeries: string;
  asthma: string;
  otherCondition: string;
  // Alimentacion
  sugar: string;
  sugarHabits: string;
  softDrinks: string;
  alcohol: string;
  chicken: string;
  redMeat: string;
  pork: string;
  seafood: string;
  dairy: string;
  fruits: string;
  vegetables: string;
  rice: string;
  groceries: string;
  breadType: string;
  pasta: string;
  artificialCondiments: string;
  foodAllergy: string;
  avoidFood: string;
};

const INITIAL: WizardData = {
  name: "",
  email: "",
  phone: "",
  age: "",
  sex: "",
  weight: "",
  height: "",
  waist: "",
  bodyType: "",
  objective: "",
  level: "",
  place: "",
  availability: "",
  sleep: "",
  nutrition: "",
  address: "",
  hypertension: "",
  hepatitis: "",
  surgeries: "",
  asthma: "",
  otherCondition: "",
  sugar: "",
  sugarHabits: "",
  softDrinks: "",
  alcohol: "",
  chicken: "",
  redMeat: "",
  pork: "",
  seafood: "",
  dairy: "",
  fruits: "",
  vegetables: "",
  rice: "",
  groceries: "",
  breadType: "",
  pasta: "",
  artificialCondiments: "",
  foodAllergy: "",
  avoidFood: "",
};

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(INITIAL);
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof WizardData>(key: K, value: WizardData[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const recommendation = useMemo(
    () => onboardingService.recommendPlan(data.objective),
    [data.objective],
  );

  const canContinue = ((): boolean => {
    switch (step) {
      case 1:
        return Boolean(
          data.name.trim() &&
            data.email.trim() &&
            data.phone.trim() &&
            data.age &&
            data.sex,
        );
      case 2:
        return Boolean(data.weight && data.height);
      case 3:
        return Boolean(data.bodyType);
      case 4:
        return Boolean(data.objective);
      case 5:
        return Boolean(data.level && data.place);
      case 6:
        return Boolean(data.availability);
      case 7:
        return Boolean(data.sleep && data.nutrition);
      default:
        return true;
    }
  })();

  async function submit() {
    setSubmitting(true);
    const evaluation = {
      objective: data.objective,
      age: data.age,
      sex: data.sex,
      weight: data.weight,
      height: data.height,
      waist: data.waist,
      bodyType:
        BODY_TYPES.find((b) => b.key === data.bodyType)?.label ?? data.bodyType,
      level: data.level,
      place: data.place,
      availability: data.availability,
      sleep: data.sleep,
      nutrition: data.nutrition,
      recommendedPlan: recommendation.plan,
      address: data.address,
      hypertension: data.hypertension,
      hepatitis: data.hepatitis,
      surgeries: data.surgeries,
      asthma: data.asthma,
      otherCondition: data.otherCondition,
      sugar: data.sugar,
      sugarHabits: data.sugarHabits,
      softDrinks: data.softDrinks,
      alcohol: data.alcohol,
      chicken: data.chicken,
      redMeat: data.redMeat,
      pork: data.pork,
      seafood: data.seafood,
      dairy: data.dairy,
      fruits: data.fruits,
      vegetables: data.vegetables,
      rice: data.rice,
      groceries: data.groceries,
      breadType: data.breadType,
      pasta: data.pasta,
      artificialCondiments: data.artificialCondiments,
      foodAllergy: data.foodAllergy,
      avoidFood: data.avoidFood,
    };
    // Guardar el lead con toda la evaluacion + dejar la evaluacion pendiente
    // para el registro, y redirigir a /register.
    await onboardingService.submitEvaluation({
      name: data.name,
      email: data.email,
      phone: data.phone,
      evaluation,
    });
    await onboardingService.savePending({
      name: data.name,
      email: data.email,
      evaluation,
    });
    router.push("/register");
  }

  return (
    <div className="premium-card mx-auto max-w-3xl rounded-3xl p-6 sm:p-8">
      {/* Barra de progreso */}
      <div>
        <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-zinc-500">
          <span>
            Paso {step} de {TOTAL_STEPS}
          </span>
          <span>{Math.round((step / TOTAL_STEPS) * 100)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[#65ff4f] transition-all duration-300"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      <div key={step} className="onboarding-step mt-8">
        <Step step={step} data={data} set={set} recommendation={recommendation} />
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/15 px-5 text-sm font-bold text-zinc-300 transition hover:border-[#65ff4f]/50 hover:text-[#65ff4f] ${
            step === 1 ? "invisible" : ""
          }`}
        >
          <ArrowLeft size={18} />
          Anterior
        </button>

        {step < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(TOTAL_STEPS, s + 1))}
            disabled={!canContinue}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#65ff4f] px-6 text-sm font-black uppercase tracking-wide text-black transition hover:bg-[#85ff73] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Siguiente
            <ArrowRight size={18} />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#65ff4f] px-6 text-sm font-black uppercase tracking-wide text-black transition hover:bg-[#85ff73] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Guardando..." : "Quiero comenzar"}
            <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- Pasos ---------- */

function Step({
  step,
  data,
  set,
  recommendation,
}: {
  step: number;
  data: WizardData;
  set: <K extends keyof WizardData>(key: K, value: WizardData[K]) => void;
  recommendation: { plan: string; weeks: string };
}) {
  if (step === 1) {
    return (
      <div>
        <StepHeader eyebrow="Paso 1" title="Cuéntanos sobre ti" />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Nombre"
            value={data.name}
            onChange={(v) => set("name", v)}
            placeholder="Tu nombre"
          />
          <TextField
            label="Email"
            type="email"
            value={data.email}
            onChange={(v) => set("email", v)}
            placeholder="tu@email.com"
          />
          <TextField
            label="Teléfono"
            type="tel"
            value={data.phone}
            onChange={(v) => set("phone", v)}
            placeholder="+1 555 0000"
          />
          <TextField
            label="Edad"
            type="number"
            value={data.age}
            onChange={(v) => set("age", v)}
            placeholder="Años"
          />
        </div>
        <p className="mt-5 text-sm font-bold text-zinc-200">Sexo</p>
        <Pills options={SEXES} value={data.sex} onChange={(v) => set("sex", v)} />
      </div>
    );
  }

  if (step === 2) {
    return (
      <div>
        <StepHeader eyebrow="Paso 2" title="Tu estado actual" />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Peso actual (kg)"
            type="number"
            value={data.weight}
            onChange={(v) => set("weight", v)}
            placeholder="Ej: 80"
          />
          <TextField
            label="Estatura (cm)"
            type="number"
            value={data.height}
            onChange={(v) => set("height", v)}
            placeholder="Ej: 175"
          />
        </div>
        <div className="mt-4 max-w-[calc(50%-0.5rem)] max-sm:max-w-full">
          <TextField
            label="Cintura (cm) — opcional"
            type="number"
            value={data.waist}
            onChange={(v) => set("waist", v)}
            placeholder="Ej: 85"
          />
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div>
        <StepHeader
          eyebrow="Paso 3"
          title="¿Qué cuerpo se parece más al tuyo?"
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {BODY_TYPES.map((body) => (
            <SelectCard
              key={body.key}
              selected={data.bodyType === body.key}
              onClick={() => set("bodyType", body.key)}
              media={
                <CardMedia
                  src={body.image}
                  fallback={<PersonStanding className="text-zinc-500" size={40} />}
                />
              }
              label={body.label}
            />
          ))}
        </div>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div>
        <StepHeader eyebrow="Paso 4" title="¿Qué quieres lograr?" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {OBJECTIVES.map((objective) => {
            const Icon = OBJECTIVE_ICONS[objective.label] ?? Target;
            return (
              <SelectCard
                key={objective.key}
                selected={data.objective === objective.label}
                onClick={() => set("objective", objective.label)}
                media={
                  <CardMedia
                    src={objective.image}
                    fallback={<Icon className="text-[#65ff4f]" size={36} />}
                  />
                }
                label={objective.label}
              />
            );
          })}
        </div>
      </div>
    );
  }

  if (step === 5) {
    return (
      <div>
        <StepHeader eyebrow="Paso 5" title="Tu experiencia" />
        <p className="text-sm font-bold text-zinc-200">Nivel</p>
        <Pills
          options={LEVELS}
          value={data.level}
          onChange={(v) => set("level", v)}
        />
        <p className="mt-6 text-sm font-bold text-zinc-200">¿Dónde entrenas?</p>
        <Pills
          options={PLACES}
          value={data.place}
          onChange={(v) => set("place", v)}
        />
      </div>
    );
  }

  if (step === 6) {
    return (
      <div>
        <StepHeader eyebrow="Paso 6" title="¿Cuántos días puedes entrenar?" />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {AVAILABILITY_DAYS.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => set("availability", day)}
              className={`flex h-16 items-center justify-center rounded-xl border text-xl font-black transition ${
                data.availability === day
                  ? "border-[#65ff4f] bg-[#65ff4f]/10 text-[#65ff4f]"
                  : "border-white/10 bg-white/[0.03] text-white hover:border-[#65ff4f]/40"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 7) {
    return (
      <div>
        <StepHeader eyebrow="Paso 7" title="Tus hábitos" />
        <p className="text-sm font-bold text-zinc-200">Horas de sueño</p>
        <Pills
          options={SLEEP_OPTIONS}
          value={data.sleep}
          onChange={(v) => set("sleep", v)}
        />
        <p className="mt-6 text-sm font-bold text-zinc-200">Alimentación</p>
        <Pills
          options={NUTRITION_OPTIONS}
          value={data.nutrition}
          onChange={(v) => set("nutrition", v)}
        />
      </div>
    );
  }

  if (step === 8) {
    return (
      <div>
        <StepHeader eyebrow="Paso 8" title="Datos y antecedentes" />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Dirección"
            value={data.address}
            onChange={(v) => set("address", v)}
            placeholder="Tu dirección"
          />
          <Question
            label="Hipertensión arterial"
            options={YES_NO}
            value={data.hypertension}
            onChange={(v) => set("hypertension", v)}
          />
          <Question
            label="Hepatitis"
            options={YES_NO}
            value={data.hepatitis}
            onChange={(v) => set("hepatitis", v)}
          />
          <Question
            label="Asmático"
            options={YES_NO}
            value={data.asthma}
            onChange={(v) => set("asthma", v)}
          />
          <TextField
            label="Cirugías previas (¿cuáles?)"
            value={data.surgeries}
            onChange={(v) => set("surgeries", v)}
            placeholder="Ninguna / detalle"
          />
          <TextField
            label="Otra condición a mencionar"
            value={data.otherCondition}
            onChange={(v) => set("otherCondition", v)}
            placeholder="Opcional"
          />
        </div>
        <p className="mt-4 text-xs text-zinc-500">
          Estas preguntas son opcionales: puedes continuar y completarlas con tu
          coach.
        </p>
      </div>
    );
  }

  if (step === 9) {
    return (
      <div>
        <StepHeader eyebrow="Paso 9" title="Alimentación (1/2)" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Question
            label="¿Consumes azúcar?"
            options={YES_NO}
            value={data.sugar}
            onChange={(v) => set("sugar", v)}
          />
          <TextField
            label="Hábitos con el azúcar"
            value={data.sugarHabits}
            onChange={(v) => set("sugarHabits", v)}
            placeholder="Ej: 2 cucharadas/día"
          />
          <Question
            label="¿Consumes refrescos?"
            options={YES_NO}
            value={data.softDrinks}
            onChange={(v) => set("softDrinks", v)}
          />
          <Question
            label="¿Bebidas alcohólicas?"
            options={YES_NO}
            value={data.alcohol}
            onChange={(v) => set("alcohol", v)}
          />
          <Question
            label="¿Consumes pollo?"
            options={YES_NO}
            value={data.chicken}
            onChange={(v) => set("chicken", v)}
          />
          <Question
            label="¿Carne roja?"
            options={YES_NO}
            value={data.redMeat}
            onChange={(v) => set("redMeat", v)}
          />
          <Question
            label="¿Carne de cerdo?"
            options={YES_NO}
            value={data.pork}
            onChange={(v) => set("pork", v)}
          />
          <Question
            label="Alimentos del mar"
            options={SEAFOOD_OPTIONS}
            value={data.seafood}
            onChange={(v) => set("seafood", v)}
          />
          <Question
            label="Productos lácteos"
            options={DAIRY_OPTIONS}
            value={data.dairy}
            onChange={(v) => set("dairy", v)}
          />
        </div>
      </div>
    );
  }

  if (step === 10) {
    return (
      <div>
        <StepHeader eyebrow="Paso 10" title="Alimentación (2/2)" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Question
            label="¿Consumes frutas?"
            options={YES_NO}
            value={data.fruits}
            onChange={(v) => set("fruits", v)}
          />
          <Question
            label="¿Consumes vegetales?"
            options={YES_NO}
            value={data.vegetables}
            onChange={(v) => set("vegetables", v)}
          />
          <Question
            label="¿Consumes arroz?"
            options={RICE_OPTIONS}
            value={data.rice}
            onChange={(v) => set("rice", v)}
          />
          <TextField
            label="Víveres (¿cuáles?)"
            value={data.groceries}
            onChange={(v) => set("groceries", v)}
            placeholder="Ej: frijoles, lentejas"
          />
          <Question
            label="Tipo de pan"
            options={BREAD_OPTIONS}
            value={data.breadType}
            onChange={(v) => set("breadType", v)}
          />
          <Question
            label="¿Consumes pastas?"
            options={YES_NO}
            value={data.pasta}
            onChange={(v) => set("pasta", v)}
          />
          <TextField
            label="Condimentos artificiales (especificar)"
            value={data.artificialCondiments}
            onChange={(v) => set("artificialCondiments", v)}
            placeholder="Opcional"
          />
          <TextField
            label="¿Alérgico a algún alimento?"
            value={data.foodAllergy}
            onChange={(v) => set("foodAllergy", v)}
            placeholder="Especificar / Ninguno"
          />
          <TextField
            label="Alimento que prefieres no consumir"
            value={data.avoidFood}
            onChange={(v) => set("avoidFood", v)}
            placeholder="Opcional"
          />
        </div>
      </div>
    );
  }

  // Paso 11: resumen
  return (
    <div>
      <StepHeader eyebrow="Paso 11" title="Tu perfil inicial" />
      <div className="grid gap-3 sm:grid-cols-2">
        <SummaryRow label="Objetivo" value={data.objective} highlight />
        <SummaryRow label="Nivel" value={data.level} />
        <SummaryRow
          label="Frecuencia recomendada"
          value={`${data.availability} días`}
        />
        <SummaryRow
          label="Plan recomendado"
          value={recommendation.plan}
          highlight
        />
        <SummaryRow label="Tiempo estimado" value={recommendation.weeks} />
        <SummaryRow label="Lugar" value={data.place} />
      </div>
      <p className="mt-5 text-sm leading-6 text-zinc-400">
        Al continuar guardaremos tu evaluación y crearás tu cuenta para acceder a
        tu plan.
      </p>
    </div>
  );
}

/* ---------- Sub-componentes ---------- */

function StepHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-[#65ff4f]">
        {eyebrow}
      </p>
      <h3 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
        {title}
      </h3>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block text-sm font-bold text-zinc-200">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 h-12 w-full rounded-lg border border-white/10 bg-black/35 px-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-[#65ff4f]"
      />
    </label>
  );
}

function Pills({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-3">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`min-h-11 rounded-lg border px-5 text-sm font-bold transition ${
            value === option
              ? "border-[#65ff4f] bg-[#65ff4f]/10 text-[#65ff4f]"
              : "border-white/10 bg-white/[0.03] text-zinc-200 hover:border-[#65ff4f]/40"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

/** Pregunta de opcion unica: etiqueta + pills (para salud/alimentacion). */
function Question({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-bold text-zinc-200">{label}</p>
      <Pills options={options} value={value} onChange={onChange} />
    </div>
  );
}

function SelectCard({
  selected,
  onClick,
  media,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  media: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition ${
        selected
          ? "border-[#65ff4f] bg-[#65ff4f]/10"
          : "border-white/10 bg-white/[0.03] hover:border-[#65ff4f]/40"
      }`}
    >
      {media}
      <span
        className={`text-sm font-bold ${selected ? "text-[#65ff4f]" : "text-zinc-200"}`}
      >
        {label}
      </span>
    </button>
  );
}

/**
 * Media de una tarjeta con placeholder elegante si la imagen aun no existe.
 * Las rutas viven en `src/data/onboarding.ts` (body-types/ y goals/).
 */
function CardMedia({
  src,
  fallback,
}: {
  src: string;
  fallback: React.ReactNode;
}) {
  const [ok, setOk] = useState(true);
  return (
    <div className="relative flex h-20 w-full items-center justify-center overflow-hidden rounded-xl bg-white/[0.04]">
      {ok ? (
        <Image
          src={src}
          alt=""
          fill
          sizes="160px"
          className="object-contain"
          onError={() => setOk(false)}
        />
      ) : (
        fallback
      )}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p
        className={`mt-1 text-lg font-black ${highlight ? "text-[#65ff4f]" : "text-white"}`}
      >
        {value || "—"}
      </p>
    </div>
  );
}
