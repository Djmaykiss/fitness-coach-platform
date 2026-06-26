import { resolveMock } from "@/repositories/async";
import type { PendingEvaluationRepository } from "@/repositories/types";
import {
  STORAGE_KEYS,
  readValue,
  removeKey,
  writeValue,
} from "@/lib/local-store";
import type { LeadEvaluation } from "@/types";

/**
 * Evaluacion temporal entre el onboarding (landing) y el registro (/register).
 * Se guarda al presionar "Quiero comenzar" y se consume al crear la cuenta.
 */
export class LocalPendingEvaluationRepository
  implements PendingEvaluationRepository
{
  get() {
    return resolveMock(
      readValue<LeadEvaluation>(STORAGE_KEYS.pendingEvaluation),
    );
  }

  save(evaluation: LeadEvaluation) {
    writeValue(STORAGE_KEYS.pendingEvaluation, evaluation);
    return resolveMock<void>(undefined);
  }

  clear() {
    removeKey(STORAGE_KEYS.pendingEvaluation);
    return resolveMock<void>(undefined);
  }
}
