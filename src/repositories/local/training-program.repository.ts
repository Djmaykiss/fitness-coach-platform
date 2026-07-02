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
  CreateWorkoutResult,
  TrainingProgram,
  WorkoutResult,
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

  duplicateDay(programId: string, dayId: string) {
    return resolveMock(
      this.mutate(programId, (p) => {
        const index = p.days.findIndex((d) => d.id === dayId);
        if (index === -1) return p;
        const source = p.days[index];
        const copy = {
          ...source,
          id: id("day"),
          name: `${source.name} (copia)`,
          exercises: source.exercises.map((e) => ({ ...e, id: id("ex") })),
        };
        const days = [...p.days];
        days.splice(index + 1, 0, copy);
        return { ...p, days };
      }),
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

  duplicateExercise(programId: string, dayId: string, exerciseId: string) {
    return resolveMock(
      this.mutate(programId, (p) => ({
        ...p,
        days: p.days.map((d) => {
          if (d.id !== dayId) return d;
          const index = d.exercises.findIndex((e) => e.id === exerciseId);
          if (index === -1) return d;
          const copy = { ...d.exercises[index], id: id("ex") };
          const exercises = [...d.exercises];
          exercises.splice(index + 1, 0, copy);
          return { ...d, exercises };
        }),
      })),
    );
  }

  moveExercise(
    programId: string,
    dayId: string,
    exerciseId: string,
    direction: "up" | "down",
  ) {
    return resolveMock(
      this.mutate(programId, (p) => ({
        ...p,
        days: p.days.map((d) => {
          if (d.id !== dayId) return d;
          const index = d.exercises.findIndex((e) => e.id === exerciseId);
          const target = direction === "up" ? index - 1 : index + 1;
          if (index === -1 || target < 0 || target >= d.exercises.length) return d;
          const exercises = [...d.exercises];
          [exercises[index], exercises[target]] = [
            exercises[target],
            exercises[index],
          ];
          return { ...d, exercises };
        }),
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

  /* ---- Series completadas por ejercicio (clientId -> exId -> indices) ---- */
  private readSeries(): Record<string, Record<string, number[]>> {
    return readRecord<Record<string, number[]>>(
      STORAGE_KEYS.exerciseProgress,
      {},
    );
  }

  getExerciseProgress(clientId: string) {
    return resolveMock(this.readSeries()[clientId] ?? {});
  }

  toggleSeries(
    clientId: string,
    exerciseInstanceId: string,
    seriesIndex: number,
    done: boolean,
  ) {
    const record = this.readSeries();
    const forClient = { ...(record[clientId] ?? {}) };
    const set = new Set(forClient[exerciseInstanceId] ?? []);
    if (done) set.add(seriesIndex);
    else set.delete(seriesIndex);
    forClient[exerciseInstanceId] = [...set].sort((a, b) => a - b);
    record[clientId] = forClient;
    writeRecord(STORAGE_KEYS.exerciseProgress, record);
    return resolveMock(forClient);
  }

  /* ---- Resultados de sesiones (modo entrenamiento) ---- */
  private readResults(): Record<string, WorkoutResult[]> {
    return readRecord<WorkoutResult[]>(STORAGE_KEYS.workoutResults, {});
  }

  getWorkoutResults(clientId: string) {
    return resolveMock(this.readResults()[clientId] ?? []);
  }

  addWorkoutResult(clientId: string, result: CreateWorkoutResult) {
    const record = this.readResults();
    const created: WorkoutResult = { ...result, id: id("wr") };
    record[clientId] = [created, ...(record[clientId] ?? [])];
    writeRecord(STORAGE_KEYS.workoutResults, record);
    return resolveMock(created);
  }
}
