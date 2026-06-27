import type {
  Achievement,
  BeforeAfter,
  BodyMeasurement,
  BodyMetricsInput,
  ChatMessage,
  CheckIn,
  ChecklistItem,
  ComplianceData,
  GoalData,
  HistoryEvent,
  MetricSeries,
  NutritionMeal,
  ProgressPhoto,
  Resource,
  TodayRoutine,
} from "@/types";

/**
 * Datos demo del dashboard premium del alumno. Hoy son seeds locales; en el
 * futuro estos provendran de Supabase. La UI los consume via `coachingService`,
 * nunca directamente, asi la migracion solo cambia repositorios.
 */

/* Gráficas de progreso (peso, cintura, grasa, masa muscular) */
export const metricSeries: MetricSeries = {
  weight: [
    { label: "S1", value: 86 },
    { label: "S2", value: 85.1 },
    { label: "S3", value: 84.2 },
    { label: "S4", value: 83 },
    { label: "S5", value: 82.1 },
    { label: "S6", value: 81 },
    { label: "S7", value: 80.4 },
  ],
  waist: [
    { label: "S1", value: 94 },
    { label: "S2", value: 93 },
    { label: "S3", value: 92 },
    { label: "S4", value: 90 },
    { label: "S5", value: 89 },
    { label: "S6", value: 88 },
    { label: "S7", value: 87 },
  ],
  fat: [
    { label: "S1", value: 24 },
    { label: "S2", value: 23.2 },
    { label: "S3", value: 22.5 },
    { label: "S4", value: 21.6 },
    { label: "S5", value: 20.9 },
    { label: "S6", value: 20.1 },
    { label: "S7", value: 19.4 },
  ],
  muscle: [
    { label: "S1", value: 34 },
    { label: "S2", value: 34.4 },
    { label: "S3", value: 34.9 },
    { label: "S4", value: 35.3 },
    { label: "S5", value: 35.8 },
    { label: "S6", value: 36.2 },
    { label: "S7", value: 36.7 },
  ],
};

/* Cumplimiento general */
export const compliance: ComplianceData = {
  training: 82,
  nutrition: 74,
  water: 68,
  sleep: 88,
};

/* Medidas corporales */
export const measurements: BodyMeasurement[] = [
  { key: "peso", label: "Peso", start: 86, current: 80.4, unit: "kg" },
  { key: "cintura", label: "Cintura", start: 94, current: 87, unit: "cm" },
  { key: "pecho", label: "Pecho", start: 102, current: 99, unit: "cm" },
  { key: "brazo", label: "Brazo", start: 33, current: 35, unit: "cm" },
  { key: "pierna", label: "Pierna", start: 56, current: 58, unit: "cm" },
  { key: "pantorrilla", label: "Pantorrilla", start: 37, current: 38, unit: "cm" },
  { key: "cuello", label: "Cuello", start: 40, current: 39, unit: "cm" },
  { key: "hombros", label: "Hombros", start: 118, current: 121, unit: "cm" },
];

/* Progreso hacia la meta */
export const goal: GoalData = {
  meta: "Recomposición corporal",
  startWeight: 86,
  currentWeight: 80.4,
  targetWeight: 76,
};

/* Sistema de logros */
export const achievements: Achievement[] = [
  { key: "primer-entreno", label: "Primer entrenamiento", unlocked: true },
  { key: "primera-semana", label: "Primera semana", unlocked: true },
  { key: "5kg", label: "5 kg perdidos", unlocked: true },
  { key: "30-dias", label: "30 días entrenando", unlocked: false },
  { key: "meta", label: "Objetivo alcanzado", unlocked: false },
];

