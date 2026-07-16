import {
  contentRepository,
  programRepository,
  testimonialRepository,
} from "@/repositories";

/**
 * Servicio de la landing. Los componentes consumen estos metodos y nunca
 * importan datos ni repositorios directamente.
 *
 * NOTA: Transformaciones ya NO se sirve aquí — es un módulo administrable por el coach
 * (patrón universal). La landing usa `transformationService.getPublishedTransformations`
 * desde `src/components/transformations-section.tsx` (cliente).
 */
export const landingService = {
  getNavLinks: () => contentRepository.getNavLinks(),
  getPrograms: () => programRepository.getPrograms(),
  getTestimonials: () => testimonialRepository.getTestimonials(),
  getBenefits: () => contentRepository.getBenefits(),
};
