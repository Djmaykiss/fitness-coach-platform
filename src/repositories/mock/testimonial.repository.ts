import { testimonials } from "@/data/testimonials";
import { resolveMock } from "@/repositories/async";
import type { TestimonialRepository } from "@/repositories/types";

export class MockTestimonialRepository implements TestimonialRepository {
  getTestimonials() {
    return resolveMock(testimonials);
  }
}
