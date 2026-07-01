import {
  clientRepository,
  trainingProgramRepository,
} from "@/repositories";
import type {
  AssignedTraining,
  CreateTrainingExercise,
  CreateTrainingProgramInput,
  CreateWorkoutResult,
  WorkoutResult,
} from "@/types";

/**
 * Modulo de programas de entrenamiento. El panel admin consume las operaciones de
 * CRUD/builder/asignacion; el dashboard del alumno consume las de lectura por
 * usuario. La UI nunca toca repositorios directamente.
 */
export const trainingService = {
  /* ---- Admin: CRUD + builder ---- */
  getPrograms: () => trainingProgramRepository.getPrograms(),
  createProgram: (input: CreateTrainingProgramInput) =>
    trainingProgramRepository.createProgram(input),
  updateProgram: (id: string, patch: Partial<CreateTrainingProgramInput>) =>
    trainingProgramRepository.updateProgram(id, patch),
  deleteProgram: (id: string) => trainingProgramRepository.deleteProgram(id),
  addDay: (programId: string, name: string) =>
    trainingProgramRepository.addDay(programId, name),
  deleteDay: (programId: string, dayId: string) =>
    trainingProgramRepository.deleteDay(programId, dayId),
  addExercise: (
    programId: string,
    dayId: string,
    exercise: CreateTrainingExercise,
  ) => trainingProgramRepository.addExercise(programId, dayId, exercise),
  deleteExercise: (programId: string, dayId: string, exerciseId: string) =>
    trainingProgramRepository.deleteExercise(programId, dayId, exerciseId),

  /* ---- Admin: asignacion ---- */
  assignToClient: (clientId: string, programId: string) =>
    trainingProgramRepository.assignToClient(clientId, programId),
  getAssignment: (clientId: string) =>
    trainingProgramRepository.getAssignment(clientId),

  /* ---- Alumno: lectura por usuario autenticado ---- */
  /** Programa asignado + dias completados + series por ejercicio (por userId). */
  async getAssignedForUser(userId: string): Promise<AssignedTraining | null> {
    const client = await clientRepository.findByUserId(userId);
    if (!client) return null;
    const programId = await trainingProgramRepository.getAssignment(client.id);
    if (!programId) return null;
    const program = await trainingProgramRepository.getProgram(programId);
    if (!program) return null;
    const completedDayIds =
      await trainingProgramRepository.getWorkoutProgress(client.id);
    const seriesProgress =
      await trainingProgramRepository.getExerciseProgress(client.id);
    return { clientId: client.id, program, completedDayIds, seriesProgress };
  },

  /** Marca/desmarca un dia como completado para el alumno autenticado. */
  async toggleDayForUser(userId: string, dayId: string, done: boolean) {
    const client = await clientRepository.findByUserId(userId);
    if (!client) return [];
    return trainingProgramRepository.setDayCompleted(client.id, dayId, done);
  },

  /** Marca/desmarca una serie de un ejercicio para el alumno autenticado. */
  async toggleSeriesForUser(
    userId: string,
    exerciseInstanceId: string,
    seriesIndex: number,
    done: boolean,
  ) {
    const client = await clientRepository.findByUserId(userId);
    if (!client) return {};
    return trainingProgramRepository.toggleSeries(
      client.id,
      exerciseInstanceId,
      seriesIndex,
      done,
    );
  },

  /* ---- Modo entrenamiento: resultados de sesion ---- */
  /** Sesiones completadas del alumno autenticado (mas recientes primero). */
  async getResultsForUser(userId: string): Promise<WorkoutResult[]> {
    const client = await clientRepository.findByUserId(userId);
    if (!client) return [];
    return trainingProgramRepository.getWorkoutResults(client.id);
  },

  /** Guarda el resultado de una sesion para el alumno autenticado. */
  async saveResultForUser(userId: string, result: CreateWorkoutResult) {
    const client = await clientRepository.findByUserId(userId);
    if (!client) return null;
    return trainingProgramRepository.addWorkoutResult(client.id, result);
  },
};
