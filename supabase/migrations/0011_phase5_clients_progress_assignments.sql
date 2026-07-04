-- =============================================================================
-- FASE 5 · Alumnos + Progreso + Asignaciones
--   clients · client_progress · student_assignments · my_client_id() · register_client()
--   + FK evaluations.client_id (cierre de la Fase 4)
-- Fuente de verdad: DATABASE_MASTER_PLAN.md   (requiere Fases 0/1/4 aplicadas)
-- -----------------------------------------------------------------------------
-- ANOTACIÓN DEL SCRIPT
--   1) Naturaleza : ESTRUCTURA + 2 FUNCIONES (tablas, índices, triggers, RLS, RPC,
--                   helper). No inserta datos.
--   2) Riesgo     : MEDIO (RLS del alumno + RPC SECURITY DEFINER register_client).
--   3) Persistencia: CONSERVAR (esquema permanente).
-- -----------------------------------------------------------------------------
-- DECISIONES REGISTRADAS:
--   (a) `clientRepository.createClient` es del STAFF (admin crea alumno / convierte
--       lead). El ALTA POR AUTO-REGISTRO (register→clients) va por la RPC
--       `register_client` (SECURITY DEFINER) que crea membership(client)+clients para
--       auth.uid() (sin escalación: solo para el propio usuario).
--   (b) evaluación del alumno en `evaluations` via `client_id` (misma tabla que leads);
--       aquí se añade la FK `evaluations.client_id -> clients(id) ON DELETE CASCADE`.
--   (c) `deleteClient` = SOFT DELETE (`deleted_at`); el progreso/fotos se limpian por
--       las llamadas separadas del `adminDashboardService` (paridad).
--   (d) `student_assignments` es la tabla GENÉRICA de asignaciones (la usan los Bloques
--       5/6 para programas/nutrición); se crea aquí, aún sin repos que la consuman.
--   (e) `my_client_id(org)` (SECURITY DEFINER STABLE) para las políticas del alumno.
-- Idempotente. Sin DROP/DELETE de datos.
-- =============================================================================

-- 1) clients ------------------------------------------------------------------
create table if not exists public.clients (
  id                uuid primary key default gen_random_uuid(),
  organization_id   uuid not null references public.organizations (id) on delete cascade,
  user_id           uuid references public.profiles (id) on delete set null,
  name              text not null default '',
  status            text not null default 'Nuevo',
  access_status     text not null default 'Vencido'
                      check (access_status in ('Activo', 'Vencido', 'Pausado')),
  access_expires_at timestamptz,
  last_payment_date timestamptz,
  payment_method    text,
  created_by        uuid,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz
);
create index if not exists clients_org_idx  on public.clients (organization_id);
create index if not exists clients_user_idx on public.clients (user_id);

-- 2) client_progress (1 fila por cliente) ------------------------------------
create table if not exists public.client_progress (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations (id) on delete cascade,
  client_id        uuid not null references public.clients (id) on delete cascade,
  programa         text not null default '',
  semana_actual    integer not null default 0,
  semanas_totales  integer not null default 0,
  progreso_pct     numeric not null default 0,
  peso_inicial     text not null default '',
  peso_actual      text not null default '',
  objetivo         text not null default '',
  adherencia       text not null default '',
  tasks            text[] not null default '{}',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (client_id)
);
create index if not exists client_progress_org_idx on public.client_progress (organization_id);

-- 3) student_assignments (asignaciones genéricas; la usan Bloques 5/6) --------
create table if not exists public.student_assignments (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id       uuid not null references public.clients (id) on delete cascade,
  resource_type   text not null
                    check (resource_type in ('training_program', 'nutrition_plan', 'course',
                                             'challenge', 'document', 'routine', 'exercise')),
  resource_id     uuid not null,
  status          text not null default 'active'
                    check (status in ('active', 'paused', 'completed', 'archived')),
  assigned_by     uuid,
  assigned_at     timestamptz not null default now(),
  created_by      uuid,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);
create index if not exists student_assignments_client_idx on public.student_assignments (client_id, resource_type);
create index if not exists student_assignments_org_idx    on public.student_assignments (organization_id);

-- 4) FK evaluations.client_id (cierre Fase 4) --------------------------------
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'evaluations_client_id_fkey'
  ) then
    alter table public.evaluations
      add constraint evaluations_client_id_fkey
      foreign key (client_id) references public.clients (id) on delete cascade;
  end if;
end $$;
create index if not exists evaluations_client_idx on public.evaluations (client_id);

-- 5) Helper my_client_id(org) (para RLS del alumno) --------------------------
create or replace function public.my_client_id(p_org uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select c.id
  from public.clients c
  where c.user_id = auth.uid()
    and c.organization_id = p_org
    and c.deleted_at is null
  limit 1;
$$;

-- 6) Triggers updated_at + auditoría -----------------------------------------
do $$
declare t text;
begin
  foreach t in array array['clients', 'client_progress', 'student_assignments'] loop
    execute format('drop trigger if exists set_updated_at on public.%I;', t);
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at();', t);
  end loop;
  foreach t in array array['clients', 'student_assignments'] loop
    execute format('drop trigger if exists audit on public.%I;', t);
    execute format(
      'create trigger audit after insert or update or delete on public.%I for each row execute function public.audit_trigger();', t);
  end loop;
end $$;

