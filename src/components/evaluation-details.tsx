import type { LeadEvaluation } from "@/types";

const FIELDS: {
  label: string;
  key: keyof LeadEvaluation;
  highlight?: boolean;
}[] = [
  { label: "Objetivo", key: "objective", highlight: true },
  { label: "Peso (kg)", key: "weight" },
  { label: "Altura (cm)", key: "height" },
  { label: "Cintura (cm)", key: "waist" },
  { label: "Edad", key: "age" },
  { label: "Sexo", key: "sex" },
  { label: "Tipo corporal", key: "bodyType" },
  { label: "Nivel", key: "level" },
  { label: "Lugar de entrenamiento", key: "place" },
  { label: "Días disponibles", key: "availability" },
  { label: "Sueño", key: "sleep" },
  { label: "Alimentación", key: "nutrition" },
  { label: "Plan recomendado", key: "recommendedPlan", highlight: true },
];

/** Rejilla con todos los campos de una evaluacion inicial. Reutilizable. */
export function EvaluationDetails({
  evaluation,
}: {
  evaluation: LeadEvaluation;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {FIELDS.map((field) => (
        <div
          key={field.key}
          className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
        >
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
            {field.label}
          </p>
          <p
            className={`mt-1 text-sm font-bold ${
              field.highlight ? "text-[#65ff4f]" : "text-white"
            }`}
          >
            {evaluation[field.key] || "—"}
          </p>
        </div>
      ))}
    </div>
  );
}
