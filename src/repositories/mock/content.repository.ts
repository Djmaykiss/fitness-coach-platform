import { benefits } from "@/data/benefits";
import { navLinks } from "@/data/site";
import { resolveMock } from "@/repositories/async";
import type { ContentRepository } from "@/repositories/types";

export class MockContentRepository implements ContentRepository {
  getBenefits() {
    return resolveMock(benefits);
  }

  getNavLinks() {
    return resolveMock(navLinks);
  }
}
