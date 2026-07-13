import {
  discoverArticlesSeed,
  discoverCategoriesSeed,
  discoverRoutinesSeed,
} from "@/data/discover";
import { resolveMock } from "@/repositories/async";
import type { DiscoverRepository } from "@/repositories/types";
import {
  STORAGE_KEYS,
  readSeededCollection,
  writeCollection,
} from "@/lib/local-store";
import type {
  CreateDiscoverArticle,
  CreateDiscoverCategory,
  CreateDiscoverRoutine,
  DiscoverArticle,
  DiscoverCategory,
  DiscoverRoutine,
} from "@/types";

function id(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

/** Item generico con id + published. */
type Publishable = { id: string; published: boolean };

/**
 * CMS de "Descubre" persistido en localStorage. Los seeds solo siembran las
 * colecciones la primera vez; el coach las administra por completo desde /admin.
 */
export class LocalDiscoverRepository implements DiscoverRepository {
  private read<T>(key: string, seed: T[]): T[] {
    return readSeededCollection<T>(key, seed);
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

  /* ---- Rutinas ---- */
  getRoutines() {
    return resolveMock(
      this.read<DiscoverRoutine>(STORAGE_KEYS.discoverRoutines, discoverRoutinesSeed),
    );
  }
  createRoutine(input: CreateDiscoverRoutine) {
    return resolveMock(
      this.create<DiscoverRoutine, CreateDiscoverRoutine>(
        STORAGE_KEYS.discoverRoutines,
        discoverRoutinesSeed,
        input,
        "dr",
      ),
    );
  }
  updateRoutine(itemId: string, patch: Partial<CreateDiscoverRoutine>) {
    return resolveMock(
      this.update<DiscoverRoutine, CreateDiscoverRoutine>(
        STORAGE_KEYS.discoverRoutines,
        discoverRoutinesSeed,
        itemId,
        patch,
      ),
    );
  }
  deleteRoutine(itemId: string) {
    return resolveMock(
      this.remove(STORAGE_KEYS.discoverRoutines, discoverRoutinesSeed, itemId),
    );
  }
  setRoutinePublished(itemId: string, published: boolean) {
    return resolveMock(
      this.publish(STORAGE_KEYS.discoverRoutines, discoverRoutinesSeed, itemId, published),
    );
  }

  /* ---- Categorias ---- */
  getCategories() {
    return resolveMock(
      this.read<DiscoverCategory>(STORAGE_KEYS.discoverCategories, discoverCategoriesSeed),
    );
  }
  createCategory(input: CreateDiscoverCategory) {
    return resolveMock(
      this.create<DiscoverCategory, CreateDiscoverCategory>(
        STORAGE_KEYS.discoverCategories,
        discoverCategoriesSeed,
        input,
        "dc",
      ),
    );
  }
  updateCategory(itemId: string, patch: Partial<CreateDiscoverCategory>) {
    return resolveMock(
      this.update<DiscoverCategory, CreateDiscoverCategory>(
        STORAGE_KEYS.discoverCategories,
        discoverCategoriesSeed,
        itemId,
        patch,
      ),
    );
  }
  deleteCategory(itemId: string) {
    return resolveMock(
      this.remove(STORAGE_KEYS.discoverCategories, discoverCategoriesSeed, itemId),
    );
  }
  setCategoryPublished(itemId: string, published: boolean) {
    return resolveMock(
      this.publish(STORAGE_KEYS.discoverCategories, discoverCategoriesSeed, itemId, published),
    );
  }

  /* ---- Articulos ---- */
  getArticles() {
    return resolveMock(
      this.read<DiscoverArticle>(STORAGE_KEYS.discoverArticles, discoverArticlesSeed),
    );
  }
  createArticle(input: CreateDiscoverArticle) {
    return resolveMock(
      this.create<DiscoverArticle, CreateDiscoverArticle>(
        STORAGE_KEYS.discoverArticles,
        discoverArticlesSeed,
        input,
        "da",
      ),
    );
  }
  updateArticle(itemId: string, patch: Partial<CreateDiscoverArticle>) {
    return resolveMock(
      this.update<DiscoverArticle, CreateDiscoverArticle>(
        STORAGE_KEYS.discoverArticles,
        discoverArticlesSeed,
        itemId,
        patch,
      ),
    );
  }
  deleteArticle(itemId: string) {
    return resolveMock(
      this.remove(STORAGE_KEYS.discoverArticles, discoverArticlesSeed, itemId),
    );
  }
  setArticlePublished(itemId: string, published: boolean) {
    return resolveMock(
      this.publish(STORAGE_KEYS.discoverArticles, discoverArticlesSeed, itemId, published),
    );
  }
}
