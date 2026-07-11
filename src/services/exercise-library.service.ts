import { exerciseLibraryRepository } from "@/repositories";
import type { CreateLibraryExerciseInput } from "@/types";

/**
 * Biblioteca de ejercicios. El panel admin la gestiona (CRUD) y el builder de
 * programas la consume para elegir ejercicios. La UI no toca el repositorio.
 */
export const exerciseLibraryService = {
  getExercises: () => exerciseLibraryRepository.getExercises(),
  getExercise: (id: string) => exerciseLibraryRepository.getExercise(id),
  getCategories: () => exerciseLibraryRepository.getCategories(),
  createExercise: (input: CreateLibraryExerciseInput) =>
    exerciseLibraryRepository.createExercise(input),
  updateExercise: (id: string, patch: Partial<CreateLibraryExerciseInput>) =>
    exerciseLibraryRepository.updateExercise(id, patch),
  setVisibility: (id: string, visibility: "private" | "public") =>
    exerciseLibraryRepository.setVisibility(id, visibility),
  deleteExercise: (id: string) => exerciseLibraryRepository.deleteExercise(id),
};
