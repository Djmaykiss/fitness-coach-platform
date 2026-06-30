import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

export type IconComponent = ComponentType<LucideProps>;

/* ---------- Auth / usuarios ---------- */

export type Role = "admin" | "client";

/**
 * Usuario completo tal como vive en la "base de datos" mock.
 * NOTA: el password en texto plano existe SOLO porque es data simulada.
 * Al migrar a Supabase, la autenticacion la maneja el proveedor y este
 * campo desaparece.
 */
export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
};

/** Usuario expuesto a la UI (sin credenciales). */
export type AuthUser = Omit<User, "password">;

export type RegisterInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type Credentials = {
  email: string;
  password: string;
};

/* ---------- Dominio landing ---------- */

export type Program = {
  title: string;
  duration: string;
  level: string;
  idealFor: string;
  points: string[];
};

export type Transformation = {
  name: string;
  objective: string;
  result: string;
  before: string;
  after: string;
  /** Rutas en /public. Si la imagen no existe aun, se muestra un placeholder. */
  beforeImage: string;
  afterImage: string;
  details: string[];
};

export type Testimonial = {
  name: string;
  role: string;
  result: string;
  quote: string;
};

export type Benefit = {
  icon: IconComponent;
  title: string;
  description: string;
};

export type NavLink = {
  label: string;
  href: string;
};

/* ---------- Dominio dashboards ---------- */

export type DashboardStat = {
  label: string;
  value: string;
  icon?: IconComponent;
};

/** Estado de acceso mensual del alumno (control manual del coach). */
export type AccessStatus = "Activo" | "Vencido" | "Pausado";

/** Cliente/alumno persistido. `userId` lo enlaza con un usuario que inicia sesion. */
export type Client = {
  id: string;
  name: string;
  status: string;
  userId?: string;
  /** Control de acceso mensual (gestionado manualmente desde /admin). */
  accessStatus: AccessStatus;
  accessExpiresAt: string | null;
  lastPaymentDate: string | null;
  paymentMethod: string | null;
  /** Evaluacion inicial guardada en el perfil del alumno (si la completo). */
  evaluation?: LeadEvaluation;
};

export type CreateClientInput = {
  name: string;
  status: string;
  userId?: string;
  evaluation?: LeadEvaluation;
};

/** Fila de cliente para la tabla del admin (cliente + datos derivados del progreso). */
export type AdminClientRow = {
  id: string;
  name: string;
  status: string;
  programa: string;
  progresoPct: number;
  accessStatus: AccessStatus;
  accessExpiresAt: string | null;
  evaluation?: LeadEvaluation;
};

export type LeadStatus = "Nuevo" | "Contactado" | "Convertido" | "Descartado";

/** Evaluacion inicial del alumno (onboarding tipo wizard). Opcional en el lead. */
export type LeadEvaluation = {
  objective: string;
  age: string;
  sex: string;
  weight: string;
  height: string;
  waist: string;
  bodyType: string;
  level: string;
  place: string;
  availability: string;
  sleep: string;
  nutrition: string;
  recommendedPlan: string;

  /* Datos personales extra (formulario de salud/nutricion) */
  address?: string;

  /* Antecedentes personales */
  hypertension?: string;
  hepatitis?: string;
  surgeries?: string;
  asthma?: string;
  otherCondition?: string;

  /* Alimentacion actual */
  sugar?: string;
  sugarHabits?: string;
  softDrinks?: string;
  alcohol?: string;
  chicken?: string;
  redMeat?: string;
  pork?: string;
  seafood?: string;
  dairy?: string;
  fruits?: string;
  vegetables?: string;
  rice?: string;
  groceries?: string;
  breadType?: string;
  pasta?: string;
  artificialCondiments?: string;
  foodAllergy?: string;
  avoidFood?: string;
};

