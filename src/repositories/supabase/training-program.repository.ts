import type { TrainingProgramRepository } from "@/repositories/types";
import type {
  CreateTrainingExercise,
  CreateTrainingProgramInput,
  CreateWorkoutResult,
  TrainingDay,
  TrainingExercise,
  TrainingProgram,
  WorkoutFeeling,
  WorkoutResult,
} from "@/types";
import { getSupabaseClient } from "@/lib/supabase";
import { getCurrentOrgId } from "@/repositories/supabase/org-context";
import { unwrap, unwrapList } from "@/repositories/supabase/query";
import { definedOnly, keysToSnake } from "@/repositories/supabase/mappers";
import { str, type Row } from "@/repositories/supabase/content-crud";

/**
 * SupabaseTrainingProgramRepository (Bloque 5). Programas ANIDADOS
 * (`training_programs`->`training_days`->`training_exercises`), asignación via
 * `student_assignments` y progreso del alumno (`workout_day_progress`,
 * `exercise_series_progress`, `workout_results`). Misma interfaz que el `Local*`;
 * cada mutación devuelve el `TrainingProgram` ensamblado (re-fetch).
 */

const num = (row: Row, key: string, d = 0): number => {
  const v = row[key];
  if (typeof v === "number") return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

const intArr = (row: Row, key: string): number[] =>
  Array.isArray(row[key]) ? (row[key] as unknown[]).map((x) => Number(x)).filter(Number.isFinite) : [];

const TRAINING_ASSIGNMENT = "training_program";

function rowToExercise(row: Row): TrainingExercise {
  const exerciseId = str(row, "exercise_id");
  const ex: TrainingExercise = {
    id: str(row, "id"),
    name: str(row, "name"),
    sets: str(row, "sets"),
    reps: str(row, "reps"),
    rest: str(row, "rest"),
    notes: str(row, "notes"),
  };
  if (exerciseId) ex.exerciseId = exerciseId;
  return ex;
}

function rowToResult(row: Row): WorkoutResult {
  return {
    id: str(row, "id"),
    date: str(row, "date"),
    dayId: str(row, "day_id"),
    dayName: str(row, "day_name"),
    programName: str(row, "program_name"),
    exercises: num(row, "exercises"),
    durationSec: num(row, "duration_sec"),
    caloriesEst: num(row, "calories_est"),
    feeling: (str(row, "feeling") || "adecuado") as WorkoutFeeling,
  };
}

export class SupabaseTrainingProgramRepository implements TrainingProgramRepository {
  private sb() {
    return getSupabaseClient();
  }

  // ---------- ensamblado ----------

  private async hydrate(programRows: Row[]): Promise<TrainingProgram[]> {
    if (programRows.length === 0) return [];
    const programIds = programRows.map((p) => str(p, "id"));
    const dayRows = unwrapList(
      await this.sb()
        .from("training_days")
        .select("*")
        .in("program_id", programIds)
        .order("position", { ascending: true })
        .order("created_at", { ascending: true }),
    ) as Row[];
    const dayIds = dayRows.map((d) => str(d, "id"));
    const exRows =
      dayIds.length === 0
        ? []
        : (unwrapList(
            await this.sb()
              .from("training_exercises")
              .select("*")
              .in("day_id", dayIds)
              .order("position", { ascending: true })
              .order("created_at", { ascending: true }),
          ) as Row[]);

    const exByDay = new Map<string, TrainingExercise[]>();
    for (const ex of exRows) {
      const dayId = str(ex, "day_id");
      if (!exByDay.has(dayId)) exByDay.set(dayId, []);
      exByDay.get(dayId)!.push(rowToExercise(ex));
    }
    const daysByProgram = new Map<string, TrainingDay[]>();
    for (const d of dayRows) {
      const pid = str(d, "program_id");
      if (!daysByProgram.has(pid)) daysByProgram.set(pid, []);
      daysByProgram.get(pid)!.push({
        id: str(d, "id"),
        name: str(d, "name"),
        exercises: exByDay.get(str(d, "id")) ?? [],
      });
    }
    return programRows.map((p) => ({
      id: str(p, "id"),
      name: str(p, "name"),
      objective: str(p, "objective"),
      level: str(p, "level"),
      duration: str(p, "duration"),
      notes: str(p, "notes"),
      days: daysByProgram.get(str(p, "id")) ?? [],
    }));
  }

  async getPrograms(): Promise<TrainingProgram[]> {
    const rows = unwrapList(
      await this.sb()
        .from("training_programs")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: true }),
    ) as Row[];
    return this.hydrate(rows);
  }

  async getProgram(id: string): Promise<TrainingProgram | null> {
    const { data, error } = await this.sb()
      .from("training_programs")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return (await this.hydrate([data as Row]))[0] ?? null;
  }

  async createProgram(input: CreateTrainingProgramInput): Promise<TrainingProgram> {
    const orgId = await getCurrentOrgId();
    if (!orgId) throw new Error("No hay una organización activa.");
    const row = {
      organization_id: orgId,
      name: input.name.trim(),
      objective: input.objective,
      level: input.level,
      duration: input.duration.trim(),
      notes: input.notes.trim(),
    };
    const created = unwrap(
      await this.sb().from("training_programs").insert(row).select("*").single(),
    ) as Row;
    return (await this.hydrate([created]))[0];
  }

  async updateProgram(
    id: string,
    patch: Partial<CreateTrainingProgramInput>,
  ): Promise<TrainingProgram | null> {
    const row = keysToSnake(definedOnly(patch as Row));
    if (Object.keys(row).length > 0) {
      const { data, error } = await this.sb()
        .from("training_programs")
        .update(row)
        .eq("id", id)
        .is("deleted_at", null)
        .select("id")
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) return null;
    }
    return this.getProgram(id);
  }

  async deleteProgram(id: string): Promise<boolean> {
    const { data, error } = await this.sb()
      .from("training_programs")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .is("deleted_at", null)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return Boolean(data);
  }

  // ---------- helpers de mutación ----------

  private async programOrg(programId: string): Promise<string | null> {
    const { data } = await this.sb()
      .from("training_programs")
      .select("organization_id")
      .eq("id", programId)
      .is("deleted_at", null)
      .maybeSingle();
    return data ? str(data as Row, "organization_id") : null;
  }

  private async orderedDayIds(programId: string): Promise<string[]> {
    const rows = unwrapList(
      await this.sb()
        .from("training_days")
        .select("id")
        .eq("program_id", programId)
        .order("position", { ascending: true })
        .order("created_at", { ascending: true }),
    ) as Row[];
    return rows.map((r) => str(r, "id"));
  }

  private async orderedExerciseRows(dayId: string): Promise<Row[]> {
    return unwrapList(
      await this.sb()
        .from("training_exercises")
        .select("*")
        .eq("day_id", dayId)
        .order("position", { ascending: true })
        .order("created_at", { ascending: true }),
    ) as Row[];
  }

  private async reorder(table: string, orderedIds: string[]): Promise<void> {
    for (let i = 0; i < orderedIds.length; i++) {
      await this.sb().from(table).update({ position: i }).eq("id", orderedIds[i]);
    }
  }

  async addDay(programId: string, name: string): Promise<TrainingProgram | null> {
    const org = await this.programOrg(programId);
    if (!org) return null;
    const position = (await this.orderedDayIds(programId)).length;
    await this.sb()
      .from("training_days")
      .insert({ organization_id: org, program_id: programId, name: name.trim(), position });
    return this.getProgram(programId);
  }

  async deleteDay(programId: string, dayId: string): Promise<TrainingProgram | null> {
    const org = await this.programOrg(programId);
    if (!org) return null;
    await this.sb().from("training_days").delete().eq("id", dayId).eq("program_id", programId);
    return this.getProgram(programId);
  }

  async duplicateDay(programId: string, dayId: string): Promise<TrainingProgram | null> {
    const org = await this.programOrg(programId);
    if (!org) return null;
    const orderedIds = await this.orderedDayIds(programId);
    const srcIndex = orderedIds.indexOf(dayId);
    if (srcIndex === -1) return this.getProgram(programId);

    const { data: src } = await this.sb()
      .from("training_days")
      .select("name")
      .eq("id", dayId)
      .maybeSingle();
    const newDay = unwrap(
      await this.sb()
        .from("training_days")
        .insert({
          organization_id: org,
          program_id: programId,
          name: `${str((src ?? {}) as Row, "name")} (copia)`,
          position: orderedIds.length,
        })
        .select("id")
        .single(),
    ) as Row;
    const newDayId = str(newDay, "id");

    const srcExercises = await this.orderedExerciseRows(dayId);
    for (let i = 0; i < srcExercises.length; i++) {
      const e = srcExercises[i];
      await this.sb().from("training_exercises").insert({
        organization_id: org,
        day_id: newDayId,
        exercise_id: str(e, "exercise_id") || null,
        name: str(e, "name"),
        sets: str(e, "sets"),
        reps: str(e, "reps"),
        rest: str(e, "rest"),
        notes: str(e, "notes"),
        position: i,
      });
    }
    const finalOrder = [...orderedIds];
    finalOrder.splice(srcIndex + 1, 0, newDayId);
    await this.reorder("training_days", finalOrder);
    return this.getProgram(programId);
  }

  async addExercise(
    programId: string,
    dayId: string,
    exercise: CreateTrainingExercise,
  ): Promise<TrainingProgram | null> {
    const org = await this.programOrg(programId);
    if (!org) return null;
    const position = (await this.orderedExerciseRows(dayId)).length;
    await this.sb().from("training_exercises").insert({
      organization_id: org,
      day_id: dayId,
      exercise_id: exercise.exerciseId && exercise.exerciseId.trim() !== "" ? exercise.exerciseId : null,
      name: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps,
      rest: exercise.rest,
      notes: exercise.notes,
      position,
    });
    return this.getProgram(programId);
  }

  async deleteExercise(
    programId: string,
    dayId: string,
    exerciseId: string,
  ): Promise<TrainingProgram | null> {
    const org = await this.programOrg(programId);
    if (!org) return null;
    await this.sb().from("training_exercises").delete().eq("id", exerciseId).eq("day_id", dayId);
    return this.getProgram(programId);
  }

  async duplicateExercise(
    programId: string,
    dayId: string,
    exerciseId: string,
  ): Promise<TrainingProgram | null> {
    const org = await this.programOrg(programId);
    if (!org) return null;
    const rows = await this.orderedExerciseRows(dayId);
    const srcIndex = rows.findIndex((r) => str(r, "id") === exerciseId);
    if (srcIndex === -1) return this.getProgram(programId);
    const e = rows[srcIndex];
    const copy = unwrap(
      await this.sb()
        .from("training_exercises")
        .insert({
          organization_id: org,
          day_id: dayId,
          exercise_id: str(e, "exercise_id") || null,
          name: str(e, "name"),
          sets: str(e, "sets"),
          reps: str(e, "reps"),
          rest: str(e, "rest"),
          notes: str(e, "notes"),
          position: rows.length,
        })
        .select("id")
        .single(),
    ) as Row;
    const order = rows.map((r) => str(r, "id"));
    order.splice(srcIndex + 1, 0, str(copy, "id"));
    await this.reorder("training_exercises", order);
    return this.getProgram(programId);
  }

  async moveExercise(
    programId: string,
    dayId: string,
    exerciseId: string,
    direction: "up" | "down",
  ): Promise<TrainingProgram | null> {
    const org = await this.programOrg(programId);
    if (!org) return null;
    const order = (await this.orderedExerciseRows(dayId)).map((r) => str(r, "id"));
    const index = order.indexOf(exerciseId);
    const target = direction === "up" ? index - 1 : index + 1;
    if (index === -1 || target < 0 || target >= order.length) return this.getProgram(programId);
    [order[index], order[target]] = [order[target], order[index]];
    await this.reorder("training_exercises", order);
    return this.getProgram(programId);
  }

  // ---------- asignación (student_assignments) ----------

  private async clientOrg(clientId: string): Promise<string> {
    const { data } = await this.sb()
      .from("clients")
      .select("organization_id")
      .eq("id", clientId)
      .maybeSingle();
    return data ? str(data as Row, "organization_id") : "";
  }

  async assignToClient(clientId: string, programId: string): Promise<void> {
    const org = (await this.clientOrg(clientId)) || (await getCurrentOrgId()) || "";
    if (!org) throw new Error("No hay organización para la asignación.");
    await this.sb()
      .from("student_assignments")
      .delete()
      .eq("client_id", clientId)
      .eq("resource_type", TRAINING_ASSIGNMENT);
    await this.sb().from("student_assignments").insert({
      organization_id: org,
      client_id: clientId,
      resource_type: TRAINING_ASSIGNMENT,
      resource_id: programId,
      status: "active",
    });
  }

  async getAssignment(clientId: string): Promise<string | null> {
    const { data, error } = await this.sb()
      .from("student_assignments")
      .select("resource_id")
      .eq("client_id", clientId)
      .eq("resource_type", TRAINING_ASSIGNMENT)
      .eq("status", "active")
      .is("deleted_at", null)
      .order("assigned_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? str(data as Row, "resource_id") : null;
  }

  // ---------- progreso de días ----------

  async getWorkoutProgress(clientId: string): Promise<string[]> {
    const rows = unwrapList(
      await this.sb().from("workout_day_progress").select("day_id").eq("client_id", clientId),
    ) as Row[];
    return rows.map((r) => str(r, "day_id"));
  }

  async setDayCompleted(clientId: string, dayId: string, done: boolean): Promise<string[]> {
    if (done) {
      const org = await this.clientOrg(clientId);
      await this.sb()
        .from("workout_day_progress")
        .upsert(
          { organization_id: org, client_id: clientId, day_id: dayId },
          { onConflict: "client_id,day_id", ignoreDuplicates: true },
        );
    } else {
      await this.sb()
        .from("workout_day_progress")
        .delete()
        .eq("client_id", clientId)
        .eq("day_id", dayId);
    }
    return this.getWorkoutProgress(clientId);
  }

  // ---------- progreso de series ----------

  async getExerciseProgress(clientId: string): Promise<Record<string, number[]>> {
    const rows = unwrapList(
      await this.sb()
        .from("exercise_series_progress")
        .select("exercise_instance_id, indices")
        .eq("client_id", clientId),
    ) as Row[];
    const out: Record<string, number[]> = {};
    for (const r of rows) out[str(r, "exercise_instance_id")] = intArr(r, "indices");
    return out;
  }

  async toggleSeries(
    clientId: string,
    exerciseInstanceId: string,
    seriesIndex: number,
    done: boolean,
  ): Promise<Record<string, number[]>> {
    const { data: existing } = await this.sb()
      .from("exercise_series_progress")
      .select("indices")
      .eq("client_id", clientId)
      .eq("exercise_instance_id", exerciseInstanceId)
      .maybeSingle();
    const set = new Set<number>(existing ? intArr(existing as Row, "indices") : []);
    if (done) set.add(seriesIndex);
    else set.delete(seriesIndex);
    const indices = [...set].sort((a, b) => a - b);
    const org = await this.clientOrg(clientId);
    await this.sb()
      .from("exercise_series_progress")
      .upsert(
        { organization_id: org, client_id: clientId, exercise_instance_id: exerciseInstanceId, indices },
        { onConflict: "client_id,exercise_instance_id" },
      );
    return this.getExerciseProgress(clientId);
  }

  // ---------- resultados de sesiones ----------

  async getWorkoutResults(clientId: string): Promise<WorkoutResult[]> {
    const rows = unwrapList(
      await this.sb()
        .from("workout_results")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false }),
    ) as Row[];
    return rows.map(rowToResult);
  }

  async addWorkoutResult(clientId: string, result: CreateWorkoutResult): Promise<WorkoutResult> {
    const org = await this.clientOrg(clientId);
    const created = unwrap(
      await this.sb()
        .from("workout_results")
        .insert({
          organization_id: org,
          client_id: clientId,
          date: result.date,
          day_id: result.dayId,
          day_name: result.dayName,
          program_name: result.programName,
          exercises: result.exercises,
          duration_sec: result.durationSec,
          calories_est: result.caloriesEst,
          feeling: result.feeling,
        })
        .select("*")
        .single(),
    ) as Row;
    return rowToResult(created);
  }
}
