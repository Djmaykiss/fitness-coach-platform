import {
  programAssignmentsSeed,
  trainingProgramsSeed,
} from "@/data/training";
import { resolveMock } from "@/repositories/async";
import type { TrainingProgramRepository } from "@/repositories/types";
import {
  STORAGE_KEYS,
  readCollection,
  readRecord,
  writeCollection,
  writeRecord,
} from "@/lib/local-store";
import type {
  CreateTrainingExercise,
  CreateTrainingProgramInput,
  TrainingProgram,
} from "@/types";

function id(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

/** Programas de entrenamiento, asignaciones y progreso, persistidos en localStorage. */
export class LocalTrainingProgramRepository
  implements TrainingProgramRepository
{
  private readPrograms(): TrainingProgram[] {
    return readCollection<TrainingProgram>(
      STORAGE_KEYS.trainingPrograms,
      trainingProgramsSeed,
    );
  }

  private writePrograms(programs: TrainingProgram[]): void {
    writeCollection(STORAGE_KEYS.trainingPrograms, programs);
  }

  /** Aplica un cambio sobre un programa por id y persiste; devuelve el actualizado. */
  private mutate(
    programId: string,
    fn: (program: TrainingProgram) => TrainingProgram,
  ): TrainingProgram | null {
    const programs = this.readPrograms();
    const index = programs.findIndex((p) => p.id === programId);
    if (index === -1) return null;
    const updated = fn(programs[index]);
    programs[index] = updated;
    this.writePrograms(programs);
    return updated;
  }

  getPrograms() {
    return resolveMock(this.readPrograms());
  }

  getProgram(programId: string) {
    const match = this.readPrograms().find((p) => p.id === programId) ?? null;
    return resolveMock<TrainingProgram | null>(match);
  }

  createProgram(input: CreateTrainingProgramInput) {
    const programs = this.readPrograms();
    const program: TrainingProgram = {
      id: id("tp"),
      name: input.name.trim(),
      objective: input.objective,
      level: input.level,
      duration: input.duration.trim(),
      notes: input.notes.trim(),
      days: [],
    };
    programs.push(program);
    this.writePrograms(programs);
    return resolveMock(program);
  }

  updateProgram(programId: string, patch: Partial<CreateTrainingProgramInput>) {
    return resolveMock(
      this.mutate(programId, (p) => ({ ...p, ...patch })),
    );
  }

  deleteProgram(programId: string) {
    const programs = this.readPrograms();
    const next = programs.filter((p) => p.id !== programId);
    const removed = next.length !== programs.length;
    if (removed) this.writePrograms(next);
    return resolveMock(removed);
  }

  addDay(programId: string, name: string) {
    return resolveMock(
      this.mutate(programId, (p) => ({
        ...p,
        days: [...p.days, { id: id("day"), name: name.trim(), exercises: [] }],
      })),
    );
  }

  deleteDay(programId: string, dayId: string) {
    return resolveMock(
      this.mutate(programId, (p) => ({
        ...p,
        days: p.days.filter((d) => d.id !== dayId),
      })),
    );
  }

  addExercise(
    programId: string,
    dayId: string,
    exercise: CreateTrainingExercise,
  ) {
    return resolveMock(
      this.mutate(programId, (p) => ({
        ...p,
        days: p.days.map((d) =>
          d.id === dayId
            ? {
                ...d,
                exercises: [...d.exercises, { id: id("ex"), ...exercise }],
              }
            : d,
        ),
      })),
    );
  }

  deleteExercise(programId: string, dayId: string, exerciseId: string) {
    return resolveMock(
      this.mutate(programId, (p) => ({
        ...p,
        days: p.days.map((d) =>
          d.id === dayId
            ? { ...d, exercises: d.exercises.filter((e) => e.id !== exerciseId) }
            : d,
        ),
      })),
    );
  }

  /* ---- Asignaciones (clientId -> programId) ---- */
  private readAssignments(): Record<string, string> {
    return readRecord<string>(
      STORAGE_KEYS.programAssignments,
      programAssignmentsSeed,
    );
  }

  assignToClient(clientId: string, programId: string) {
    const record = this.readAssignments();
    record[clientId] = programId;
    writeRecord(STORAGE_KEYS.programAssignments, record);
    return resolveMock<void>(undefined);
  }

  getAssignment(clientId: string) {
    return resolveMock<string | null>(this.readAssignments()[clientId] ?? null);
  }

  /* ---- Progreso de entrenamientos (clientId -> dias completados) ---- */
  private readProgress(): Record<string, string[]> {
    return readRecord<string[]>(STORAGE_KEYS.workoutProgress, {});
  }

  getWorkoutProgress(clientId: string) {
    return resolveMock(this.readProgress()[clientId] ?? []);
  }

  setDayCompleted(clientId: string, dayId: string, done: boolean) {
    const record = this.readProgress();
    const current = new Set(record[clientId] ?? []);
    if (done) current.add(dayId);
    else current.delete(dayId);
    const next = [...current];
    record[clientId] = next;
    writeRecord(STORAGE_KEYS.workoutProgress, record);
    return resolveMock(next);
  }
}
