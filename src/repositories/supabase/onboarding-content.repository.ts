import type { OnboardingContentRepository } from "@/repositories/types";
import type {
  CreateOnboardingMessage,
  CreateOnboardingPrediction,
  CreateOnboardingReward,
  OnboardingMessage,
  OnboardingPrediction,
  OnboardingReward,
} from "@/types";
import { publishableEntity, str, bool, type Row } from "@/repositories/supabase/content-crud";

/**
 * SupabaseOnboardingContentRepository (Bloque 2). CMS del onboarding sobre
 * `onboarding_messages`, `onboarding_rewards` y `onboarding_predictions`. Misma
 * interfaz que `LocalOnboardingContentRepository`.
 */

const rowToMessage = (r: Row): OnboardingMessage => ({
  id: str(r, "id"),
  message: str(r, "message"),
  category: str(r, "category"),
  published: bool(r, "published"),
});

const rowToReward = (r: Row): OnboardingReward => ({
  id: str(r, "id"),
  title: str(r, "title"),
  description: str(r, "description"),
  icon: str(r, "icon"),
  published: bool(r, "published"),
});

const rowToPrediction = (r: Row): OnboardingPrediction => ({
  id: str(r, "id"),
  objective: str(r, "objective"),
  title: str(r, "title"),
  body: str(r, "body"),
  timeframe: str(r, "timeframe"),
  published: bool(r, "published"),
});

export class SupabaseOnboardingContentRepository implements OnboardingContentRepository {
  private messages = publishableEntity<OnboardingMessage, CreateOnboardingMessage>(
    "onboarding_messages",
    rowToMessage,
  );
  private rewards = publishableEntity<OnboardingReward, CreateOnboardingReward>(
    "onboarding_rewards",
    rowToReward,
  );
  private predictions = publishableEntity<OnboardingPrediction, CreateOnboardingPrediction>(
    "onboarding_predictions",
    rowToPrediction,
  );

  getMessages() {
    return this.messages.list();
  }
  createMessage(input: CreateOnboardingMessage) {
    return this.messages.create(input);
  }
  updateMessage(id: string, patch: Partial<CreateOnboardingMessage>) {
    return this.messages.update(id, patch);
  }
  deleteMessage(id: string) {
    return this.messages.remove(id);
  }
  setMessagePublished(id: string, published: boolean) {
    return this.messages.setPublished(id, published);
  }

  getRewards() {
    return this.rewards.list();
  }
  createReward(input: CreateOnboardingReward) {
    return this.rewards.create(input);
  }
  updateReward(id: string, patch: Partial<CreateOnboardingReward>) {
    return this.rewards.update(id, patch);
  }
  deleteReward(id: string) {
    return this.rewards.remove(id);
  }
  setRewardPublished(id: string, published: boolean) {
    return this.rewards.setPublished(id, published);
  }

  getPredictions() {
    return this.predictions.list();
  }
  createPrediction(input: CreateOnboardingPrediction) {
    return this.predictions.create(input);
  }
  updatePrediction(id: string, patch: Partial<CreateOnboardingPrediction>) {
    return this.predictions.update(id, patch);
  }
  deletePrediction(id: string) {
    return this.predictions.remove(id);
  }
  setPredictionPublished(id: string, published: boolean) {
    return this.predictions.setPublished(id, published);
  }
}
