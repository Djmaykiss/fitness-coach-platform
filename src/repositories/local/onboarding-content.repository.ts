import {
  onboardingMessagesSeed,
  onboardingPredictionsSeed,
  onboardingRewardsSeed,
} from "@/data/onboarding-content";
import { resolveMock } from "@/repositories/async";
import type { OnboardingContentRepository } from "@/repositories/types";
import {
  STORAGE_KEYS,
  readCollection,
  writeCollection,
} from "@/lib/local-store";
import type {
  CreateOnboardingMessage,
  CreateOnboardingPrediction,
  CreateOnboardingReward,
  OnboardingMessage,
  OnboardingPrediction,
  OnboardingReward,
} from "@/types";

function id(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

/** Item generico con id + published. */
type Publishable = { id: string; published: boolean };

/**
 * CMS del contenido del onboarding persistido en localStorage. Los seeds solo
 * siembran las colecciones la primera vez; el coach las administra por completo
 * desde /admin (CRUD + publicar/despublicar). Mismo patron que Descubre.
 */
export class LocalOnboardingContentRepository
  implements OnboardingContentRepository
{
  private read<T>(key: string, seed: T[]): T[] {
    return readCollection<T>(key, seed);
  }

  private create<T extends Publishable, I>(
    key: string,
    seed: T[],
    input: I,
    prefix: string,
  ): T {
    const items = this.read<T>(key, seed);
    const item = { id: id(prefix), ...input, published: true } as unknown as T;
    items.unshift(item);
    writeCollection(key, items);
    return item;
  }

  private update<T extends Publishable, I>(
    key: string,
    seed: T[],
    itemId: string,
    patch: Partial<I>,
  ): T | null {
    const items = this.read<T>(key, seed);
    const index = items.findIndex((x) => x.id === itemId);
    if (index === -1) return null;
    const updated = { ...items[index], ...patch } as T;
    items[index] = updated;
    writeCollection(key, items);
    return updated;
  }

  private remove<T extends Publishable>(
    key: string,
    seed: T[],
    itemId: string,
  ): boolean {
    const items = this.read<T>(key, seed);
    const next = items.filter((x) => x.id !== itemId);
    const removed = next.length !== items.length;
    if (removed) writeCollection(key, next);
    return removed;
  }

  private publish<T extends Publishable>(
    key: string,
    seed: T[],
    itemId: string,
    published: boolean,
  ): T | null {
    const items = this.read<T>(key, seed);
    const index = items.findIndex((x) => x.id === itemId);
    if (index === -1) return null;
    const updated = { ...items[index], published } as T;
    items[index] = updated;
    writeCollection(key, items);
    return updated;
  }

  /* ---- Mensajes motivacionales ---- */
  getMessages() {
    return resolveMock(
      this.read<OnboardingMessage>(
        STORAGE_KEYS.onboardingMessages,
        onboardingMessagesSeed,
      ),
    );
  }
  createMessage(input: CreateOnboardingMessage) {
    return resolveMock(
      this.create<OnboardingMessage, CreateOnboardingMessage>(
        STORAGE_KEYS.onboardingMessages,
        onboardingMessagesSeed,
        input,
        "om",
      ),
    );
  }
  updateMessage(itemId: string, patch: Partial<CreateOnboardingMessage>) {
    return resolveMock(
      this.update<OnboardingMessage, CreateOnboardingMessage>(
        STORAGE_KEYS.onboardingMessages,
        onboardingMessagesSeed,
        itemId,
        patch,
      ),
    );
  }
  deleteMessage(itemId: string) {
    return resolveMock(
      this.remove(
        STORAGE_KEYS.onboardingMessages,
        onboardingMessagesSeed,
        itemId,
      ),
    );
  }
  setMessagePublished(itemId: string, published: boolean) {
    return resolveMock(
      this.publish(
        STORAGE_KEYS.onboardingMessages,
        onboardingMessagesSeed,
        itemId,
        published,
      ),
    );
  }

  /* ---- Recompensas ---- */
  getRewards() {
    return resolveMock(
      this.read<OnboardingReward>(
        STORAGE_KEYS.onboardingRewards,
        onboardingRewardsSeed,
      ),
    );
  }
  createReward(input: CreateOnboardingReward) {
    return resolveMock(
      this.create<OnboardingReward, CreateOnboardingReward>(
        STORAGE_KEYS.onboardingRewards,
        onboardingRewardsSeed,
        input,
        "or",
      ),
    );
  }
  updateReward(itemId: string, patch: Partial<CreateOnboardingReward>) {
    return resolveMock(
      this.update<OnboardingReward, CreateOnboardingReward>(
        STORAGE_KEYS.onboardingRewards,
        onboardingRewardsSeed,
        itemId,
        patch,
      ),
    );
  }
  deleteReward(itemId: string) {
    return resolveMock(
      this.remove(STORAGE_KEYS.onboardingRewards, onboardingRewardsSeed, itemId),
    );
  }
  setRewardPublished(itemId: string, published: boolean) {
    return resolveMock(
      this.publish(
        STORAGE_KEYS.onboardingRewards,
        onboardingRewardsSeed,
        itemId,
        published,
      ),
    );
  }

  /* ---- Predicciones ---- */
  getPredictions() {
    return resolveMock(
      this.read<OnboardingPrediction>(
        STORAGE_KEYS.onboardingPredictions,
        onboardingPredictionsSeed,
      ),
    );
  }
  createPrediction(input: CreateOnboardingPrediction) {
    return resolveMock(
      this.create<OnboardingPrediction, CreateOnboardingPrediction>(
        STORAGE_KEYS.onboardingPredictions,
        onboardingPredictionsSeed,
        input,
        "op",
      ),
    );
  }
  updatePrediction(itemId: string, patch: Partial<CreateOnboardingPrediction>) {
    return resolveMock(
      this.update<OnboardingPrediction, CreateOnboardingPrediction>(
        STORAGE_KEYS.onboardingPredictions,
        onboardingPredictionsSeed,
        itemId,
        patch,
      ),
    );
  }
  deletePrediction(itemId: string) {
    return resolveMock(
      this.remove(
        STORAGE_KEYS.onboardingPredictions,
        onboardingPredictionsSeed,
        itemId,
      ),
    );
  }
  setPredictionPublished(itemId: string, published: boolean) {
    return resolveMock(
      this.publish(
        STORAGE_KEYS.onboardingPredictions,
        onboardingPredictionsSeed,
        itemId,
        published,
      ),
    );
  }
}
