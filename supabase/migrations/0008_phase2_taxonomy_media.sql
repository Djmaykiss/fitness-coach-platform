-- =============================================================================
-- FASE 2 · Taxonomía + media (tablas de referencia)
--   exercise_categories · nutrition_categories · program_categories · tags · media_assets
-- Fuente de verdad: DATABASE_MASTER_PLAN.md   (requiere Fases 0/1 aplicadas)
-- -----------------------------------------------------------------------------
-- ANOTACIÓN DEL SCRIPT
--   1) Naturaleza : SOLO ESTRUCTURA (tablas, índices, triggers, RLS). No inserta datos.
--   2) Riesgo     : BAJO (tablas nuevas; nada existente se altera ni se borra).
--   3) Persistencia: CONSERVAR (esquema permanente).
-- -----------------------------------------------------------------------------
-- REFINAMIENTO DE ORDEN (registrado): los PUENTES con FK a catálogo
-- (exercise_media, exercise_tags, program_tags) se crean en la fase de su catálogo
-- (exercise_media/exercise_tags en Fase 3; program_tags en Fase 6), porque dependen
-- de tablas que aún no existen aquí. Esta fase crea solo tablas SIN FK a catálogo.
-- Idempotente (IF NOT EXISTS / DROP POLICY|TRIGGER IF EXISTS). Sin DROP/DELETE de datos.
-- =============================================================================

-- 1) exercise_categories (jerárquica via parent_id) --------------------------
create table if not exists public.exercise_categories (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name            text not null,
  description     text not null default '',
  icon            text not null default '',
  parent_id       uuid references public.exercise_categories (id) on delete set null,
  position        integer not null default 0,
  created_by      uuid,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);
create index if not exists exercise_categories_org_idx on public.exercise_categories (organization_id);

-- 2) nutrition_categories -----------------------------------------------------
create table if not exists public.nutrition_categories (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name            text not null,
  description     text not null default '',
  icon            text not null default '',
  parent_id       uuid references public.nutrition_categories (id) on delete set null,
  position        integer not null default 0,
  created_by      uuid,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);
create index if not exists nutrition_categories_org_idx on public.nutrition_categories (organization_id);

-- 3) program_categories -------------------------------------------------------
create table if not exists public.program_categories (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name            text not null,
  description     text not null default '',
  icon            text not null default '',
  parent_id       uuid references public.program_categories (id) on delete set null,
  position        integer not null default 0,
  created_by      uuid,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);
create index if not exists program_categories_org_idx on public.program_categories (organization_id);

-- 4) tags (etiqueta global por org) ------------------------------------------
create table if not exists public.tags (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name            text not null,
  slug            text not null default '',
  created_by      uuid,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (organization_id, name)
);
create index if not exists tags_org_idx on public.tags (organization_id);

-- 5) media_assets (recurso multimedia genérico) ------------------------------
create table if not exists public.media_assets (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  kind            text not null check (kind in ('image', 'gif', 'video', 'pdf', 'file', 'link')),
  bucket          text,
  path            text,
  url             text,
  mime            text,
  size            bigint,
  title           text not null default '',
  created_by      uuid,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);
create index if not exists media_assets_org_idx on public.media_assets (organization_id);

-- 6) Triggers updated_at ------------------------------------------------------
drop trigger if exists set_updated_at on public.exercise_categories;
create trigger set_updated_at before update on public.exercise_categories
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.nutrition_categories;
create trigger set_updated_at before update on public.nutrition_categories
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.program_categories;
create trigger set_updated_at before update on public.program_categories
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.tags;
create trigger set_updated_at before update on public.tags
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.media_assets;
create trigger set_updated_at before update on public.media_assets
  for each row execute function public.set_updated_at();

-- 7) RLS (staff CRUD org-scoped; SELECT para miembros de la org) -------------
-- Patrón reutilizable: staff (owner/admin/coach) administra; cualquier miembro de
-- la org puede leer (necesario para que el alumno vea imágenes de ejercicios).
do $$
declare t text;
begin
  foreach t in array array[
    'exercise_categories', 'nutrition_categories', 'program_categories', 'tags', 'media_assets'
  ] loop
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

-- FIN FASE 2.
