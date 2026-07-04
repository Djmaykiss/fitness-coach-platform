-- =============================================================================
-- FASE 7 · Nutrición
--   nutrition_plans -> nutrition_days -> nutrition_meals · nutrition_meal_progress
-- Fuente de verdad: DATABASE_MASTER_PLAN.md   (requiere Fases 0/1/5 aplicadas)
-- -----------------------------------------------------------------------------
-- ANOTACIÓN DEL SCRIPT
--   1) Naturaleza : SOLO ESTRUCTURA (tablas, índices, triggers, RLS). No inserta datos.
--   2) Riesgo     : BAJO (tablas nuevas; nada existente se altera ni se borra).
--   3) Persistencia: CONSERVAR (esquema permanente).
-- -----------------------------------------------------------------------------
-- DECISIONES REGISTRADAS (espejo de la Fase 6 de Entrenamiento):
--   (a) Plan ANIDADO: `nutrition_days` (position) -> `nutrition_meals` (position);
--       el repo ensambla `NutritionPlan.days[].meals[]` ordenado por position.
--   (b) `deletePlan` = SOFT DELETE (`deleted_at`).
--   (c) ASIGNACIÓN via `student_assignments` (Fase 5, resource_type='nutrition_plan');
--       `assignToClient` mantiene UNA activa por alumno.
--   (d) Progreso: `nutrition_meal_progress` (comida completada = existe fila). RLS:
--       staff + alumno dueño (`my_client_id`).
-- Idempotente. Sin DROP/DELETE de datos.
-- =============================================================================

-- 1) nutrition_plans ----------------------------------------------------------
create table if not exists public.nutrition_plans (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name            text not null default '',
  objective       text not null default '',
  calories        text not null default '',
  protein         text not null default '',
  carbs           text not null default '',
  fat             text not null default '',
  water           text not null default '',
  notes           text not null default '',
  created_by      uuid,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);
create index if not exists nutrition_plans_org_idx on public.nutrition_plans (organization_id);

-- 2) nutrition_days -----------------------------------------------------------
create table if not exists public.nutrition_days (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  plan_id         uuid not null references public.nutrition_plans (id) on delete cascade,
  name            text not null default '',
  position        integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists nutrition_days_plan_idx on public.nutrition_days (plan_id, position);

-- 3) nutrition_meals ----------------------------------------------------------
create table if not exists public.nutrition_meals (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  day_id          uuid not null references public.nutrition_days (id) on delete cascade,
  name            text not null default '',
  description     text not null default '',
  position        integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists nutrition_meals_day_idx on public.nutrition_meals (day_id, position);

-- 4) nutrition_meal_progress (comida completada = existe fila) ----------------
create table if not exists public.nutrition_meal_progress (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id       uuid not null references public.clients (id) on delete cascade,
  meal_id         uuid not null references public.nutrition_meals (id) on delete cascade,
  created_at      timestamptz not null default now(),
  unique (client_id, meal_id)
);
create index if not exists nutrition_meal_progress_client_idx on public.nutrition_meal_progress (client_id);

-- 5) Triggers updated_at + auditoría -----------------------------------------
do $$
declare t text;
begin
  foreach t in array array['nutrition_plans', 'nutrition_days', 'nutrition_meals'] loop
    execute format('drop trigger if exists set_updated_at on public.%I;', t);
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at();', t);
  end loop;
  execute 'drop trigger if exists audit on public.nutrition_plans';
  execute 'create trigger audit after insert or update or delete on public.nutrition_plans for each row execute function public.audit_trigger()';
end $$;

-- 6) RLS · planes/días/comidas (staff CRUD; SELECT miembros de la org) --------
do $$
declare t text;
begin
  foreach t in array array['nutrition_plans', 'nutrition_days', 'nutrition_meals'] loop
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

-- 7) RLS · nutrition_meal_progress (staff + alumno dueño) --------------------
alter table public.nutrition_meal_progress enable row level security;
alter table public.nutrition_meal_progress force  row level security;

drop policy if exists nutrition_meal_progress_select on public.nutrition_meal_progress;
create policy nutrition_meal_progress_select on public.nutrition_meal_progress
  for select to authenticated
  using (public.is_org_staff(organization_id) or client_id = public.my_client_id(organization_id));

drop policy if exists nutrition_meal_progress_insert on public.nutrition_meal_progress;
create policy nutrition_meal_progress_insert on public.nutrition_meal_progress
  for insert to authenticated
  with check (public.is_org_staff(organization_id) or client_id = public.my_client_id(organization_id));

drop policy if exists nutrition_meal_progress_delete on public.nutrition_meal_progress;
create policy nutrition_meal_progress_delete on public.nutrition_meal_progress
  for delete to authenticated
  using (public.is_org_staff(organization_id) or client_id = public.my_client_id(organization_id));

-- FIN FASE 7.
