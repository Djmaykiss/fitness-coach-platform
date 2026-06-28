import type { LeadEvaluation } from "@/types";

type Field = { label: string; key: keyof LeadEvaluation; highlight?: boolean };
type Block = { title: string; fields: Field[] };

/**
 * La evaluacion inicial se muestra agrupada en bloques. Los campos del
 * formulario de salud/alimentacion son opcionales: solo se renderiza un campo
 * (y su bloque) cuando tiene valor, asi las evaluaciones antiguas no muestran
 * casillas vacias.
 */
const BLOCKS: Block[] = [
  {
    title: "Datos personales",
    fields: [
      { label: "Objetivo", key: "objective", highlight: true },
      { label: "Edad", key: "age" },
      { label: "Sexo", key: "sex" },
      { label: "Dirección", key: "address" },
      { label: "Peso (kg)", key: "weight" },
      { label: "Altura (cm)", key: "height" },
      { label: "Cintura (cm)", key: "waist" },
      { label: "Tipo corporal", key: "bodyType" },
      { label: "Nivel", key: "level" },
      { label: "Lugar de entrenamiento", key: "place" },
      { label: "Días disponibles", key: "availability" },
      { label: "Sueño", key: "sleep" },
      { label: "Plan recomendado", key: "recommendedPlan", highlight: true },
    ],
  },
  {
    title: "Antecedentes",
    fields: [
      { label: "Hipertensión arterial", key: "hypertension" },
      { label: "Hepatitis", key: "hepatitis" },
      { label: "Cirugías previas", key: "surgeries" },
      { label: "Asmático", key: "asthma" },
      { label: "Otra condición", key: "otherCondition" },
    ],
  },
  {
    title: "Alimentación",
    fields: [
      { label: "Calidad de alimentación", key: "nutrition" },
      { label: "Consume azúcar", key: "sugar" },
      { label: "Hábitos con el azúcar", key: "sugarHabits" },
      { label: "Refrescos", key: "softDrinks" },
      { label: "Alcohol", key: "alcohol" },
      { label: "Pollo", key: "chicken" },
      { label: "Carne roja", key: "redMeat" },
      { label: "Carne de cerdo", key: "pork" },
      { label: "Alimentos del mar", key: "seafood" },
      { label: "Lácteos", key: "dairy" },
      { label: "Frutas", key: "fruits" },
      { label: "Vegetales", key: "vegetables" },
      { label: "Arroz", key: "rice" },
      { label: "Víveres", key: "groceries" },
      { label: "Pan", key: "breadType" },
      { label: "Pastas", key: "pasta" },
      { label: "Condimentos artificiales", key: "artificialCondiments" },
      { label: "Alergias alimentarias", key: "foodAllergy" },
      { label: "Prefiere no consumir", key: "avoidFood" },
    ],
  },
];

/** Evaluacion inicial agrupada por bloques. Reutilizable (dashboard + admin). */
export function EvaluationDetails({
  evaluation,
}: {
  evaluation: LeadEvaluation;
}) {
  const blocks = BLOCKS.map((block) => ({
    title: block.title,
    fields: block.fields.filter((field) => {
      const value = evaluation[field.key];
      return typeof value === "string" && value.trim() !== "";
    }),
  })).filter((block) => block.fields.length > 0);

  return (
    <div className="space-y-6">
      {blocks.map((block) => (
        <div key={block.title}>
          <p className="mb-3 text-sm font-bold text-[#65ff4f]">{block.title}</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {block.fields.map((field) => (
              <div
                key={field.key}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                  {field.label}
                </p>
                <p
                  className={`mt-1 text-sm font-bold break-words ${
                    field.highlight ? "text-[#65ff4f]" : "text-white"
                  }`}
                >
                  {evaluation[field.key]}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
