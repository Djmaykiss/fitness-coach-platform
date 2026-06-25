import { transformations } from "@/data/transformations";
import { resolveMock } from "@/repositories/async";
import type { TransformationRepository } from "@/repositories/types";

export class MockTransformationRepository implements TransformationRepository {
  getTransformations() {
    return resolveMock(transformations);
  }
}
