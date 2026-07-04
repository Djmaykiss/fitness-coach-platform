-- =============================================================================
-- FASE 6 · Entrenamiento
--   training_programs -> training_days -> training_exercises
--   workout_day_progress · exercise_series_progress · workout_results
-- Fuente de verdad: DATABASE_MASTER_PLAN.md   (requiere Fases 0/1/2/3/5 aplicadas)
-- -----------------------------------------------------------------------------
-- ANOTACIÓN DEL SCRIPT
--   1) Naturaleza : SOLO ESTRUCTURA (tablas, índices, triggers, RLS). No inserta datos.
--   2) Riesgo     : BAJO (tablas nuevas; nada existente se altera ni se borra).
--   3) Persistencia: CONSERVAR (esquema permanente).
-- -----------------------------------------------------------------------------
-- DECISIONES REGISTRADAS:
--   (a) Programa ANIDADO: `training_days` (position) -> `training_exercises` (position);
--       el repo ensambla `TrainingProgram.days[].exercises[]` ordenado por position.
--   (b) `deleteProgram` = SOFT DELETE (`deleted_at`); días/ejercicios cuelgan por FK
--       cascade pero quedan ocultos al filtrar el programa.
--   (c) ASIGNACIÓN via `student_assignments` (Fase 5, resource_type='training_program');
--       `assignToClient` mantiene UNA activa por alumno (borra las previas e inserta).
--   (d) Progreso del alumno: `workout_day_progress` (día completado = existe fila),
--       `exercise_series_progress` (indices int[] por instancia de ejercicio),
--       `workout_results` (sesiones del modo entrenamiento, `date`/`day_id` como texto
--       histórico). RLS: staff + alumno dueño (`my_client_id`).
--   (e) `training_exercises.exercise_id` -> `library_exercises` ON DELETE SET NULL
--       (si se quita de la biblioteca, queda el nombre denormalizado).
-- Idempotente. Sin DROP/DELETE de datos.
-- =============================================================================

-- 1) training_programs --------------------------------------------------------
create table if not exists public.training_programs (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name            text not null default '',
  objective       text not null default '',
  level           text not null default '',
  duration        text not null default '',
  notes           text not null default '',
  created_by      uuid,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);
create index if not exists training_programs_org_idx on public.training_programs (organization_id);

-- 2) training_days ------------------------------------------------------------
create table if not exists public.training_days (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  program_id      uuid not null references public.training_programs (id) on delete cascade,
  name            text not null default '',
  position        integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists training_days_program_idx on public.training_days (program_id, position);

-- 3) training_exercises -------------------------------------------------------
create table if not exists public.training_exercises (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  day_id          uuid not null references public.training_days (id) on delete cascade,
  exercise_id     uuid references public.library_exercises (id) on delete set null,
  name            text not null default '',
  sets            text not null default '',
  reps            text not null default '',
  rest            text not null default '',
  notes           text not null default '',
  position        integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists training_exercises_day_idx on public.training_exercises (day_id, position);

-- 4) workout_day_progress (día completado = existe fila) ----------------------
create table if not exists public.workout_day_progress (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id       uuid not null references public.clients (id) on delete cascade,
  day_id          uuid not null references public.training_days (id) on delete cascade,
  created_at      timestamptz not null default now(),
  unique (client_id, day_id)
);
create index if not exists workout_day_progress_client_idx on public.workout_day_progress (client_id);

-- 5) exercise_series_progress (indices de series por instancia) --------------
create table if not exists public.exercise_series_progress (
  id                   uuid primary key default gen_random_uuid(),
  organization_id      uuid not null references public.organizations (id) on delete cascade,
  client_id            uuid not null references public.clients (id) on delete cascade,
  exercise_instance_id uuid not null references public.training_exercises (id) on delete cascade,
  indices              integer[] not null default '{}',
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (client_id, exercise_instance_id)
);
create index if not exists exercise_series_progress_client_idx on public.exercise_series_progress (client_id);

-- 6) workout_results (sesiones del modo entrenamiento) -----------------------
create table if not exists public.workout_results (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id       uuid not null references public.clients (id) on delete cascade,
  date            text not null default '',
  day_id          text not null default '',
  day_name        text not null default '',
  program_name    text not null default '',
  exercises       integer not null default 0,
  duration_sec    integer not null default 0,
  calories_est    integer not null default 0,
  feeling         text not null default 'adecuado' check (feeling in ('dificil', 'adecuado', 'facil')),
  created_at      timestamptz not null default now()
);
create index if not exists workout_results_client_idx on public.workout_results (client_id, created_at desc);

-- 7) Triggers updated_at + auditoría -----------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'training_programs', 'training_days', 'training_exercises', 'exercise_series_progress'
  ] loop
    execute format('drop trigger if exists set_updated_at on public.%I;', t);
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at();', t);
  end loop;
  execute 'drop trigger if exists audit on public.training_programs';
  execute 'create trigger audit after insert or update or delete on public.training_programs for each row execute function public.audit_trigger()';
end $$;

-- 8) RLS · programas/días/ejercicios (staff CRUD; SELECT miembros de la org) --
do $$
declare t text;
begin
  foreach t in array array['training_programs', 'training_days', 'training_exercises'] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('alter table public.%I force  row level security;', t);

    execute format('drop policy if exists %I on public.%I;', t || '_select', t);
    execute format(
      'create policy %I on public.%I for select to authenticated using (organization_id in (select public.current_org_ids()));',
      t || '_select', t);

    execute format('drop policy if exists %I on public.%I;', t || '_insert', t);
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (public.is_org_staff(organization_id));',
      t || '_insert', t);

    execute format('drop policy if exists %I on public.%I;', t || '_update', t);
    execute format(
      'create policy %I on public.%I for update to authenticated using (public.is_org_staff(organization_id)) with check (public.is_org_staff(organization_id));',
      t || '_update', t);

    execute format('drop policy if exists %I on public.%I;', t || '_delete', t);
    execute format(
      'create policy %I on public.%I for delete to authenticated using (public.is_org_staff(organization_id));',
      t || '_delete', t);
  end loop;
end $$;

-- 9) RLS · progreso del alumno (staff + alumno dueño) ------------------------
do $$
declare t text;
begin
  foreach t in array array['workout_day_progress', 'exercise_series_progress', 'workout_results'] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('alter table public.%I force  row level security;', t);

    execute format('drop policy if exists %I on public.%I;', t || '_select', t);
    execute format(
      'create policy %I on public.%I for select to authenticated using (public.is_org_staff(organization_id) or client_id = public.my_client_id(organization_id));',
      t || '_select', t);

    execute format('drop policy if exists %I on public.%I;', t || '_insert', t);
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (public.is_org_staff(organization_id) or client_id = public.my_client_id(organization_id));',
      t || '_insert', t);

    execute format('drop policy if exists %I on public.%I;', t || '_update', t);
    execute format(
      'create policy %I on public.%I for update to authenticated using (public.is_org_staff(organization_id) or client_id = public.my_client_id(organization_id)) with check (public.is_org_staff(organization_id) or client_id = public.my_client_id(organization_id));',
      t || '_update', t);

    execute format('drop policy if exists %I on public.%I;', t || '_delete', t);
    execute format(
      'create policy %I on public.%I for delete to authenticated using (public.is_org_staff(organization_id) or client_id = public.my_client_id(organization_id));',
      t || '_delete', t);
  end loop;
end $$;

-- FIN FASE 6.
