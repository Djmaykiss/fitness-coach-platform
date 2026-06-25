import {
  contentRepository,
  programRepository,
  testimonialRepository,
  transformationRepository,
} from "@/repositories";

/**
 * Servicio de la landing. Los componentes consumen estos metodos y nunca
 * importan datos ni repositorios directamente.
 */
export const landingService = {
  getNavLinks: () => contentRepository.getNavLinks(),
  getPrograms: () => programRepository.getPrograms(),
  getTransformations: () => transformationRepository.getTransformations(),
  getTestimonials: () => testimonialRepository.getTestimonials(),
  getBenefits: () => contentRepository.getBenefits(),
};
