import {
  discoverArticlesSeed,
  discoverCategoriesSeed,
  discoverRoutinesSeed,
} from "@/data/discover";
import { resolveMock } from "@/repositories/async";
import type { DiscoverRepository } from "@/repositories/types";

/**
 * Contenido estatico de "Descubre" (rutinas destacadas, categorias y articulos).
 * Como es contenido de catalogo (no datos operativos del alumno) se sirve desde
 * los seeds, igual que el contenido de la landing.
 */
export class MockDiscoverRepository implements DiscoverRepository {
  getRoutines() {
    return resolveMock(discoverRoutinesSeed);
  }

  getCategories() {
    return resolveMock(discoverCategoriesSeed);
  }

  getArticles() {
    return resolveMock(discoverArticlesSeed);
  }
}
