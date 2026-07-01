import { onboardingContentRepository } from "@/repositories";
import type {
  CreateOnboardingMessage,
  CreateOnboardingPrediction,
  CreateOnboardingReward,
} from "@/types";

/**
 * Contenido del onboarding administrado por el coach. El onboarding y la pantalla
 * de prediccion consumen SOLO lo PUBLICADO (`getPublished*`); el COACH administra
 * todo (CRUD + publicar/despublicar) desde el panel. La UI nunca toca el
 * repositorio directamente.
 */
export const onboardingContentService = {
  /* ---- Onboarding / prediccion: solo contenido publicado ---- */
  async getPublishedMessages() {
    const all = await onboardingContentRepository.getMessages();
    return all.filter((m) => m.published);
  },
  async getPublishedRewards() {
    const all = await onboardingContentRepository.getRewards();
    return all.filter((r) => r.published);
  },
  async getPublishedPredictions() {
    const all = await onboardingContentRepository.getPredictions();
    return all.filter((p) => p.published);
  },

  /* ---- Coach: administracion (todos los items) ---- */
  getMessages: () => onboardingContentRepository.getMessages(),
  createMessage: (input: CreateOnboardingMessage) =>
    onboardingContentRepository.createMessage(input),
  updateMessage: (id: string, patch: Partial<CreateOnboardingMessage>) =>
    onboardingContentRepository.updateMessage(id, patch),
  deleteMessage: (id: string) => onboardingContentRepository.deleteMessage(id),
  setMessagePublished: (id: string, published: boolean) =>
    onboardingContentRepository.setMessagePublished(id, published),

  getRewards: () => onboardingContentRepository.getRewards(),
  createReward: (input: CreateOnboardingReward) =>
    onboardingContentRepository.createReward(input),
  updateReward: (id: string, patch: Partial<CreateOnboardingReward>) =>
    onboardingContentRepository.updateReward(id, patch),
  deleteReward: (id: string) => onboardingContentRepository.deleteReward(id),
  setRewardPublished: (id: string, published: boolean) =>
    onboardingContentRepository.setRewardPublished(id, published),

  getPredictions: () => onboardingContentRepository.getPredictions(),
  createPrediction: (input: CreateOnboardingPrediction) =>
    onboardingContentRepository.createPrediction(input),
  updatePrediction: (id: string, patch: Partial<CreateOnboardingPrediction>) =>
    onboardingContentRepository.updatePrediction(id, patch),
  deletePrediction: (id: string) =>
    onboardingContentRepository.deletePrediction(id),
  setPredictionPublished: (id: string, published: boolean) =>
    onboardingContentRepository.setPredictionPublished(id, published),
};
