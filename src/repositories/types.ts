import type {
  Benefit,
  ChecklistChecks,
  Client,
  ClientProgress,
  CreateClientInput,
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
  LibraryExercise,
  NutritionPlan,
  Lead,
  LeadStatus,
  NavLink,
  PendingOnboarding,
  Program,
  ProgramRow,
  ProgressPhoto,
  RegisterInput,
  Testimonial,
  TrainingProgram,
  Transformation,
  User,
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
  getTestimonials(): Promise<Testimonial[]>;
}

export interface TransformationRepository {
  getTransformations(): Promise<Transformation[]>;
}

export interface ContentRepository {
  getBenefits(): Promise<Benefit[]>;
  getNavLinks(): Promise<NavLink[]>;
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
  createExercise(input: CreateLibraryExerciseInput): Promise<LibraryExercise>;
  updateExercise(
    id: string,
    patch: Partial<CreateLibraryExerciseInput>,
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
  /** Elimina fotos y checklists de un cliente (al borrar el alumno). */
  removeClient(clientId: string): Promise<void>;
}
