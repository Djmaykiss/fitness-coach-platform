-- =============================================================================
-- FASE 1 · Tablas de tenant e identidad
--   organizations · profiles · memberships · coaches
-- Fuente de verdad: DATABASE_MASTER_PLAN.md   (requiere Fase 0 aplicada)
-- -----------------------------------------------------------------------------
-- ANOTACIÓN DEL SCRIPT
--   1) Naturaleza : SOLO ESTRUCTURA (crea tablas, índices y triggers). No inserta datos.
--   2) Riesgo     : BAJO (tablas nuevas; ninguna existente se altera ni se borra).
--   3) Persistencia: CONSERVAR (esquema permanente).
-- -----------------------------------------------------------------------------
-- Idempotente (IF NOT EXISTS / DROP TRIGGER IF EXISTS antes de CREATE TRIGGER).
-- Sin DROP/DELETE de datos.
-- =============================================================================

-- 1) organizations (tenant raíz + marca / white-label) -----------------------
create table if not exists public.organizations (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  slug             text unique,
  status           text not null default 'active' check (status in ('active', 'suspended', 'archived')),
  -- Marca
  business_name    text not null default '',
  tagline          text not null default '',
  description      text not null default '',
  logo_url         text not null default '',
  -- Contacto
  phone            text not null default '',
  whatsapp         text not null default '',
  email            text not null default '',
  address          text not null default '',
  schedule         text not null default '',
  -- Redes
  instagram        text not null default '',
  facebook         text not null default '',
  tiktok           text not null default '',
  youtube          text not null default '',
  -- Legales
  policies         text not null default '',
  terms            text not null default '',
  -- Marca visual / negocio
  primary_color    text not null default '#65ff4f',
  secondary_color  text not null default '#85ff73',
  monthly_price    numeric not null default 0,
  currency         text not null default 'USD',
  settings         jsonb not null default '{}'::jsonb,
  -- Comunes
  created_by       uuid,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  deleted_at       timestamptz
);

-- 2) profiles (identidad global; id = auth.users.id) -------------------------
create table if not exists public.profiles (
  id                      uuid primary key references auth.users (id) on delete cascade,
  first_name              text not null default '',
  last_name               text not null default '',
  avatar_url              text not null default '',
  phone                   text not null default '',
  locale                  text not null default 'es',
  default_organization_id uuid references public.organizations (id) on delete set null,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- 3) memberships (profile ↔ organization ↔ role) -----------------------------
create table if not exists public.memberships (
  id              uuid primary key default gen_random_uuid(),
  profile_id      uuid not null references public.profiles (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  role            text not null check (role in ('owner', 'admin', 'coach', 'client')),
  status          text not null default 'active' check (status in ('active', 'invited', 'suspended')),
  invited_by      uuid references public.profiles (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (profile_id, organization_id)
);

create index if not exists memberships_org_idx     on public.memberships (organization_id);
create index if not exists memberships_profile_idx on public.memberships (profile_id);

-- 4) coaches (perfil profesional del coach) ----------------------------------
create table if not exists public.coaches (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  profile_id      uuid not null references public.profiles (id) on delete cascade,
  headline        text not null default '',
  bio             text not null default '',
  specialties     text[] not null default '{}',
  certifications  jsonb not null default '[]'::jsonb,
  public_email    text not null default '',
  instagram       text not null default '',
  facebook        text not null default '',
  tiktok          text not null default '',
  youtube         text not null default '',
  photo_url       text not null default '',
  created_by      uuid,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz,
  unique (organization_id, profile_id)
);

create index if not exists coaches_org_idx on public.coaches (organization_id);

-- 5) Triggers updated_at ------------------------------------------------------
drop trigger if exists set_updated_at on public.organizations;
create trigger set_updated_at before update on public.organizations
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.memberships;
create trigger set_updated_at before update on public.memberships
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.coaches;
create trigger set_updated_at before update on public.coaches
  for each row execute function public.set_updated_at();

-- 6) Triggers de auditoría (tablas con organization_id) ----------------------
drop trigger if exists audit on public.organizations;
create trigger audit after insert or update or delete on public.organizations
  for each row execute function public.audit_trigger();

drop trigger if exists audit on public.memberships;
create trigger audit after insert or update or delete on public.memberships
  for each row execute function public.audit_trigger();

drop trigger if exists audit on public.coaches;
create trigger audit after insert or update or delete on public.coaches
  for each row execute function public.audit_trigger();

-- FIN FASE 1 · tablas.
