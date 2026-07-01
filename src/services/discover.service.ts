import { discoverRepository } from "@/repositories";
import type {
  CreateDiscoverArticle,
  CreateDiscoverCategory,
  CreateDiscoverRoutine,
} from "@/types";

/**
 * Contenido de "Descubre". El ALUMNO consume solo lo PUBLICADO (`getPublished*`);
 * el COACH administra todo (CRUD + publicar/despublicar) desde el panel. La UI nunca
 * toca el repositorio directamente.
 */
export const discoverService = {
  /* ---- Alumno: solo contenido publicado ---- */
  async getPublishedRoutines() {
    const all = await discoverRepository.getRoutines();
    return all.filter((r) => r.published);
  },
  async getPublishedCategories() {
    const all = await discoverRepository.getCategories();
    return all.filter((c) => c.published);
  },
  async getPublishedArticles() {
    const all = await discoverRepository.getArticles();
    return all.filter((a) => a.published);
  },

  /* ---- Coach: administracion (todos los items) ---- */
  getRoutines: () => discoverRepository.getRoutines(),
  createRoutine: (input: CreateDiscoverRoutine) =>
    discoverRepository.createRoutine(input),
  updateRoutine: (id: string, patch: Partial<CreateDiscoverRoutine>) =>
    discoverRepository.updateRoutine(id, patch),
  deleteRoutine: (id: string) => discoverRepository.deleteRoutine(id),
  setRoutinePublished: (id: string, published: boolean) =>
    discoverRepository.setRoutinePublished(id, published),

  getCategories: () => discoverRepository.getCategories(),
  createCategory: (input: CreateDiscoverCategory) =>
    discoverRepository.createCategory(input),
  updateCategory: (id: string, patch: Partial<CreateDiscoverCategory>) =>
    discoverRepository.updateCategory(id, patch),
  deleteCategory: (id: string) => discoverRepository.deleteCategory(id),
  setCategoryPublished: (id: string, published: boolean) =>
    discoverRepository.setCategoryPublished(id, published),

  getArticles: () => discoverRepository.getArticles(),
  createArticle: (input: CreateDiscoverArticle) =>
    discoverRepository.createArticle(input),
  updateArticle: (id: string, patch: Partial<CreateDiscoverArticle>) =>
    discoverRepository.updateArticle(id, patch),
  deleteArticle: (id: string) => discoverRepository.deleteArticle(id),
  setArticlePublished: (id: string, published: boolean) =>
    discoverRepository.setArticlePublished(id, published),
};
