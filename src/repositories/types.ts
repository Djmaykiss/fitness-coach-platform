import type {
  Benefit,
  BusinessSettings,
  ContentStatus,
  CrmRecord,
  CrmStage,
  ChatMessage,
  ChecklistChecks,
  Client,
  ClientProgress,
  CreateClientInput,
  CreateTestimonialInput,
  CreateTransformationInput,
  CreateEvaluationLeadInput,
  CreateLeadInput,
  CreateProgramInput,
  CreateLibraryExerciseInput,
  CreateNutritionPlanInput,
  CreateNutritionPlanMeal,
  CreateProgressPhoto,
  CreateTrainingExercise,
  CreateTrainingProgramInput,
  Credentials,
  ExerciseCategory,
  LibraryExercise,
  NutritionPlan,
  Plan,
  CreatePlanInput,
  ClientPlan,
  Lead,
  LeadStatus,
  NavLink,
  PendingOnboarding,
  Program,
  ProgramRow,
  ProgressPhoto,
  RegisterInput,
  CreateDiscoverArticle,
  CreateDiscoverCategory,
  CreateDiscoverRoutine,
  CreateOnboardingMessage,
  CreateOnboardingPrediction,
  CreateOnboardingReward,
  CreateWorkoutResult,
  DiscoverArticle,
  DiscoverCategory,
  DiscoverRoutine,
  OnboardingMessage,
  OnboardingPrediction,
  OnboardingReward,
  Testimonial,
  TrainingProgram,
  Transformation,
  User,
  WorkoutResult,
} from "@/types";

/**
 * Contratos de acceso a datos.
 *
 * - Contenido de marketing (programas, testimonios, transformaciones, beneficios)
 *   se sirve estatico desde `src/data` (lo consume la landing en el servidor).
 * - Datos operativos (usuarios, clientes, leads, programas del panel y progreso)
 *   se persisten en `localStorage` mediante las implementaciones `Local*`.
 *
 * La UI nunca conoce la implementacion concreta; para migrar a una base de datos
 * se crean nuevas clases que cumplan estas interfaces y se cambian en
 * `repositories/index.ts`.
 */

export interface ProgramRepository {
  getPrograms(): Promise<Program[]>;
  getProgramRows(): Promise<ProgramRow[]>;
  createProgramRow(input: CreateProgramInput): Promise<ProgramRow>;
}

export interface TestimonialRepository {
  /** Coach: TODOS los testimonios de la org (cualquier estado), por `position`. */
  getTestimonials(): Promise<Testimonial[]>;
  /** Landing: solo `status='public'`, por `position`. */
  getPublishedTestimonials(): Promise<Testimonial[]>;
  createTestimonial(input: CreateTestimonialInput): Promise<Testimonial>;
  updateTestimonial(
    id: string,
    patch: Partial<CreateTestimonialInput>,
  ): Promise<Testimonial | null>;
  setStatus(id: string, status: ContentStatus): Promise<Testimonial | null>;
  reorder(orderedIds: string[]): Promise<void>;
  /** Soft-delete. */
  deleteTestimonial(id: string): Promise<boolean>;
}

/**
 * Transformaciones de marketing (Antes/Después) del coach (patrón universal). Espejo de
 * `TestimonialRepository` + consentimiento obligatorio para publicar.
 */
export interface TransformationRepository {
  /** Coach: TODAS las transformaciones de la org (cualquier estado), por `position`. */
  getTransformations(): Promise<Transformation[]>;
  /** Landing: solo `status='public'` CON `consentConfirmed=true`, por `position`. */
  getPublishedTransformations(): Promise<Transformation[]>;
  createTransformation(input: CreateTransformationInput): Promise<Transformation>;
  updateTransformation(
    id: string,
    patch: Partial<CreateTransformationInput>,
  ): Promise<Transformation | null>;
  /**
   * Cambia el estado. Publicar (`public`) requiere `consentConfirmed=true`
   * (si no, lanza; la BD lo refuerza con CHECK).
   */
  setStatus(id: string, status: ContentStatus): Promise<Transformation | null>;
  /**
   * Confirma/retira el consentimiento para publicar las imágenes. Al confirmar guarda
   * fecha y autor; al retirarlo baja automáticamente a `draft` (deja de verse en la landing).
   */
  setConsent(id: string, confirmed: boolean): Promise<Transformation | null>;
  reorder(orderedIds: string[]): Promise<void>;
  /** Soft-delete. */
  deleteTransformation(id: string): Promise<boolean>;
}

export interface ContentRepository {
  getBenefits(): Promise<Benefit[]>;
  getNavLinks(): Promise<NavLink[]>;
}

