import { resolveMock } from "@/repositories/async";
import type { PendingEvaluationRepository } from "@/repositories/types";
import {
  STORAGE_KEYS,
  readValue,
  removeKey,
  writeValue,
} from "@/lib/local-store";
import type { PendingOnboarding } from "@/types";

/**
 * Onboarding temporal entre la landing y el registro (/register): nombre, email
 * y evaluacion. Se guarda al presionar "Quiero comenzar" y se consume al crear
 * la cuenta (o se limpia al entrar a /login).
 */
export class LocalPendingEvaluationRepository
  implements PendingEvaluationRepository
{
  get() {
    return resolveMock(
      readValue<PendingOnboarding>(STORAGE_KEYS.pendingEvaluation),
    );
  }

  save(data: PendingOnboarding) {
    writeValue(STORAGE_KEYS.pendingEvaluation, data);
    return resolveMock<void>(undefined);
  }

  clear() {
    removeKey(STORAGE_KEYS.pendingEvaluation);
    return resolveMock<void>(undefined);
  }
}