-- 7) RLS · clients (staff CRUD; alumno lee el suyo) --------------------------
alter table public.clients enable row level security;
alter table public.clients force  row level security;

drop policy if exists clients_select on public.clients;
create policy clients_select on public.clients
  for select to authenticated
  using (public.is_org_staff(organization_id) or user_id = auth.uid());

drop policy if exists clients_insert on public.clients;
create policy clients_insert on public.clients
  for insert to authenticated with check (public.is_org_staff(organization_id));

drop policy if exists clients_update on public.clients;
create policy clients_update on public.clients
  for update to authenticated
  using (public.is_org_staff(organization_id))
  with check (public.is_org_staff(organization_id));

drop policy if exists clients_delete on public.clients;
create policy clients_delete on public.clients
  for delete to authenticated using (public.is_org_staff(organization_id));
-- INSERT del auto-registro: por register_client (SECURITY DEFINER).

-- 8) RLS · client_progress (staff + alumno dueño) ----------------------------
alter table public.client_progress enable row level security;
alter table public.client_progress force  row level security;

drop policy if exists client_progress_select on public.client_progress;
create policy client_progress_select on public.client_progress
  for select to authenticated
  using (public.is_org_staff(organization_id) or client_id = public.my_client_id(organization_id));

drop policy if exists client_progress_insert on public.client_progress;
create policy client_progress_insert on public.client_progress
  for insert to authenticated
  with check (public.is_org_staff(organization_id) or client_id = public.my_client_id(organization_id));

drop policy if exists client_progress_update on public.client_progress;
create policy client_progress_update on public.client_progress
  for update to authenticated
  using (public.is_org_staff(organization_id) or client_id = public.my_client_id(organization_id))
  with check (public.is_org_staff(organization_id) or client_id = public.my_client_id(organization_id));

drop policy if exists client_progress_delete on public.client_progress;
create policy client_progress_delete on public.client_progress
  for delete to authenticated using (public.is_org_staff(organization_id));

-- 9) RLS · student_assignments (staff CRUD; alumno lee las suyas) ------------
alter table public.student_assignments enable row level security;
alter table public.student_assignments force  row level security;

drop policy if exists student_assignments_select on public.student_assignments;
create policy student_assignments_select on public.student_assignments
  for select to authenticated
  using (public.is_org_staff(organization_id) or client_id = public.my_client_id(organization_id));

drop policy if exists student_assignments_insert on public.student_assignments;
create policy student_assignments_insert on public.student_assignments
  for insert to authenticated with check (public.is_org_staff(organization_id));

drop policy if exists student_assignments_update on public.student_assignments;
create policy student_assignments_update on public.student_assignments
  for update to authenticated
  using (public.is_org_staff(organization_id))
  with check (public.is_org_staff(organization_id));

drop policy if exists student_assignments_delete on public.student_assignments;
create policy student_assignments_delete on public.student_assignments
  for delete to authenticated using (public.is_org_staff(organization_id));

-- 10) RLS · evaluations: además del staff, el ALUMNO lee la suya --------------
drop policy if exists evaluations_select on public.evaluations;
create policy evaluations_select on public.evaluations
  for select to authenticated
  using (
    public.is_org_staff(organization_id)
    or (client_id is not null and client_id = public.my_client_id(organization_id))
  );

-- 11) RPC register_client (cierre register→clients; para el propio usuario) ---
create or replace function public.register_client(
  p_name       text  default '',
  p_evaluation jsonb default null,
  p_org        uuid  default null
) returns public.clients
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid    uuid := auth.uid();
  v_org    uuid;
  v_name   text;
  v_client public.clients;
begin
  if v_uid is null then
    raise exception 'Se requiere sesión para registrar al alumno.';
  end if;
  v_org := coalesce(
    p_org,
    (select id from public.organizations
       where deleted_at is null and status = 'active'
       order by created_at asc limit 1)
  );
  if v_org is null then
    raise exception 'No hay organización disponible.';
  end if;

  -- membership client (idempotente; el guard solo restringe el rol owner)
  insert into public.memberships (profile_id, organization_id, role, status)
  values (v_uid, v_org, 'client', 'active')
  on conflict (profile_id, organization_id) do nothing;

  update public.profiles
  set default_organization_id = coalesce(default_organization_id, v_org)
  where id = v_uid;

  v_name := nullif(btrim(coalesce(p_name, '')), '');
  if v_name is null then
    select nullif(btrim(coalesce(first_name, '') || ' ' || coalesce(last_name, '')), '')
      into v_name from public.profiles where id = v_uid;
  end if;

  -- cliente (idempotente: reusa el activo del usuario en la org)
  select * into v_client
  from public.clients
  where user_id = v_uid and organization_id = v_org and deleted_at is null
  limit 1;

  if v_client.id is null then
    insert into public.clients (organization_id, user_id, name, status, access_status)
    values (v_org, v_uid, coalesce(v_name, ''), 'Nuevo', 'Vencido')
    returning * into v_client;
  end if;

  if p_evaluation is not null then
    insert into public.evaluations (organization_id, client_id, data)
    values (v_org, v_client.id, p_evaluation);
  end if;

  return v_client;
end;
$$;

revoke execute on function public.register_client(text, jsonb, uuid) from public;
grant  execute on function public.register_client(text, jsonb, uuid) to authenticated;

-- FIN FASE 5.
