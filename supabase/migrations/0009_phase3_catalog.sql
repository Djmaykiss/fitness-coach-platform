-- =============================================================================
-- FASE 3 · Catálogo del coach
--   library_exercises (+exercise_media) · discover_routines/categories/articles
--   onboarding_messages/rewards/predictions
-- Fuente de verdad: DATABASE_MASTER_PLAN.md   (requiere Fases 0/1/2 aplicadas)
-- -----------------------------------------------------------------------------
-- ANOTACIÓN DEL SCRIPT
--   1) Naturaleza : SOLO ESTRUCTURA (tablas, índices, triggers, RLS). No inserta datos.
--   2) Riesgo     : BAJO (tablas nuevas; nada existente se altera ni se borra).
--   3) Persistencia: CONSERVAR (esquema permanente).
-- -----------------------------------------------------------------------------
-- DECISIONES REGISTRADAS:
--   (a) MULTIMEDIA de ejercicios via media_assets + exercise_media (diseño genérico
--       del master plan): NO se añaden columnas image/gif/video a library_exercises;
--       cada una es un "slot" (role image/gif/video) en exercise_media -> media_assets.
--   (b) `exercise_tags` y el uso de `exercise_categories.category_id` quedan DIFERIDOS
--       (el tipo LibraryExercise no tiene tags ni categoría todavía). `category_id` se
--       incluye nullable para fidelidad de diseño, pero el repo aún no lo usa.
--   (c) `published` arranca en TRUE por defecto en discover_*/onboarding_* para PARIDAD
--       con el comportamiento actual (LocalDiscoverRepository/LocalOnboardingContent
--       crean el contenido ya publicado).
--   (d) Lectura PÚBLICA (anon) de contenido `published` en discover_*/onboarding_*
--       (landing/wizard/descubre); library_exercises solo lo leen miembros de la org.
-- Idempotente. Sin DROP/DELETE de datos.
-- =============================================================================

-- 1) library_exercises --------------------------------------------------------
create table if not exists public.library_exercises (
  id                uuid primary key default gen_random_uuid(),
  organization_id   uuid not null references public.organizations (id) on delete cascade,
  name              text not null,
  muscle_group      text not null default '',
  secondary_muscles text not null default '',
  equipment         text not null default '',
  difficulty        text not null default '',
  description       text not null default '',
  technique         text not null default '',
  common_mistakes   text not null default '',
  coach_tips        text not null default '',
  variants          text not null default '',
  substitutions     text not null default '',
  recommended_time  text not null default '',
  recommended_rest  text not null default '',
  category_id       uuid references public.exercise_categories (id) on delete set null,
  created_by        uuid,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz
);
create index if not exists library_exercises_org_idx on public.library_exercises (organization_id);

-- 2) exercise_media (puente ejercicio ↔ media, un slot por role) -------------
create table if not exists public.exercise_media (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  exercise_id     uuid not null references public.library_exercises (id) on delete cascade,
  media_id        uuid not null references public.media_assets (id) on delete cascade,
  role            text not null check (role in ('image', 'gif', 'video')),
  position        integer not null default 0,
  created_by      uuid,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (exercise_id, role)
);
create index if not exists exercise_media_exercise_idx on public.exercise_media (exercise_id);
create index if not exists exercise_media_org_idx      on public.exercise_media (organization_id);

-- 3) discover_routines --------------------------------------------------------
create table if not exists public.discover_routines (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name            text not null default '',
  category        text not null default '',
  level           text not null default '',
  duration        text not null default '',
  minutes         text not null default '',
  description     text not null default '',
  image           text not null default '',
  published       boolean not null default true,
  created_by      uuid,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);
create index if not exists discover_routines_org_idx on public.discover_routines (organization_id);

-- 4) discover_categories ------------------------------------------------------
create table if not exists public.discover_categories (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  label           text not null default '',
  description     text not null default '',
  icon            text not null default '',
  muscle_groups   text[] not null default '{}',
  published       boolean not null default true,
  created_by      uuid,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);
create index if not exists discover_categories_org_idx on public.discover_categories (organization_id);

-- 5) discover_articles --------------------------------------------------------
create table if not exists public.discover_articles (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title           text not null default '',
  category        text not null default '',
  read_time       text not null default '',
  content         text not null default '',
  image           text not null default '',
  published       boolean not null default true,
  created_by      uuid,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);
create index if not exists discover_articles_org_idx on public.discover_articles (organization_id);

-- 6) onboarding_messages ------------------------------------------------------
create table if not exists public.onboarding_messages (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  message         text not null default '',
  category        text not null default '',
  published       boolean not null default true,
  created_by      uuid,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);
create index if not exists onboarding_messages_org_idx on public.onboarding_messages (organization_id);

-- 7) onboarding_rewards -------------------------------------------------------
create table if not exists public.onboarding_rewards (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title           text not null default '',
  description     text not null default '',
  icon            text not null default '',
  published       boolean not null default true,
  created_by      uuid,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);
create index if not exists onboarding_rewards_org_idx on public.onboarding_rewards (organization_id);

-- 8) onboarding_predictions ---------------------------------------------------
create table if not exists public.onboarding_predictions (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  objective       text not null default '',
  title           text not null default '',
  body            text not null default '',
  timeframe       text not null default '',
  published       boolean not null default true,
  created_by      uuid,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);
create index if not exists onboarding_predictions_org_idx on public.onboarding_predictions (organization_id);

-- 9) Triggers updated_at (todas) ---------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'library_exercises', 'exercise_media', 'discover_routines', 'discover_categories',
    'discover_articles', 'onboarding_messages', 'onboarding_rewards', 'onboarding_predictions'
  ] loop
    execute format('drop trigger if exists set_updated_at on public.%I;', t);
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at();', t);
  end loop;
end $$;

-- 10) Triggers de auditoría (contenido del coach; NO en el puente exercise_media) --
do $$
declare t text;
begin
  foreach t in array array[
    'library_exercises', 'discover_routines', 'discover_categories', 'discover_articles',
    'onboarding_messages', 'onboarding_rewards', 'onboarding_predictions'
  ] loop
    execute format('drop trigger if exists audit on public.%I;', t);
    execute format(
      'create trigger audit after insert or update or delete on public.%I for each row execute function public.audit_trigger();', t);
  end loop;
end $$;

-- 11) RLS · library_exercises + exercise_media (staff CRUD; SELECT miembros org) --
do $$
declare t text;
begin
  foreach t in array array['library_exercises', 'exercise_media'] loop
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

-- 12) RLS · discover_* + onboarding_* (staff CRUD; lectura PÚBLICA de published) --
do $$
declare t text;
begin
  foreach t in array array[
    'discover_routines', 'discover_categories', 'discover_articles',
    'onboarding_messages', 'onboarding_rewards', 'onboarding_predictions'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('alter table public.%I force  row level security;', t);

    -- Lectura pública (anon + authenticated) de lo publicado y no borrado.
    execute format('drop policy if exists %I on public.%I;', t || '_select_public', t);
    execute format(
      'create policy %I on public.%I for select to anon, authenticated using (published = true and deleted_at is null);',
      t || '_select_public', t);

    -- Staff ve TODO lo de su org (incluye no publicado).
    execute format('drop policy if exists %I on public.%I;', t || '_select_staff', t);
    execute format(
      'create policy %I on public.%I for select to authenticated using (public.is_org_staff(organization_id));',
      t || '_select_staff', t);

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

-- FIN FASE 3.