/* Historial del alumno */
export const history: HistoryEvent[] = [
  { date: "2026-04-02", label: "Evaluación inicial", done: true },
  { date: "2026-04-03", label: "Registro de cuenta", done: true },
  { date: "2026-04-04", label: "Programa asignado", done: true },
  { date: "2026-04-08", label: "Primera llamada", done: true },
  { date: "2026-04-09", label: "Primera rutina", done: true },
  { date: "2026-04-23", label: "Primer progreso", done: true },
  { date: "2026-05-01", label: "Primer logro", done: true },
  { date: "2026-05-15", label: "Fotos subidas", done: false },
];

/* Rutina del día */
export const todayRoutine: TodayRoutine = {
  name: "Full Body - Fuerza",
  duration: "55 min",
  calories: "480 kcal",
  level: "Intermedio",
  focus: "Pierna + Espalda",
};

/* Plan de nutrición */
export const nutritionMeals: NutritionMeal[] = [
  { key: "desayuno", label: "Desayuno", items: "Avena, huevos, fruta" },
  { key: "almuerzo", label: "Almuerzo", items: "Pollo, arroz, ensalada" },
  { key: "cena", label: "Cena", items: "Pescado, vegetales" },
  { key: "snacks", label: "Snacks", items: "Yogur, frutos secos" },
  { key: "agua", label: "Agua", items: "2.5 L durante el día" },
];
export const waterTarget = "2.5 L";

/* Objetivos de la semana */
export const weeklyGoals: ChecklistItem[] = [
  { key: "entrenar", label: "Entrenar 4 días" },
  { key: "agua", label: "Beber agua" },
  { key: "dormir", label: "Dormir 8 horas" },
  { key: "verduras", label: "Comer verduras" },
];

/* Recordatorios */
export const reminders: ChecklistItem[] = [
  { key: "entrenar", label: "Entrenar" },
  { key: "agua", label: "Tomar agua" },
  { key: "dormir", label: "Dormir temprano" },
  { key: "progreso", label: "Enviar progreso" },
];

/* Recursos */
export const resources: Resource[] = [
  { key: "rutina-pdf", type: "PDF", label: "Rutina de entrenamiento" },
  { key: "nutricion-pdf", type: "PDF", label: "Plan de nutrición" },
  { key: "recetas", type: "Recetas", label: "Recetas saludables" },
  { key: "compras", type: "Lista", label: "Lista de compras" },
  { key: "videos", type: "Videos", label: "Técnica de ejercicios" },
];

/* Chat con el coach (demo) */
export const chatDemo: ChatMessage[] = [
  { from: "coach", text: "¡Hola! ¿Cómo te sentiste con la rutina de ayer?", time: "09:12" },
  { from: "alumno", text: "Bien, un poco de agujetas pero con energía 💪", time: "09:20" },
  { from: "coach", text: "Perfecto. Sube tus fotos de progreso esta semana.", time: "09:22" },
];

/* Próximo check-in */
export const checkIn: CheckIn = {
  date: "2026-06-29",
  time: "19:00",
  coach: "Coach Fitness",
  status: "Confirmado",
};

/**
 * Comparador Antes / Después. Vacio por defecto (muestra placeholder elegante);
 * al subir fotos del alumno se usaran sus imagenes. Sin peticiones rotas.
 */
export const beforeAfter: BeforeAfter = {
  before: "",
  after: "",
};

/**
 * Fotos de progreso iniciales (timeline). Sin rutas por defecto: cada registro
 * muestra placeholders hasta que se conecte el almacenamiento de imagenes.
 */
export const progressPhotosSeed: ProgressPhoto[] = [
  {
    id: "photo-seed-1",
    date: "2026-04-02",
    front: "",
    side: "",
    back: "",
    note: "Punto de partida.",
  },
  {
    id: "photo-seed-2",
    date: "2026-05-07",
    front: "",
    side: "",
    back: "",
    note: "Cinco semanas, cintura más marcada.",
  },
];

/* Datos demo para metricas corporales (en el futuro vendran de la evaluacion) */
export const bodyMetricsInput: BodyMetricsInput = {
  weightKg: 80.4,
  heightCm: 178,
  age: 32,
  sex: "Hombre",
  targetKg: 76,
};
