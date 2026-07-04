import { MockContentRepository } from "@/repositories/mock/content.repository";
import { LocalDiscoverRepository } from "@/repositories/local/discover.repository";
import { LocalOnboardingContentRepository } from "@/repositories/local/onboarding-content.repository";
import { LocalSettingsRepository } from "@/repositories/local/settings.repository";
import { SupabaseSettingsRepository } from "@/repositories/supabase/settings.repository";
import { SupabaseDiscoverRepository } from "@/repositories/supabase/discover.repository";
import { SupabaseOnboardingContentRepository } from "@/repositories/supabase/onboarding-content.repository";
import { SupabaseExerciseLibraryRepository } from "@/repositories/supabase/exercise-library.repository";
import { SupabaseLeadRepository } from "@/repositories/supabase/lead.repository";
import { SupabaseClientRepository } from "@/repositories/supabase/client.repository";
import { SupabaseProgressRepository } from "@/repositories/supabase/progress.repository";
import { SupabaseTrainingProgramRepository } from "@/repositories/supabase/training-program.repository";
import { SupabaseNutritionPlanRepository } from "@/repositories/supabase/nutrition-plan.repository";
import { LocalCrmRepository } from "@/repositories/local/crm.repository";
import { LocalNotificationsRepository } from "@/repositories/local/notifications.repository";
import { MockTestimonialRepository } from "@/repositories/mock/testimonial.repository";
import { MockTransformationRepository } from "@/repositories/mock/transformation.repository";
import { LocalClientRepository } from "@/repositories/local/client.repository";
import { LocalLeadRepository } from "@/repositories/local/lead.repository";
import { LocalProgramRepository } from "@/repositories/local/program.repository";
import { LocalProgressRepository } from "@/repositories/local/progress.repository";
import { LocalTrainingProgramRepository } from "@/repositories/local/training-program.repository";
import { LocalExerciseLibraryRepository } from "@/repositories/local/exercise-library.repository";
import { LocalNutritionPlanRepository } from "@/repositories/local/nutrition-plan.repository";
import { LocalPendingEvaluationRepository } from "@/repositories/local/pending-evaluation.repository";
import { LocalCoachingRepository } from "@/repositories/local/coaching.repository";
import { LocalUserRepository } from "@/repositories/local/user.repository";
import type {
  ClientRepository,
  CoachingRepository,
  ContentRepository,
  DiscoverRepository,
  LeadRepository,
  OnboardingContentRepository,
  PendingEvaluationRepository,
  SettingsRepository,
  CrmRepository,
  NotificationsRepository,
  ExerciseLibraryRepository,
  NutritionPlanRepository,
  ProgramRepository,
  ProgressRepository,
  TestimonialRepository,
  TrainingProgramRepository,
  TransformationRepository,
  UserRepository,
} from "@/repositories/types";
import { pickRepository } from "@/repositories/backend";

/**
 * Punto unico de cableado de la capa de datos.
 *
 * - `Mock*`  -> contenido de marketing estatico (lo lee la landing en servidor).
 * - `Local*` -> datos operativos persistidos en localStorage (solo cliente).
 *
 * MIGRACION A SUPABASE (APP_MIGRATION_PLAN.md): los repos migrables pasan por
 * `pickRepository(key, Local, () => new Supabase...)`. Mientras no exista factoria
 * Supabase (Bloque 0), `pickRepository` devuelve SIEMPRE la implementacion `Local`
 * (sin cambio de comportamiento). Cuando un repo se migre, se agrega su factoria aqui
 * y el flag `NEXT_PUBLIC_DATA_BACKEND` / `NEXT_PUBLIC_SUPABASE_REPOS` decide cual usar.
 * Servicios, componentes y paginas no se tocan (dependen de las interfaces).
 */

/* --- No migran: marketing estatico (Mock*) + ProgramRow legacy + pending (localStorage) --- */
export const programRepository: ProgramRepository = new LocalProgramRepository();
export const testimonialRepository: TestimonialRepository =
  new MockTestimonialRepository();
export const transformationRepository: TransformationRepository =
  new MockTransformationRepository();
export const contentRepository: ContentRepository = new MockContentRepository();
export const pendingEvaluationRepository: PendingEvaluationRepository =
  new LocalPendingEvaluationRepository();

/* --- Migrables (hoy Local; Supabase se enchufa por bloque segun el plan) --- */
export const discoverRepository: DiscoverRepository = pickRepository<DiscoverRepository>(
  "discover",
  new LocalDiscoverRepository(),
  () => new SupabaseDiscoverRepository(),
);
export const onboardingContentRepository: OnboardingContentRepository =
  pickRepository<OnboardingContentRepository>(
    "onboardingContent",
    new LocalOnboardingContentRepository(),
    () => new SupabaseOnboardingContentRepository(),
  );
export const settingsRepository: SettingsRepository = pickRepository(
  "settings",
  new LocalSettingsRepository(),
  () => new SupabaseSettingsRepository(),
);
export const crmRepository: CrmRepository = pickRepository(
  "crm",
  new LocalCrmRepository(),
);
export const notificationsRepository: NotificationsRepository = pickRepository(
  "notifications",
  new LocalNotificationsRepository(),
);
export const clientRepository: ClientRepository = pickRepository<ClientRepository>(
  "client",
  new LocalClientRepository(),
  () => new SupabaseClientRepository(),
);
export const leadRepository: LeadRepository = pickRepository<LeadRepository>(
  "lead",
  new LocalLeadRepository(),
  () => new SupabaseLeadRepository(),
);
export const progressRepository: ProgressRepository = pickRepository<ProgressRepository>(
  "progress",
  new LocalProgressRepository(),
  () => new SupabaseProgressRepository(),
);
export const trainingProgramRepository: TrainingProgramRepository =
  pickRepository<TrainingProgramRepository>(
    "trainingProgram",
    new LocalTrainingProgramRepository(),
    () => new SupabaseTrainingProgramRepository(),
  );
export const exerciseLibraryRepository: ExerciseLibraryRepository =
  pickRepository<ExerciseLibraryRepository>(
    "exerciseLibrary",
    new LocalExerciseLibraryRepository(),
    () => new SupabaseExerciseLibraryRepository(),
  );
export const nutritionPlanRepository: NutritionPlanRepository =
  pickRepository<NutritionPlanRepository>(
    "nutritionPlan",
    new LocalNutritionPlanRepository(),
    () => new SupabaseNutritionPlanRepository(),
  );
export const coachingRepository: CoachingRepository = pickRepository(
  "coaching",
  new LocalCoachingRepository(),
);
export const userRepository: UserRepository = pickRepository(
  "user",
  new LocalUserRepository(),
);
