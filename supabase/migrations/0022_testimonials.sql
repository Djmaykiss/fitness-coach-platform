-- =============================================================================
-- TESTIMONIOS — módulo de referencia del PATRÓN UNIVERSAL DE CONTENIDO (Fase 2)
-- Fuente: CONTENT_PATTERN.md   (requiere Fases 0/1/2: organizations, helpers RLS,
--         media_assets [0008/0020])
-- -----------------------------------------------------------------------------
-- ANOTACIÓN DEL SCRIPT
--   1) Naturaleza : SOLO ESTRUCTURA (1 tabla nueva + índice + triggers + RLS). NO
--                   inserta ni borra datos; no toca migraciones ni tablas anteriores.
--   2) Riesgo     : BAJO (tabla completamente nueva; nada existente se altera).
--   3) Persistencia: CONSERVAR (esquema permanente).
-- -----------------------------------------------------------------------------
-- Patrón: entidad org-scoped + `status` (draft|public|archived) + `position` +
--   `metadata` + soft-delete (`deleted_at`) + imagen OPCIONAL por el Media Manager
--   (`image_media_id` -> `media_assets`). RLS: staff CRUD de su org; lectura PÚBLICA
--   (anon + miembros) SOLO de `status='public'` no borrados (para la landing).
-- Idempotente (IF NOT EXISTS / DROP POLICY|TRIGGER IF EXISTS). Sin DROP/DELETE de datos.
-- =============================================================================

-- 1) Tabla ---------------------------------------------------------------------
create table if not exists public.testimonials (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name            text not null default '',
  role            text not null default '',
  result          text not null default '',
  quote           text not null default '',
  -- Imagen opcional via Media Manager (nunca binarios en esta tabla).
  image_media_id  uuid references public.media_assets (id) on delete set null,
  status          text not null default 'draft'
                    check (status in ('draft', 'public', 'archived')),
  position        integer not null default 0,
  metadata        jsonb not null default '{}'::jsonb,
  created_by      uuid,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

create index if not exists testimonials_org_idx
  on public.testimonials (organization_id, status, position);

-- 2) Triggers (updated_at + auditoría), como el resto del contenido ------------
drop trigger if exists set_updated_at on public.testimonials;
create trigger set_updated_at before update on public.testimonials
  for each row execute function public.set_updated_at();

drop trigger if exists audit on public.testimonials;
create trigger audit after insert or update or delete on public.testimonials
  for each row execute function public.audit_trigger();

-- 3) RLS -----------------------------------------------------------------------
alter table public.testimonials enable row level security;
alter table public.testimonials force  row level security;

-- SELECT: staff ve TODO lo de su org; anon/miembros ven SOLO los públicos vivos.
drop policy if exists testimonials_select on public.testimonials;
create policy testimonials_select on public.testimonials
  for select to anon, authenticated
  using (
    public.is_org_staff(organization_id)
    or (status = 'public' and deleted_at is null)
  );

-- INSERT/UPDATE/DELETE: solo staff de la org.
drop policy if exists testimonials_insert on public.testimonials;
create policy testimonials_insert on public.testimonials
  for insert to authenticated
  with check (public.is_org_staff(organization_id));

drop policy if exists testimonials_update on public.testimonials;
create policy testimonials_update on public.testimonials
  for update to authenticated
  using (public.is_org_staff(organization_id))
  with check (public.is_org_staff(organization_id));

drop policy if exists testimonials_delete on public.testimonials;
create policy testimonials_delete on public.testimonials
  for delete to authenticated
  using (public.is_org_staff(organization_id));

-- 4) Lectura ANÓNIMA de media_assets acotada a imágenes de testimonios PÚBLICOS -
--    Policy NUEVA y ADITIVA (permisiva, OR con la de 0008). NO modifica la policy
--    existente `media_assets_select` (staff/miembros). Expone un asset SOLO si está
--    vinculado (`image_media_id`) a un testimonial `status='public'` y no borrado ->
--    nunca assets privados, borradores ni de otros módulos.
drop policy if exists media_assets_public_testimonial on public.media_assets;
create policy media_assets_public_testimonial on public.media_assets
  for select to anon, authenticated
  using (
    deleted_at is null
    and exists (
      select 1 from public.testimonials t
      where t.image_media_id = media_assets.id
        and t.status = 'public'
        and t.deleted_at is null
    )
  );

-- FIN (testimonials).
