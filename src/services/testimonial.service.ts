import { testimonialRepository } from "@/repositories";
import type { ContentStatus, CreateTestimonialInput } from "@/types";

/**
 * Testimonios (patrón universal de contenido). El COACH administra todo (CRUD +
 * publicar/archivar + reordenar) desde `/admin`; la LANDING muestra solo los `public`.
 * La UI nunca toca el repositorio.
 */
export const testimonialService = {
  /* ---- Público / landing ---- */
  getPublishedTestimonials: () => testimonialRepository.getPublishedTestimonials(),

  /* ---- Coach: administración ---- */
  getTestimonials: () => testimonialRepository.getTestimonials(),
  createTestimonial: (input: CreateTestimonialInput) =>
    testimonialRepository.createTestimonial(input),
  updateTestimonial: (id: string, patch: Partial<CreateTestimonialInput>) =>
    testimonialRepository.updateTestimonial(id, patch),
  setStatus: (id: string, status: ContentStatus) =>
    testimonialRepository.setStatus(id, status),
  reorder: (orderedIds: string[]) => testimonialRepository.reorder(orderedIds),
  deleteTestimonial: (id: string) => testimonialRepository.deleteTestimonial(id),
};