/**
 * CMS de la seccion "Descubre": el coach administra rutinas destacadas, categorias
 * y articulos (CRUD + publicar/despublicar). Persistido en localStorage.
 */
export interface DiscoverRepository {
  getRoutines(): Promise<DiscoverRoutine[]>;
  createRoutine(input: CreateDiscoverRoutine): Promise<DiscoverRoutine>;
  updateRoutine(
    id: string,
    patch: Partial<CreateDiscoverRoutine>,
  ): Promise<DiscoverRoutine | null>;
  deleteRoutine(id: string): Promise<boolean>;
  setRoutinePublished(id: string, published: boolean): Promise<DiscoverRoutine | null>;

  getCategories(): Promise<DiscoverCategory[]>;
  createCategory(input: CreateDiscoverCategory): Promise<DiscoverCategory>;
  updateCategory(
    id: string,
    patch: Partial<CreateDiscoverCategory>,
  ): Promise<DiscoverCategory | null>;
  deleteCategory(id: string): Promise<boolean>;
  setCategoryPublished(id: string, published: boolean): Promise<DiscoverCategory | null>;

  getArticles(): Promise<DiscoverArticle[]>;
  createArticle(input: CreateDiscoverArticle): Promise<DiscoverArticle>;
  updateArticle(
    id: string,
    patch: Partial<CreateDiscoverArticle>,
  ): Promise<DiscoverArticle | null>;
  deleteArticle(id: string): Promise<boolean>;
  setArticlePublished(id: string, published: boolean): Promise<DiscoverArticle | null>;
}

/**
 * CMS del contenido del onboarding: el coach administra mensajes motivacionales,
 * recompensas y textos de prediccion (CRUD + publicar/despublicar). Persistido en
 * localStorage. El onboarding y la pantalla de prediccion consumen solo lo publicado.
 */
export interface OnboardingContentRepository {
  getMessages(): Promise<OnboardingMessage[]>;
  createMessage(input: CreateOnboardingMessage): Promise<OnboardingMessage>;
  updateMessage(
    id: string,
    patch: Partial<CreateOnboardingMessage>,
  ): Promise<OnboardingMessage | null>;
  deleteMessage(id: string): Promise<boolean>;
  setMessagePublished(
    id: string,
    published: boolean,
  ): Promise<OnboardingMessage | null>;

  getRewards(): Promise<OnboardingReward[]>;
  createReward(input: CreateOnboardingReward): Promise<OnboardingReward>;
  updateReward(
    id: string,
    patch: Partial<CreateOnboardingReward>,
  ): Promise<OnboardingReward | null>;
  deleteReward(id: string): Promise<boolean>;
  setRewardPublished(
    id: string,
    published: boolean,
  ): Promise<OnboardingReward | null>;

  getPredictions(): Promise<OnboardingPrediction[]>;
  createPrediction(
    input: CreateOnboardingPrediction,
  ): Promise<OnboardingPrediction>;
  updatePrediction(
    id: string,
    patch: Partial<CreateOnboardingPrediction>,
  ): Promise<OnboardingPrediction | null>;
  deletePrediction(id: string): Promise<boolean>;
  setPredictionPublished(
    id: string,
    published: boolean,
  ): Promise<OnboardingPrediction | null>;
}

/**
 * Configuracion del negocio (white-label). Registro unico editable por el coach;
 * al migrar a base de datos solo cambia esta implementacion.
 */
export interface SettingsRepository {
  get(): Promise<BusinessSettings>;
  save(patch: Partial<BusinessSettings>): Promise<BusinessSettings>;
}

/**
 * Metadatos CRM por entidad (etapa manual, notas, proxima accion, seguimiento e
 * historial). Persistidos aparte para no tocar los modelos de lead/cliente.
 */
export interface CrmRepository {
  getRecords(): Promise<CrmRecord[]>;
  getRecord(entityId: string): Promise<CrmRecord | null>;
  upsert(entityId: string, patch: Partial<Omit<CrmRecord, "entityId">>): Promise<CrmRecord>;
  /** Cambia la etapa y agrega la entrada al historial. */
  setStage(entityId: string, stage: CrmStage): Promise<CrmRecord>;
}

/**
 * Estado "leido" de las notificaciones (las notificaciones se DERIVAN de datos
 * reales; aqui solo se guarda que ids ya vio el coach).
 */
export interface NotificationsRepository {
  getReadIds(): Promise<string[]>;
  markRead(id: string): Promise<string[]>;
  markAllRead(ids: string[]): Promise<string[]>;
}

