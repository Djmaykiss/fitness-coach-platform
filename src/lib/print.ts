import type {
  AdminClientRow,
  LeadEvaluation,
  NutritionPlan,
  TrainingProgram,
} from "@/types";

/**
 * Exportaciones imprimibles (sin PDF real todavia). Abren una ventana nueva con un
 * documento HTML autocontenido y claro para imprimir/guardar como PDF desde el
 * navegador (window.print). No tocan el diseño de la app: el documento es aparte.
 */

function escapeHtml(value: string): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const STYLES = `
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: #111; margin: 0; padding: 32px; }
  .head { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 3px solid #16a34a; padding-bottom: 12px; margin-bottom: 20px; }
  .brand { font-size: 20px; font-weight: 800; letter-spacing: .5px; }
  .doc { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  h2 { font-size: 15px; margin: 22px 0 8px; color: #16a34a; text-transform: uppercase; letter-spacing: .5px; }
  .muted { color: #666; font-size: 13px; margin: 0 0 4px; }
  .chips { margin: 8px 0 0; }
  .chip { display: inline-block; border: 1px solid #ddd; border-radius: 6px; padding: 3px 8px; font-size: 12px; margin: 0 6px 6px 0; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 13px; }
  th, td { text-align: left; padding: 7px 8px; border-bottom: 1px solid #eee; vertical-align: top; }
  th { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #555; border-bottom: 2px solid #ddd; }
  .kv { display: grid; grid-template-columns: 180px 1fr; gap: 4px 12px; font-size: 13px; margin-top: 6px; }
  .kv dt { color: #666; }
  .kv dd { margin: 0; font-weight: 600; }
  .foot { margin-top: 28px; border-top: 1px solid #eee; padding-top: 10px; font-size: 11px; color: #999; }
  @media print { body { padding: 0; } .no-print { display: none; } }
`;

/** Abre una ventana con el documento y lanza la impresion. */
function openPrint(title: string, body: string): void {
  if (typeof window === "undefined") return;
  const win = window.open("", "_blank", "width=840,height=1000");
  if (!win) {
    // Popup bloqueado: no rompemos nada, el llamador puede avisar.
    return;
  }
  win.document.write(
    `<!doctype html><html lang="es"><head><meta charset="utf-8" />` +
      `<title>${escapeHtml(title)}</title><style>${STYLES}</style></head>` +
      `<body>${body}` +
      `<div class="foot">Generado desde la plataforma · ${escapeHtml(new Date().toLocaleString("es-ES"))}</div>` +
      `<script>window.onload=function(){setTimeout(function(){window.print();},150);};<\/script>` +
      `</body></html>`,
  );
  win.document.close();
  win.focus();
}

function header(brand: string, docLabel: string): string {
  return (
    `<div class="head"><span class="brand">${escapeHtml(brand)}</span>` +
    `<span class="doc">${escapeHtml(docLabel)}</span></div>`
  );
}

/* ---------- Perfil del alumno ---------- */

const EVAL_FIELDS: { key: keyof LeadEvaluation; label: string }[] = [
  { key: "objective", label: "Objetivo" },
  { key: "level", label: "Nivel" },
  { key: "place", label: "Lugar" },
  { key: "weight", label: "Peso (kg)" },
  { key: "targetWeight", label: "Peso objetivo (kg)" },
  { key: "height", label: "Estatura (cm)" },
  { key: "waist", label: "Cintura (cm)" },
  { key: "age", label: "Edad" },
  { key: "sex", label: "Sexo" },
  { key: "availability", label: "Días/semana" },
  { key: "sleep", label: "Sueño" },
  { key: "nutrition", label: "Alimentación" },
];

