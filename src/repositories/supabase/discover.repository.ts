import type { DiscoverRepository } from "@/repositories/types";
import type {
  CreateDiscoverArticle,
  CreateDiscoverCategory,
  CreateDiscoverRoutine,
  DiscoverArticle,
  DiscoverCategory,
  DiscoverRoutine,
} from "@/types";
import { publishableEntity, str, bool, strArr, type Row } from "@/repositories/supabase/content-crud";

/**
 * SupabaseDiscoverRepository (Bloque 2). CMS de "Descubre" sobre `discover_routines`,
 * `discover_categories` y `discover_articles`. Misma interfaz que `LocalDiscoverRepository`.
 */

const rowToRoutine = (r: Row): DiscoverRoutine => ({
  id: str(r, "id"),
  name: str(r, "name"),
  category: str(r, "category"),
  level: str(r, "level"),
  duration: str(r, "duration"),
  minutes: str(r, "minutes"),
  description: str(r, "description"),
  image: str(r, "image"),
  published: bool(r, "published"),
});

const rowToCategory = (r: Row): DiscoverCategory => ({
  id: str(r, "id"),
  label: str(r, "label"),
  description: str(r, "description"),
  icon: str(r, "icon"),
  muscleGroups: strArr(r, "muscle_groups"),
  published: bool(r, "published"),
});

const rowToArticle = (r: Row): DiscoverArticle => ({
  id: str(r, "id"),
  title: str(r, "title"),
  category: str(r, "category"),
  readTime: str(r, "read_time"),
  content: str(r, "content"),
  image: str(r, "image"),
  published: bool(r, "published"),
});

export class SupabaseDiscoverRepository implements DiscoverRepository {
  private routines = publishableEntity<DiscoverRoutine, CreateDiscoverRoutine>(
    "discover_routines",
    rowToRoutine,
  );
  private categories = publishableEntity<DiscoverCategory, CreateDiscoverCategory>(
    "discover_categories",
    rowToCategory,
  );
  private articles = publishableEntity<DiscoverArticle, CreateDiscoverArticle>(
    "discover_articles",
    rowToArticle,
  );

  getRoutines() {
    return this.routines.list();
  }
  createRoutine(input: CreateDiscoverRoutine) {
    return this.routines.create(input);
  }
  updateRoutine(id: string, patch: Partial<CreateDiscoverRoutine>) {
    return this.routines.update(id, patch);
  }
  deleteRoutine(id: string) {
    return this.routines.remove(id);
  }
  setRoutinePublished(id: string, published: boolean) {
    return this.routines.setPublished(id, published);
  }

  getCategories() {
    return this.categories.list();
  }
  createCategory(input: CreateDiscoverCategory) {
    return this.categories.create(input);
  }
  updateCategory(id: string, patch: Partial<CreateDiscoverCategory>) {
    return this.categories.update(id, patch);
  }
  deleteCategory(id: string) {
    return this.categories.remove(id);
  }
  setCategoryPublished(id: string, published: boolean) {
    return this.categories.setPublished(id, published);
  }

  getArticles() {
    return this.articles.list();
  }
  createArticle(input: CreateDiscoverArticle) {
    return this.articles.create(input);
  }
  updateArticle(id: string, patch: Partial<CreateDiscoverArticle>) {
    return this.articles.update(id, patch);
  }
  deleteArticle(id: string) {
    return this.articles.remove(id);
  }
  setArticlePublished(id: string, published: boolean) {
    return this.articles.setPublished(id, published);
  }
}