export interface ClientRepository {
  getClients(): Promise<Client[]>;
  findByUserId(userId: string): Promise<Client | null>;
  createClient(input: CreateClientInput): Promise<Client>;
  updateClient(
    id: string,
    patch: Partial<Omit<Client, "id">>,
  ): Promise<Client | null>;
  /** Elimina el cliente local. Devuelve true si existía y se borró. */
  deleteClient(id: string): Promise<boolean>;
}

export interface LeadRepository {
  getLeads(): Promise<Lead[]>;
  createLead(input: CreateLeadInput): Promise<Lead>;
  createEvaluationLead(input: CreateEvaluationLeadInput): Promise<Lead>;
  updateStatus(id: string, status: LeadStatus): Promise<Lead | null>;
  updateLead(id: string, patch: Partial<Omit<Lead, "id">>): Promise<Lead | null>;
  deleteLead(id: string): Promise<boolean>;
}

/** Onboarding pendiente: se guarda al terminar el wizard y se consume en el registro. */
export interface PendingEvaluationRepository {
  get(): Promise<PendingOnboarding | null>;
  save(data: PendingOnboarding): Promise<void>;
  clear(): Promise<void>;
}

export interface ProgressRepository {
  getForClient(clientId: string): Promise<ClientProgress>;
  saveForClient(
    clientId: string,
    progress: ClientProgress,
  ): Promise<ClientProgress>;
  /** Elimina el progreso persistido de un cliente (al borrar el alumno). */
  removeForClient(clientId: string): Promise<void>;
}

export interface UserRepository {
  getUsers(): Promise<User[]>;
  findByCredentials(credentials: Credentials): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(input: RegisterInput): Promise<User>;
}

/**
 * Programas de entrenamiento (builder real del coach). CRUD de programas + dias +
 * ejercicios, asignacion a alumnos y progreso de entrenamientos completados.
 * Todo persistido en localStorage (clientId -> programId, clientId -> dias hechos).
 */
export interface TrainingProgramRepository {
  getPrograms(): Promise<TrainingProgram[]>;
  getProgram(id: string): Promise<TrainingProgram | null>;
  createProgram(input: CreateTrainingProgramInput): Promise<TrainingProgram>;
  updateProgram(
    id: string,
    patch: Partial<CreateTrainingProgramInput>,
  ): Promise<TrainingProgram | null>;
  deleteProgram(id: string): Promise<boolean>;
  addDay(programId: string, name: string): Promise<TrainingProgram | null>;
  deleteDay(programId: string, dayId: string): Promise<TrainingProgram | null>;
  /** Duplica un dia con sus ejercicios (nuevos ids) justo despues del original. */
  duplicateDay(programId: string, dayId: string): Promise<TrainingProgram | null>;
  addExercise(
    programId: string,
    dayId: string,
    exercise: CreateTrainingExercise,
  ): Promise<TrainingProgram | null>;
  deleteExercise(
    programId: string,
    dayId: string,
    exerciseId: string,
  ): Promise<TrainingProgram | null>;
  /** Duplica un ejercicio (nuevo id) justo despues del original en el mismo dia. */
  duplicateExercise(
    programId: string,
    dayId: string,
    exerciseId: string,
  ): Promise<TrainingProgram | null>;
  /** Mueve un ejercicio una posicion arriba o abajo dentro de su dia. */
  moveExercise(
    programId: string,
    dayId: string,
    exerciseId: string,
    direction: "up" | "down",
  ): Promise<TrainingProgram | null>;
  /** Asigna un programa a un alumno (clientId -> programId). */
  assignToClient(clientId: string, programId: string): Promise<void>;
  getAssignment(clientId: string): Promise<string | null>;
  /** Ids de los dias que el alumno marco como completados. */
  getWorkoutProgress(clientId: string): Promise<string[]>;
  setDayCompleted(
    clientId: string,
    dayId: string,
    done: boolean,
  ): Promise<string[]>;
  /** Series completadas por ejercicio del alumno: exerciseInstanceId -> indices. */
  getExerciseProgress(clientId: string): Promise<Record<string, number[]>>;
  toggleSeries(
    clientId: string,
    exerciseInstanceId: string,
    seriesIndex: number,
    done: boolean,
  ): Promise<Record<string, number[]>>;
  /** Sesiones de entrenamiento completadas (modo entrenamiento), por cliente. */
  getWorkoutResults(clientId: string): Promise<WorkoutResult[]>;
  addWorkoutResult(
    clientId: string,
    result: CreateWorkoutResult,
  ): Promise<WorkoutResult>;
}

/**
 * Planes de nutricion (modulo real del coach). CRUD de planes + dias + comidas,
 * asignacion a alumnos y progreso de comidas completadas. Todo en localStorage.
 */
