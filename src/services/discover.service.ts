import { discoverRepository } from "@/repositories";

/**
 * Contenido de la seccion "Descubre" del alumno. La UI lo consume por aqui, nunca
 * toca el repositorio directamente.
 */
export const discoverService = {
  getRoutines: () => discoverRepository.getRoutines(),
  getCategories: () => discoverRepository.getCategories(),
  getArticles: () => discoverRepository.getArticles(),
};
