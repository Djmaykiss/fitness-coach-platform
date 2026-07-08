-- =============================================================================
-- PLANES · plans + plan_features + client_plans (modulo comercial)
-- Fuente de verdad del modelo: DATABASE_MASTER_PLAN.md   (requiere Fases 0/1/5)
-- -----------------------------------------------------------------------------
-- ANOTACIÓN DEL SCRIPT
--   1) Naturaleza : SOLO ESTRUCTURA (tablas, índices, triggers, RLS). No inserta datos.
--   2) Riesgo     : BAJO (tablas nuevas; NO modifica ninguna tabla/migracion anterior).
--   3) Persistencia: CONSERVAR (esquema permanente).
-- -----------------------------------------------------------------------------
-- DECISIONES:
--   (a) `plans` = plan comercial administrable por el coach (precio libre en texto,
--       modalidad, ideal_for, boton, color, imagen, recommended, active, position).
--   (b) `plan_features` = beneficios normalizados (1 fila por bullet, ordenados por
--       position); el repo ensambla `Plan.features[]`.
--   (c) `client_plans` = plan contratado por un alumno (perfil): estado + fechas como
--       TEXTO (paridad con el Local*). Una fila (la mas reciente) por cliente.
--   (d) RLS: `plans`/`plan_features` lectura PUBLICA (anon) para la landing (solo
--       activos en plans; features son texto de marketing) + staff-CRUD por org;
--       `client_plans` staff + alumno dueño (`my_client_id`).
-- Idempotente. Sin DROP/DELETE de datos. No toca migraciones previas.
-- =============================================================================

-- 1) plans --------------------------------------------------------------------
create table if not exists public.plans (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name            text not null default '',
  price_label     text not null default '',
  modality        text not null default '',
  ideal_for       text not null default '',
  button_label    text not null default '',
  color           text not null default '#65ff4f',
  image           text not null default '',
  recommended     boolean not null default false,
  active          boolean not null default true,
  position        integer not null default 0,
  created_by      uuid,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);
create index if not exists plans_org_idx on public.plans (organization_id, position);

-- 2) plan_features ------------------------------------------------------------
create table if not exists public.plan_features (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  plan_id         uuid not null references public.plans (id) on delete cascade,
  text            text not null default '',
  position        integer not null default 0,
  created_at      timestamptz not null default now()
);
create index if not exists plan_features_plan_idx on public.plan_features (plan_id, position);

-- 3) client_plans -------------------------------------------------------------
create table if not exists public.client_plans (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id       uuid not null references public.clients (id) on delete cascade,
  plan_id         uuid references public.plans (id) on delete set null,
  plan_name       text not null default '',
  status          text not null default 'Activo',
  start_date      text not null default '',
  renewal_date    text not null default '',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists client_plans_client_idx on public.client_plans (client_id);

-- 4) Triggers updated_at + auditoría -----------------------------------------
drop trigger if exists set_updated_at on public.plans;
create trigger set_updated_at before update on public.plans
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.client_plans;
create trigger set_updated_at before update on public.client_plans
  for each row execute function public.set_updated_at();

drop trigger if exists audit on public.plans;
create trigger audit after insert or update or delete on public.plans
  for each row execute function public.audit_trigger();

-- 5) RLS · plans (lectura publica de ACTIVOS + staff CRUD) -------------------
alter table public.plans enable row level security;
alter table public.plans force  row level security;

drop policy if exists plans_select_public on public.plans;
create policy plans_select_public on public.plans
  for select to anon, authenticated
  using (active = true and deleted_at is null);

drop policy if exists plans_select_staff on public.plans;
create policy plans_select_staff on public.plans
  for select to authenticated using (public.is_org_staff(organization_id));

drop policy if exists plans_insert on public.plans;
create policy plans_insert on public.plans
  for insert to authenticated with check (public.is_org_staff(organization_id));

drop policy if exists plans_update on public.plans;
create policy plans_update on public.plans
  for update to authenticated
  using (public.is_org_staff(organization_id))
  with check (public.is_org_staff(organization_id));

drop policy if exists plans_delete on public.plans;
create policy plans_delete on public.plans
  for delete to authenticated using (public.is_org_staff(organization_id));

-- 6) RLS · plan_features (lectura publica + staff CRUD) ----------------------
alter table public.plan_features enable row level security;
alter table public.plan_features force  row level security;

drop policy if exists plan_features_select_public on public.plan_features;
create policy plan_features_select_public on public.plan_features
  for select to anon, authenticated using (true);

drop policy if exists plan_features_insert on public.plan_features;
create policy plan_features_insert on public.plan_features
  for insert to authenticated with check (public.is_org_staff(organization_id));

drop policy if exists plan_features_update on public.plan_features;
create policy plan_features_update on public.plan_features
  for update to authenticated
  using (public.is_org_staff(organization_id))
  with check (public.is_org_staff(organization_id));

drop policy if exists plan_features_delete on public.plan_features;
create policy plan_features_delete on public.plan_features
  for delete to authenticated using (public.is_org_staff(organization_id));

-- 7) RLS · client_plans (staff + alumno dueño) -------------------------------
alter table public.client_plans enable row level security;
alter table public.client_plans force  row level security;

drop policy if exists client_plans_select on public.client_plans;
create policy client_plans_select on public.client_plans
  for select to authenticated
  using (public.is_org_staff(organization_id) or client_id = public.my_client_id(organization_id));

drop policy if exists client_plans_insert on public.client_plans;
create policy client_plans_insert on public.client_plans
  for insert to authenticated with check (public.is_org_staff(organization_id));

drop policy if exists client_plans_update on public.client_plans;
create policy client_plans_update on public.client_plans
  for update to authenticated
  using (public.is_org_staff(organization_id))
  with check (public.is_org_staff(organization_id));

drop policy if exists client_plans_delete on public.client_plans;
create policy client_plans_delete on public.client_plans
  for delete to authenticated using (public.is_org_staff(organization_id));

-- FIN planes.