/** Lead captado (formulario simple, onboarding o sembrado). */
export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  objective: string;
  message: string;
  source: string;
  status: LeadStatus;
  createdAt: string;
  /** Presente si el lead llego por el onboarding inteligente. */
  evaluation?: LeadEvaluation;
};

export type CreateLeadInput = {
  name: string;
  email: string;
  phone: string;
  objective: string;
  message: string;
};

/** Entrada para crear un lead desde el onboarding. */
export type CreateEvaluationLeadInput = {
  name: string;
  email: string;
  phone: string;
  evaluation: LeadEvaluation;
};

/**
 * Onboarding pendiente entre la landing y el registro: guarda nombre y email
 * (para prellenar /register) ademas de la evaluacion (para el perfil del alumno).
 */
export type PendingOnboarding = {
  name: string;
  email: string;
  evaluation: LeadEvaluation;
};

/** Recomendacion de plan derivada del objetivo (reglas simples). */
export type PlanRecommendation = {
  plan: string;
  weeks: string;
};

export type ProgramRow = {
  name: string;
  clients: string;
  duration: string;
  status: string;
};

export type CreateProgramInput = {
  name: string;
  duration: string;
  status: string;
};

/** Progreso basico del cliente (persistido por usuario). */
export type ClientProgress = {
  programa: string;
  semanaActual: number;
  semanasTotales: number;
  progresoPct: number;
  pesoInicial: string;
  pesoActual: string;
  objetivo: string;
  adherencia: string;
  tasks: string[];
};

/* ---------- Dashboard premium del alumno (coaching) ---------- */

export type ChartPoint = { label: string; value: number };

export type MetricSeries = {
  weight: ChartPoint[];
  waist: ChartPoint[];
  fat: ChartPoint[];
  muscle: ChartPoint[];
};

export type ComplianceData = {
  training: number;
  nutrition: number;
  water: number;
  sleep: number;
};

export type BodyMeasurement = {
  key: string;
  label: string;
  start: number;
  current: number;
  unit: string;
};

export type GoalData = {
  meta: string;
  startWeight: number;
  currentWeight: number;
  targetWeight: number;
};

export type Achievement = { key: string; label: string; unlocked: boolean };

export type HistoryEvent = { date: string; label: string; done: boolean };

export type TodayRoutine = {
  name: string;
  duration: string;
  calories: string;
  level: string;
  focus: string;
};

export type NutritionMeal = { key: string; label: string; items: string };

export type ChecklistItem = { key: string; label: string };

export type Resource = { key: string; type: string; label: string };

export type ChatMessage = { from: "coach" | "alumno"; text: string; time: string };

export type CheckIn = {
  date: string;
  time: string;
  coach: string;
  status: string;
};

/** Registro de fotos de progreso (persistido por cliente). */
export type ProgressPhoto = {
  id: string;
  date: string;
  front: string;
  side: string;
  back: string;
  note: string;
};

export type CreateProgressPhoto = Omit<ProgressPhoto, "id">;

export type BeforeAfter = { before: string; after: string };

/** Entradas para calcular metricas corporales (formulas reales). */
export type BodyMetricsInput = {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: string;
  targetKg: number;
};

export type BodyMetrics = {
  imc: number;
  imcLabel: string;
  idealWeight: number;
  remainingKg: number;
  calories: number;
  water: number;
  protein: number;
  carbs: number;
  fat: number;
};

/** Item de checklist con su estado de cumplimiento (mergeado con persistencia). */
export type ChecklistState = {
  items: { key: string; label: string; done: boolean }[];
  percent: number;
};

/** Plan de comidas con estado de cada comida marcada. */
export type NutritionState = {
  meals: { key: string; label: string; items: string; done: boolean }[];
  waterTarget: string;
  percent: number;
};

/** Estado persistido de checklists por cliente: lista -> item -> done. */
export type ChecklistChecks = Record<string, Record<string, boolean>>;

