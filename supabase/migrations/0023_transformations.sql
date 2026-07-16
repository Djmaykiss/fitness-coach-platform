-- =============================================================================
-- TRANSFORMACIONES (marketing) — patrón universal de contenido (Fase 2)
-- Fuente: CONTENT_PATTERN.md · espejo de `0022_testimonials.sql`
--   (requiere Fases 0/1/2: organizations, helpers RLS, media_assets [0008/0020])
-- -----------------------------------------------------------------------------
-- ⚠️  NO CONFUNDIR con `transformation_photos` (0020): esa es el PROGRESO PRIVADO del
--     alumno (fotos Antes/Después de su ficha, RLS de alumno dueño). ESTA tabla,
--     `transformations`, es CONTENIDO DE MARKETING curado por el coach para la landing.
--     Esta migración NO toca `transformation_photos` ni `progress_photos`.
-- -----------------------------------------------------------------------------
-- ANOTACIÓN DEL SCRIPT
--   1) Naturaleza : SOLO ESTRUCTURA (1 tabla nueva + índice + triggers + RLS +
--                   1 policy aditiva sobre media_assets). NO inserta ni borra datos;
--                   NO modifica tablas/policies anteriores.
--   2) Riesgo     : BAJO (tabla nueva + policy nueva permisiva/aditiva).
--   3) Persistencia: CONSERVAR (esquema permanente).
-- -----------------------------------------------------------------------------
-- Patrón: entidad org-scoped + `status` (draft|public|archived) + `position` +
--   `metadata` + soft-delete (`deleted_at`) + imágenes Antes/Después por el Media
--   Manager (`before_media_id`/`after_media_id` -> `media_assets`). RLS: staff CRUD de
--   su org; lectura PÚBLICA (anon + miembros) SOLO de `status='public'` no borradas.
-- Idempotente (IF NOT EXISTS / DROP POLICY|TRIGGER IF EXISTS). Sin DROP/DELETE de datos.
-- =============================================================================

-- 1) Tabla ---------------------------------------------------------------------
create table if not exists public.transformations (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_name     text not null default '',
  title           text not null default '',
  description     text not null default '',
  result          text not null default '',
  duration        text not null default '',
  -- Imágenes opcionales via Media Manager (nunca binarios en esta tabla).
  before_media_id uuid references public.media_assets (id) on delete set null,
  after_media_id  uuid references public.media_assets (id) on delete set null,
  status          text not null default 'draft'
                    check (status in ('draft', 'public', 'archived')),
  -- Consentimiento del coach para publicar las imágenes (autorización del alumno).
  consent_confirmed    boolean not null default false,
  consent_confirmed_at timestamptz,
  consent_confirmed_by uuid,
  position        integer not null default 0,
  metadata        jsonb not null default '{}'::jsonb,
  created_by      uuid,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz,
  -- REGLA DURA: una transformación NO puede estar `public` sin consentimiento confirmado.
  -- Al desmarcar el consentimiento, la app debe bajar `status` (draft/archived) en el mismo
  -- UPDATE, o el constraint rechaza la fila -> nunca hay `public` sin consent.
  constraint transformations_public_requires_consent
    check (status <> 'public' or consent_confirmed = true)
);

create index if not exists transformations_org_idx
  on public.transformations (organization_id, status, position);

-- 2) Triggers (updated_at + auditoría) ----------------------------------------
drop trigger if exists set_updated_at on public.transformations;
create trigger set_updated_at before update on public.transformations
  for each row execute function public.set_updated_at();

drop trigger if exists audit on public.transformations;
create trigger audit after insert or update or delete on public.transformations
  for each row execute function public.audit_trigger();

-- 3) RLS -----------------------------------------------------------------------
alter table public.transformations enable row level security;
alter table public.transformations force  row level security;

-- SELECT: staff ve TODO lo de su org; anon/miembros ven SOLO las públicas vivas CON
--         consentimiento confirmado (la landing nunca muestra sin consentimiento).
drop policy if exists transformations_select on public.transformations;
create policy transformations_select on public.transformations
  for select to anon, authenticated
  using (
    public.is_org_staff(organization_id)
    or (status = 'public' and consent_confirmed = true and deleted_at is null)
  );

-- INSERT/UPDATE/DELETE: solo staff de la org.
drop policy if exists transformations_insert on public.transformations;
create policy transformations_insert on public.transformations
  for insert to authenticated
  with check (public.is_org_staff(organization_id));

drop policy if exists transformations_update on public.transformations;
create policy transformations_update on public.transformations
  for update to authenticated
  using (public.is_org_staff(organization_id))
  with check (public.is_org_staff(organization_id));

drop policy if exists transformations_delete on public.transformations;
create policy transformations_delete on public.transformations
  for delete to authenticated
  using (public.is_org_staff(organization_id));

-- 4) Lectura ANÓNIMA de media_assets acotada a imágenes de transformaciones PÚBLICAS
--    Policy NUEVA y ADITIVA (permisiva, OR con la de 0008). NO modifica la policy
--    existente `media_assets_select` (staff/miembros). Expone un asset SOLO si es la
--    imagen Antes O Después (`before_media_id`/`after_media_id`) de una transformación
--    `status='public'`, CON consentimiento confirmado y no borrada -> nunca assets privados,
--    borradores, sin consentimiento, otros módulos, ni las fotos privadas del alumno
--    (`transformation_photos` no usa media_assets).
drop policy if exists media_assets_public_transformation on public.media_assets;
create policy media_assets_public_transformation on public.media_assets
  for select to anon, authenticated
  using (
    deleted_at is null
    and exists (
      select 1 from public.transformations t
      where (t.before_media_id = media_assets.id or t.after_media_id = media_assets.id)
        and t.status = 'public'
        and t.consent_confirmed = true
        and t.deleted_at is null
    )
  );

-- FIN (transformations).
