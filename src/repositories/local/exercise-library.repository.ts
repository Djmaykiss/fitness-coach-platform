import { exerciseLibrarySeed } from "@/data/exercise-library";
import { resolveMock } from "@/repositories/async";
import type { ExerciseLibraryRepository } from "@/repositories/types";
import {
  STORAGE_KEYS,
  readCollection,
  writeCollection,
} from "@/lib/local-store";
import type { CreateLibraryExerciseInput, LibraryExercise } from "@/types";

/** Biblioteca de ejercicios del coach, persistida en localStorage. */
export class LocalExerciseLibraryRepository
  implements ExerciseLibraryRepository
{
  private read(): LibraryExercise[] {
    return readCollection<LibraryExercise>(
      STORAGE_KEYS.exerciseLibrary,
      exerciseLibrarySeed,
    );
  }

  private write(items: LibraryExercise[]): void {
    writeCollection(STORAGE_KEYS.exerciseLibrary, items);
  }

  getExercises() {
    return resolveMock(this.read());
  }

  getExercise(id: string) {
    return resolveMock<LibraryExercise | null>(
      this.read().find((e) => e.id === id) ?? null,
    );
  }

  createExercise(input: CreateLibraryExerciseInput) {
    const items = this.read();
    const exercise: LibraryExercise = {
      id: `lib-${Date.now().toString(36)}${Math.random()
        .toString(36)
        .slice(2, 6)}`,
      ...input,
      name: input.name.trim(),
    };
    items.push(exercise);
    this.write(items);
    return resolveMock(exercise);
  }

  updateExercise(id: string, patch: Partial<CreateLibraryExerciseInput>) {
    const items = this.read();
    const index = items.findIndex((e) => e.id === id);
    if (index === -1) return resolveMock<LibraryExercise | null>(null);
    const updated: LibraryExercise = { ...items[index], ...patch };
    items[index] = updated;
    this.write(items);
    return resolveMock<LibraryExercise | null>(updated);
  }

  deleteExercise(id: string) {
    const items = this.read();
    const next = items.filter((e) => e.id !== id);
    const removed = next.length !== items.length;
    if (removed) this.write(next);
    return resolveMock(removed);
  }
}