export function printClientProfile(row: AdminClientRow, brand: string): void {
  const ev = row.evaluation;
  const evalRows = ev
    ? EVAL_FIELDS.filter((f) => ev[f.key])
        .map(
          (f) =>
            `<dt>${escapeHtml(f.label)}</dt><dd>${escapeHtml(String(ev[f.key]))}</dd>`,
        )
        .join("")
    : "";

  const body =
    header(brand, "Perfil del alumno") +
    `<h1>${escapeHtml(row.name)}</h1>` +
    (row.email ? `<p class="muted">${escapeHtml(row.email)}</p>` : "") +
    `<div class="chips">` +
    `<span class="chip">Acceso: ${escapeHtml(row.accessStatus)}</span>` +
    `<span class="chip">Programa: ${escapeHtml(row.programa || "Sin asignar")}</span>` +
    `<span class="chip">Progreso: ${row.progresoPct}%</span>` +
    `</div>` +
    (ev
      ? `<h2>Evaluación inicial</h2><dl class="kv">${evalRows}</dl>`
      : `<h2>Evaluación inicial</h2><p class="muted">Sin evaluación registrada.</p>`);

  openPrint(`Perfil - ${row.name}`, body);
}

/* ---------- Programa de entrenamiento ---------- */

export function printProgram(program: TrainingProgram, brand: string): void {
  const days = program.days
    .map((d) => {
      const rows = d.exercises.length
        ? d.exercises
            .map(
              (e) =>
                `<tr><td>${escapeHtml(e.name)}</td><td>${escapeHtml(e.sets || "—")}</td>` +
                `<td>${escapeHtml(e.reps || "—")}</td><td>${escapeHtml(e.rest || "—")}</td>` +
                `<td>${escapeHtml(e.notes || "")}</td></tr>`,
            )
            .join("")
        : `<tr><td colspan="5" class="muted">Sin ejercicios.</td></tr>`;
      return (
        `<h2>${escapeHtml(d.name)}</h2>` +
        `<table><thead><tr><th>Ejercicio</th><th>Series</th><th>Reps</th><th>Descanso</th><th>Notas</th></tr></thead>` +
        `<tbody>${rows}</tbody></table>`
      );
    })
    .join("");

  const body =
    header(brand, "Programa de entrenamiento") +
    `<h1>${escapeHtml(program.name)}</h1>` +
    `<div class="chips">` +
    `<span class="chip">Objetivo: ${escapeHtml(program.objective || "—")}</span>` +
    `<span class="chip">Nivel: ${escapeHtml(program.level || "—")}</span>` +
    `<span class="chip">Duración: ${escapeHtml(program.duration || "—")}</span>` +
    `<span class="chip">${program.days.length} días</span>` +
    `</div>` +
    (program.notes ? `<p class="muted">${escapeHtml(program.notes)}</p>` : "") +
    (days || `<p class="muted">Este programa aún no tiene días.</p>`);

  openPrint(`Programa - ${program.name}`, body);
}

/* ---------- Plan de nutrición ---------- */

export function printNutrition(plan: NutritionPlan, brand: string): void {
  const days = plan.days
    .map((d) => {
      const rows = d.meals.length
        ? d.meals
            .map(
              (m) =>
                `<tr><td>${escapeHtml(m.name)}</td><td>${escapeHtml(m.description || "")}</td></tr>`,
            )
            .join("")
        : `<tr><td colspan="2" class="muted">Sin comidas.</td></tr>`;
      return (
        `<h2>${escapeHtml(d.name)}</h2>` +
        `<table><thead><tr><th>Comida</th><th>Alimentos</th></tr></thead>` +
        `<tbody>${rows}</tbody></table>`
      );
    })
    .join("");

  const body =
    header(brand, "Plan de nutrición") +
    `<h1>${escapeHtml(plan.name)}</h1>` +
    `<div class="chips">` +
    `<span class="chip">Objetivo: ${escapeHtml(plan.objective || "—")}</span>` +
    `<span class="chip">Calorías: ${escapeHtml(plan.calories || "—")}</span>` +
    `<span class="chip">Proteínas: ${escapeHtml(plan.protein || "—")}</span>` +
    `<span class="chip">Carbohidratos: ${escapeHtml(plan.carbs || "—")}</span>` +
    `<span class="chip">Grasas: ${escapeHtml(plan.fat || "—")}</span>` +
    `<span class="chip">Agua: ${escapeHtml(plan.water || "—")}</span>` +
    `</div>` +
    (plan.notes ? `<p class="muted">${escapeHtml(plan.notes)}</p>` : "") +
    (days || `<p class="muted">Este plan aún no tiene días.</p>`);

  openPrint(`Nutrición - ${plan.name}`, body);
}