export interface NutritionPlanRepository {
  getPlans(): Promise<NutritionPlan[]>;
  getPlan(id: string): Promise<NutritionPlan | null>;
  createPlan(input: CreateNutritionPlanInput): Promise<NutritionPlan>;
  updatePlan(
    id: string,
    patch: Partial<CreateNutritionPlanInput>,
  ): Promise<NutritionPlan | null>;
  deletePlan(id: string): Promise<boolean>;
  addDay(planId: string, name: string): Promise<NutritionPlan | null>;
  deleteDay(planId: string, dayId: string): Promise<NutritionPlan | null>;
  addMeal(
    planId: string,
    dayId: string,
    meal: CreateNutritionPlanMeal,
  ): Promise<NutritionPlan | null>;
  deleteMeal(
    planId: string,
    dayId: string,
    mealId: string,
  ): Promise<NutritionPlan | null>;
  /** Asigna un plan a un alumno (clientId -> planId). */
  assignToClient(clientId: string, planId: string): Promise<void>;
  getAssignment(clientId: string): Promise<string | null>;
  /** Ids de las comidas que el alumno marco como completadas. */
  getMealProgress(clientId: string): Promise<string[]>;
  setMealCompleted(
    clientId: string,
    mealId: string,
    done: boolean,
  ): Promise<string[]>;
}

/**
 * Biblioteca de ejercicios (catalogo del coach). CRUD persistido en localStorage;
 * los programas referencian estos ejercicios por id.
 */
export interface ExerciseLibraryRepository {
  getExercises(): Promise<LibraryExercise[]>;
  getExercise(id: string): Promise<LibraryExercise | null>;
  /** Categorías de la org (taxonomía `exercise_categories`), por `position`. */
  getCategories(): Promise<ExerciseCategory[]>;
  createExercise(input: CreateLibraryExerciseInput): Promise<LibraryExercise>;
  updateExercise(
    id: string,
    patch: Partial<CreateLibraryExerciseInput>,
  ): Promise<LibraryExercise | null>;
  /** Publica/oculta el ejercicio en el catálogo (Descubre). No afecta programas. */
  setVisibility(
    id: string,
    visibility: "private" | "public",
  ): Promise<LibraryExercise | null>;
  deleteExercise(id: string): Promise<boolean>;
}

/**
 * Datos interactivos del dashboard premium del alumno (persistidos por cliente):
 * fotos de progreso y estado de los checklists (objetivos, nutricion, recordatorios).
 */
export interface CoachingRepository {
  getPhotos(clientId: string): Promise<ProgressPhoto[]>;
  addPhoto(clientId: string, photo: CreateProgressPhoto): Promise<ProgressPhoto>;
  getChecks(clientId: string): Promise<ChecklistChecks>;
  setCheck(
    clientId: string,
    listKey: string,
    itemKey: string,
    done: boolean,
  ): Promise<ChecklistChecks>;
  /** Mensajes del chat con el coach, persistidos por cliente. */
  getChat(clientId: string): Promise<ChatMessage[]>;
  addChatMessage(clientId: string, message: ChatMessage): Promise<ChatMessage[]>;
  /** Elimina fotos y checklists de un cliente (al borrar el alumno). */
  removeClient(clientId: string): Promise<void>;
}

/**
 * Planes comerciales (administra el coach). CRUD + activar/desactivar + recomendado +
 * reordenar (drag & drop) + plan contratado por alumno. Todo persistido (Local/Supabase).
 */
export interface PlansRepository {
  /** Todos los planes (coach), ordenados por `position`. */
  getPlans(): Promise<Plan[]>;
  /** Solo planes ACTIVOS (landing pública), ordenados por `position`. */
  getActivePlans(): Promise<Plan[]>;
  createPlan(input: CreatePlanInput): Promise<Plan>;
  updatePlan(id: string, patch: Partial<CreatePlanInput>): Promise<Plan | null>;
  deletePlan(id: string): Promise<boolean>;
  setActive(id: string, active: boolean): Promise<Plan | null>;
  /** Marca este plan como el recomendado (y desmarca los demás). */
  setRecommended(id: string): Promise<void>;
  /** Reordena por lista de ids (drag & drop). */
  reorder(orderedIds: string[]): Promise<void>;
  /** Plan contratado por un alumno (perfil), por clientId; null si no tiene. */
  getClientPlan(clientId: string): Promise<ClientPlan | null>;
  /** Asigna/cambia el plan contratado de un alumno (registro con plan / cambio del coach). */
  assignPlan(clientId: string, planId: string, planName: string): Promise<ClientPlan>;
}
