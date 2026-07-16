import { transformationRepository } from "@/repositories";
import type { ContentStatus, CreateTransformationInput } from "@/types";

/**
 * Transformaciones (Antes/Después) de marketing (patrón universal de contenido). El
 * COACH administra todo (CRUD + publicar/archivar + consentimiento + reordenar) desde
 * `/admin`; la LANDING muestra solo `public` CON consentimiento confirmado. La UI nunca
 * toca el repositorio.
 */
export const transformationService = {
  /* ---- Público / landing ---- */
  getPublishedTransformations: () =>
    transformationRepository.getPublishedTransformations(),

  /* ---- Coach: administración ---- */
  getTransformations: () => transformationRepository.getTransformations(),
  createTransformation: (input: CreateTransformationInput) =>
    transformationRepository.createTransformation(input),
  updateTransformation: (id: string, patch: Partial<CreateTransformationInput>) =>
    transformationRepository.updateTransformation(id, patch),
  setStatus: (id: string, status: ContentStatus) =>
    transformationRepository.setStatus(id, status),
  setConsent: (id: string, confirmed: boolean) =>
    transformationRepository.setConsent(id, confirmed),
  reorder: (orderedIds: string[]) => transformationRepository.reorder(orderedIds),
  deleteTransformation: (id: string) =>
    transformationRepository.deleteTransformation(id),
};
