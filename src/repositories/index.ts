import { MockContentRepository } from "@/repositories/mock/content.repository";
import { LocalDiscoverRepository } from "@/repositories/local/discover.repository";
import { LocalOnboardingContentRepository } from "@/repositories/local/onboarding-content.repository";
import { LocalSettingsRepository } from "@/repositories/local/settings.repository";
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
  ExerciseLibraryRepository,
  NutritionPlanRepository,
  ProgramRepository,
  ProgressRepository,
  TestimonialRepository,
  TrainingProgramRepository,
  TransformationRepository,
  UserRepository,
} from "@/repositories/types";

/**
 * Punto unico de cableado de la capa de datos.
 *
 * - `Mock*`  -> contenido de marketing estatico (lo lee la landing en servidor).
 * - `Local*` -> datos operativos persistidos en localStorage (solo cliente).
 *
 * MIGRACION FUTURA: cuando exista una implementacion contra base de datos
 * (`Db*Repository`), solo se cambia la clase instanciada aqui. Servicios,
 * componentes, paginas y dashboards no se tocan porque dependen de las
 * interfaces, no de estas clases.
 */
export const programRepository: ProgramRepository = new LocalProgramRepository();
export const testimonialRepository: TestimonialRepository =
  new MockTestimonialRepository();
export const transformationRepository: TransformationRepository =
  new MockTransformationRepository();
export const contentRepository: ContentRepository = new MockContentRepository();
export const discoverRepository: DiscoverRepository =
  new LocalDiscoverRepository();
export const onboardingContentRepository: OnboardingContentRepository =
  new LocalOnboardingContentRepository();
export const settingsRepository: SettingsRepository =
  new LocalSettingsRepository();
export const clientRepository: ClientRepository = new LocalClientRepository();
export const leadRepository: LeadRepository = new LocalLeadRepository();
export const progressRepository: ProgressRepository =
  new LocalProgressRepository();
export const trainingProgramRepository: TrainingProgramRepository =
  new LocalTrainingProgramRepository();
export const exerciseLibraryRepository: ExerciseLibraryRepository =
  new LocalExerciseLibraryRepository();
export const nutritionPlanRepository: NutritionPlanRepository =
  new LocalNutritionPlanRepository();
export const pendingEvaluationRepository: PendingEvaluationRepository =
  new LocalPendingEvaluationRepository();
export const coachingRepository: CoachingRepository =
  new LocalCoachingRepository();
export const userRepository: UserRepository = new LocalUserRepository();
