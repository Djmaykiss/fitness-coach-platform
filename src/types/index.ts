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

/** Fila de cliente para la tabla del admin (cliente + datos derivados). */
export type AdminClientRow = {
  id: string;
  name: string;
  status: string;
  programa: string;
  progresoPct: number;
  accessStatus: AccessStatus;
  accessExpiresAt: string | null;
  evaluation?: LeadEvaluation;
  /** Email del usuario enlazado (para el buscador del admin). */
  email: string;
  /** Banderas derivadas para filtros del admin. */
  hasProgram: boolean;
  hasNutrition: boolean;
  hasEvaluation: boolean;
  /** Activo cuyo acceso vence en los proximos 7 dias. */
  renewSoon: boolean;
};

/** Panel ejecutivo del admin (resumen del negocio). */
export type ExecutiveStats = {
  total: number;
  activos: number;
  vencidos: number;
  pausados: number;
  renuevanSemana: number;
  sinPrograma: number;
  sinNutricion: number;
  sinEvaluacion: number;
  leadsPendientes: number;
  ingresosEstimados: number;
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

  /* Campos ampliados (onboarding premium v1.5); opcionales, no rompen datos previos. */
  targetWeight?: string;
  motivation?: string;
  focusZone?: string;
  birthYear?: string;
  injuries?: string;
  reward?: string;

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

/**
 * Recurso multimedia (imagen) del coach. Guarda SOLO referencia (bucket/path/url) +
 * metadata; el binario vive en Storage (Supabase) o IndexedDB (local). Se persiste en
 * `media_assets`. Las fotos del alumno NO usan este tipo (van en progress/transformation).
 */
export type MediaAsset = {
  id: string;
  kind: "image";
  bucket: string;
  path: string;
  url: string;
  thumbPath: string;
  thumbUrl: string;
  mime: string;
  width: number;
  height: number;
  size: number;
  checksum: string;
  title: string;
  /** exercise | plan | transformation | article | resource | cover | gallery | library */
  context: string;
  /** Entidad dueña (vacío si es de biblioteca general). */
  ownerKind: string;
  ownerId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type CreateMediaAsset = Omit<MediaAsset, "id" | "createdAt">;

/** Filtro de listado de la biblioteca multimedia del coach. */
export type MediaQuery = {
  context?: string;
  ownerKind?: string;
  ownerId?: string;
};

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
  /** Calendario: fechas (YYYY-MM-DD) marcadas como entrenadas / completadas 100%. */
  calendar: { trained: Record<string, boolean>; full: Record<string, boolean> };
  /** Estado de la rutina del dia (persistido por cliente). */
  routineStatus: { started: boolean; completed: boolean };
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

/** Sensacion del alumno al terminar una sesion de entrenamiento. */
export type WorkoutFeeling = "dificil" | "adecuado" | "facil";

/** Resultado de una sesion de entrenamiento completada (modo entrenamiento). */
export type WorkoutResult = {
  id: string;
  date: string;
  dayId: string;
  dayName: string;
  programName: string;
  exercises: number;
  durationSec: number;
  caloriesEst: number;
  feeling: WorkoutFeeling;
};

export type CreateWorkoutResult = Omit<WorkoutResult, "id">;

/* ---------- Seccion "Descubre" (CMS administrado por el coach) ---------- */

/** Rutina destacada del catalogo "Descubre" (la administra el coach en /admin). */
export type DiscoverRoutine = {
  id: string;
  name: string;
  category: string;
  level: string;
  duration: string;
  minutes: string;
  description: string;
  image: string;
  published: boolean;
};

export type CreateDiscoverRoutine = Omit<DiscoverRoutine, "id" | "published">;

/** Categoria por zona (se cruza con la biblioteca por `muscleGroups`). */
export type DiscoverCategory = {
  id: string;
  label: string;
  description: string;
  icon: string;
  muscleGroups: string[];
  published: boolean;
};

export type CreateDiscoverCategory = Omit<DiscoverCategory, "id" | "published">;

/** Articulo / recurso educativo. */
export type DiscoverArticle = {
  id: string;
  title: string;
  category: string;
  readTime: string;
  content: string;
  image: string;
  published: boolean;
};

export type CreateDiscoverArticle = Omit<DiscoverArticle, "id" | "published">;

/* ---------- Contenido del onboarding (CMS administrado por el coach) ---------- */

/**
 * Mensaje motivacional que el onboarding puede mostrar durante la evaluacion.
 * `category` permite segmentarlo (p. ej. objetivo del alumno o "General").
 */
export type OnboardingMessage = {
  id: string;
  message: string;
  category: string;
  published: boolean;
};

export type CreateOnboardingMessage = Omit<OnboardingMessage, "id" | "published">;

/**
 * Recompensa / incentivo que el alumno ve al terminar el onboarding
 * (p. ej. "7 días de prueba", "Plan personalizado").
 */
export type OnboardingReward = {
  id: string;
  title: string;
  description: string;
  icon: string;
  published: boolean;
};

export type CreateOnboardingReward = Omit<OnboardingReward, "id" | "published">;

/**
 * Texto de prediccion que compone la pantalla de prediccion segun el objetivo del
 * alumno. `objective` la vincula a un objetivo; `timeframe` es el horizonte estimado.
 */
export type OnboardingPrediction = {
  id: string;
  objective: string;
  title: string;
  body: string;
  timeframe: string;
  published: boolean;
};

export type CreateOnboardingPrediction = Omit<
  OnboardingPrediction,
  "id" | "published"
>;

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

/* ---------- Configuracion del negocio (white-label, administra el coach) ---------- */

/**
 * Identidad y contacto del negocio del coach. Es la fuente editable que reemplaza
 * a los valores fijos de `coachConfig` (que quedan solo como defaults). Persistida
 * en localStorage; preparada para migrar cambiando el repositorio.
 */
export type BusinessSettings = {
  /** Marca */
  businessName: string;
  tagline: string;
  description: string;
  logoUrl: string;
  /** Contacto */
  phone: string;
  /** Solo digitos, formato internacional para wa.me. */
  whatsapp: string;
  email: string;
  address: string;
  schedule: string;
  /** Redes sociales (URLs completas; vacio = oculto) */
  instagram: string;
  facebook: string;
  tiktok: string;
  youtube: string;
  /** Legales */
  policies: string;
  terms: string;
  /** Marca visual (preparado para theming; se guarda aunque la paleta base se mantenga) */
  primaryColor: string;
  secondaryColor: string;
  /** Negocio */
  monthlyPrice: number;
  currency: string;
};

/* ---------- Overview del coach (panel principal, metricas derivadas) ---------- */

/** Una entrada de actividad reciente del negocio (derivada de datos reales). */
export type ActivityItem = {
  id: string;
  kind: "workout" | "lead" | "renewal" | "client";
  text: string;
  date: string;
};

/** Resumen completo del negocio para el dashboard del coach. */
export type CoachOverview = {
  alumnosActivos: number;
  alumnosSuspendidos: number;
  alumnosVencidos: number;
  alumnosTotal: number;
  programas: number;
  rutinasPublicadas: number;
  rutinasBorrador: number;
  ejercicios: number;
  ejerciciosConVideo: number;
  articulosPublicados: number;
  entrenamientosHoy: number;
  entrenamientosSemana: number;
  entrenamientosMes: number;
  progresoPromedio: number;
  metaPesoPromedio: number;
  imcPromedio: number;
  ingresosEstimados: number;
  proximasRenovaciones: { id: string; name: string; date: string | null }[];
  ultimosAlumnos: { id: string; name: string; accessStatus: AccessStatus }[];
  actividadReciente: ActivityItem[];
  /** Serie de entrenamientos por dia (ultimos 14 dias) para la grafica. */
  entrenamientosSerie: { label: string; value: number }[];
};

/* ---------- CRM pipeline (administra el coach) ---------- */

/** Etapas del pipeline comercial/operativo del coach. */
export type CrmStage =
  | "Lead"
  | "Nuevo alumno"
  | "Evaluación pendiente"
  | "Evaluación completada"
  | "Programa asignado"
  | "Entrenando"
  | "Suspendido"
  | "Finalizado"
  | "Renovado";

/** Un movimiento en el historial del pipeline. */
export type CrmHistoryEntry = { stage: CrmStage; date: string };

/**
 * Metadatos CRM por entidad (lead o alumno), persistidos aparte para no tocar los
 * modelos existentes. `stage` es un override manual; si no existe, se deriva.
 */
export type CrmRecord = {
  entityId: string;
  stage?: CrmStage;
  notes: string;
  nextAction: string;
  followUpDate: string;
  history: CrmHistoryEntry[];
};

/** Item compuesto del pipeline para la UI (entidad + metadatos + etapa resuelta). */
export type CrmItem = {
  id: string;
  entityType: "lead" | "client";
  name: string;
  email: string;
  phone: string;
  objective: string;
  stage: CrmStage;
  accessStatus: AccessStatus | null;
  notes: string;
  nextAction: string;
  followUpDate: string;
  history: CrmHistoryEntry[];
  hasProgram: boolean;
  hasEvaluation: boolean;
  createdAt: string;
};

/* ---------- Centro de notificaciones del coach (derivadas) ---------- */

export type NotificationType =
  | "lead"
  | "client"
  | "workout"
  | "inactivity"
  | "program"
  | "access"
  | "evaluation"
  | "gap";

export type NotificationPriority = "alta" | "media" | "baja";

/** Notificacion del coach (derivada de datos reales; el estado leido se persiste). */
export type CoachNotification = {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  text: string;
  date: string;
  read: boolean;
};

/* ---------- Planes / membresías comerciales (administra el coach) ---------- */

/** Plan comercial mostrado en la landing y administrado por el coach. */
export type Plan = {
  id: string;
  name: string;
  /** Texto de precio libre (p. ej. "$67–97/mes o Reto 4 semanas por $97"). */
  priceLabel: string;
  modality: string;
  idealFor: string;
  /** Beneficios (persistidos como `plan_features` en Supabase). */
  features: string[];
  buttonLabel: string;
  /** Color de acento de la tarjeta (hex). */
  color: string;
  /** Imagen opcional del plan (URL). */
  image: string;
  recommended: boolean;
  active: boolean;
  /** Orden en la landing / panel (drag & drop). */
  position: number;
};

/** Datos editables de un plan (sin id ni position, que gestiona la capa de datos). */
export type CreatePlanInput = Omit<Plan, "id" | "position">;

/** Plan contratado por un alumno (perfil del alumno). */
export type ClientPlan = {
  planId: string;
  planName: string;
  status: string;
  startDate: string;
  renewalDate: string;
};