/** Payload completo del dashboard premium del alumno. */
export type CoachingDashboard = {
  clientId: string;
  metrics: MetricSeries;
  compliance: ComplianceData;
  measurements: BodyMeasurement[];
  goal: GoalData;
  transformationPct: number;
  achievements: Achievement[];
  history: HistoryEvent[];
  routine: TodayRoutine;
  nutrition: NutritionState;
  reminders: ChecklistState;
  weeklyGoals: ChecklistState;
  resources: Resource[];
  chat: ChatMessage[];
  checkIn: CheckIn;
  beforeAfter: BeforeAfter;
  photos: ProgressPhoto[];
  bodyMetrics: BodyMetrics;
};

/* ---------- Programas de entrenamiento (builder real, persistido) ---------- */

/**
 * Un ejercicio dentro de un dia de entrenamiento. `exerciseId` referencia a un
 * ejercicio de la biblioteca (para mostrar su ficha completa al alumno); `name`
 * queda denormalizado para mostrar aunque la referencia ya no exista. `sets`,
 * `reps`, `rest` y `notes` son la prescripcion de ese programa.
 */
export type TrainingExercise = {
  id: string;
  exerciseId?: string;
  name: string;
  sets: string;
  reps: string;
  rest: string;
  notes: string;
};

export type CreateTrainingExercise = Omit<TrainingExercise, "id">;

/** Un dia de entrenamiento con sus ejercicios. */
export type TrainingDay = {
  id: string;
  name: string;
  exercises: TrainingExercise[];
};

/** Programa de entrenamiento completo (lo arma el coach en /admin). */
export type TrainingProgram = {
  id: string;
  name: string;
  objective: string;
  level: string;
  duration: string;
  notes: string;
  days: TrainingDay[];
};

/** Datos editables del programa (sin id ni dias). */
export type CreateTrainingProgramInput = {
  name: string;
  objective: string;
  level: string;
  duration: string;
  notes: string;
};

/** Resuelto para el alumno: programa asignado + ids de dias completados. */
export type AssignedTraining = {
  clientId: string;
  program: TrainingProgram;
  completedDayIds: string[];
  /** Series completadas por ejercicio: id de ejercicio (instancia) -> indices. */
  seriesProgress: Record<string, number[]>;
};

/* ---------- Biblioteca de ejercicios (catalogo del coach) ---------- */

/** Ficha completa de un ejercicio (catalogo reutilizable en los programas). */
export type LibraryExercise = {
  id: string;
  name: string;
  muscleGroup: string;
  secondaryMuscles: string;
  image: string;
  gif: string;
  video: string;
  equipment: string;
  difficulty: string;
  description: string;
  technique: string;
  commonMistakes: string;
  coachTips: string;
  variants: string;
  substitutions: string;
  recommendedTime: string;
  recommendedRest: string;
};

export type CreateLibraryExerciseInput = Omit<LibraryExercise, "id">;

/* ---------- Planes de nutricion (modulo real, persistido) ---------- */

/** Una comida dentro de un dia del plan (nombre + alimentos). */
export type NutritionPlanMeal = {
  id: string;
  name: string;
  description: string;
};

export type CreateNutritionPlanMeal = Omit<NutritionPlanMeal, "id">;

/** Un dia del plan con sus comidas. */
export type NutritionPlanDay = {
  id: string;
  name: string;
  meals: NutritionPlanMeal[];
};

/** Plan nutricional completo (lo arma el coach en /admin). Macros = objetivo diario. */
export type NutritionPlan = {
  id: string;
  name: string;
  objective: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  water: string;
  notes: string;
  days: NutritionPlanDay[];
};

/** Datos editables del plan (sin id ni dias). */
export type CreateNutritionPlanInput = {
  name: string;
  objective: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  water: string;
  notes: string;
};

/** Resuelto para el alumno: plan asignado + ids de comidas completadas. */
export type AssignedNutrition = {
  clientId: string;
  plan: NutritionPlan;
  completedMealIds: string[];
};
