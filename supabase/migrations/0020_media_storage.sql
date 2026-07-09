-- =============================================================================
-- SISTEMA DE IMÁGENES · FASE 1B — Storage + metadata (media_assets) + fotos alumno
-- Fuente: IMAGE_SYSTEM_PLAN.md   (requiere Fases 0/1/2/5/8 aplicadas: organizations,
--         helpers RLS, media_assets [0008], clients + my_client_id [0011],
--         progress_photos [0014])
-- -----------------------------------------------------------------------------
-- ANOTACIÓN DEL SCRIPT
--   1) Naturaleza : ESTRUCTURA + buckets/policies. NO inserta ni borra datos de
--                   negocio. Los `alter table ... add column if not exists` son
--                   ADITIVOS (columnas nuevas NULLABLE) -> NO alteran filas
--                   existentes y NO rompen `progress_photos` (front/side/back siguen).
--   2) Riesgo     : BAJO (buckets/policies nuevas + columnas nuevas + 1 tabla nueva;
--                   nada existente se elimina ni se modifica en su forma actual).
--   3) Persistencia: CONSERVAR (esquema permanente).
-- -----------------------------------------------------------------------------
-- Idempotente (IF NOT EXISTS / on conflict do nothing / DROP POLICY IF EXISTS).
-- Sin DROP/DELETE de datos. No toca migraciones anteriores.
-- =============================================================================

-- 1) Buckets nuevos (PÚBLICOS) — se AGREGAN; los existentes (0004) no se tocan ------
insert into storage.buckets (id, name, public) values
  ('transformation-images', 'transformation-images', true),
  ('content-media',         'content-media',         true)
on conflict (id) do nothing;

-- 2) RLS de Storage para los buckets nuevos (policies NUEVAS, no modifican las de 0004)
--    Lectura pública; escritura de STAFF con ruta org-scoped ({org}/...) via storage_org.
drop policy if exists "media new buckets read" on storage.objects;
create policy "media new buckets read" on storage.objects
  for select to anon, authenticated
  using (bucket_id in ('transformation-images', 'content-media'));

drop policy if exists "media new buckets insert" on storage.objects;
create policy "media new buckets insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('transformation-images', 'content-media')
    and public.is_org_staff(public.storage_org(name))
  );

drop policy if exists "media new buckets update" on storage.objects;
create policy "media new buckets update" on storage.objects
  for update to authenticated
  using (
    bucket_id in ('transformation-images', 'content-media')
    and public.is_org_staff(public.storage_org(name))
  )
  with check (
    bucket_id in ('transformation-images', 'content-media')
    and public.is_org_staff(public.storage_org(name))
  );

drop policy if exists "media new buckets delete" on storage.objects;
create policy "media new buckets delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('transformation-images', 'content-media')
    and public.is_org_staff(public.storage_org(name))
  );

-- 3) media_assets — columnas de metadata de imagen + dueño polimórfico + contexto ---
--    ADITIVO. La RLS existente de media_assets (0008: staff CRUD, SELECT miembros) sigue.
alter table public.media_assets
  add column if not exists width      integer,
  add column if not exists height     integer,
  add column if not exists checksum   text,
  add column if not exists thumb_path text,
  add column if not exists thumb_url  text,
  add column if not exists context    text,   -- exercise|plan|transformation|article|resource|cover|gallery|library
  add column if not exists owner_kind text,   -- entidad dueña (p. ej. 'exercise','plan','article')
  add column if not exists owner_id   uuid,
  add column if not exists metadata   jsonb not null default '{}'::jsonb;

create index if not exists media_assets_owner_idx
  on public.media_assets (organization_id, owner_kind, owner_id);
create index if not exists media_assets_checksum_idx
  on public.media_assets (organization_id, checksum);

-- 4) progress_photos — extensión a FILA-POR-FOTO (ADITIVO; front/side/back intactos) -
--    `phase` NULL = registro legacy (front/side/back). Registros nuevos usan las
--    columnas de storage. La RLS de progress_photos (0014: staff + alumno dueño) sigue.
alter table public.progress_photos
  add column if not exists phase      text,   -- before|after|progress (null = legacy)
  add column if not exists bucket     text,
  add column if not exists path       text,
  add column if not exists url        text,
  add column if not exists thumb_path text,
  add column if not exists thumb_url  text,
  add column if not exists width      integer,
  add column if not exists height     integer,
  add column if not exists size       bigint,
  add column if not exists mime       text,
  add column if not exists checksum   text,
  add column if not exists taken_at   timestamptz;

-- 5) transformation_photos — fotos Antes/Después del alumno (privadas) ---------------
--    Espejo de progress_photos; RLS: staff + alumno dueño (my_client_id).
create table if not exists public.transformation_photos (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id       uuid not null references public.clients (id) on delete cascade,
  phase           text not null default 'before' check (phase in ('before', 'after')),
  bucket          text,
  path            text,
  url             text,
  thumb_path      text,
  thumb_url       text,
  width           integer,
  height          integer,
  size            bigint,
  mime            text,
  checksum        text,
  note            text not null default '',
  taken_at        timestamptz,
  created_at      timestamptz not null default now()
);
create index if not exists transformation_photos_client_idx
  on public.transformation_photos (client_id, created_at desc);

alter table public.transformation_photos enable row level security;
alter table public.transformation_photos force  row level security;

drop policy if exists transformation_photos_select on public.transformation_photos;
create policy transformation_photos_select on public.transformation_photos
  for select to authenticated
  using (public.is_org_staff(organization_id) or client_id = public.my_client_id(organization_id));

drop policy if exists transformation_photos_insert on public.transformation_photos;
create policy transformation_photos_insert on public.transformation_photos
  for insert to authenticated
  with check (public.is_org_staff(organization_id) or client_id = public.my_client_id(organization_id));

drop policy if exists transformation_photos_update on public.transformation_photos;
create policy transformation_photos_update on public.transformation_photos
  for update to authenticated
  using (public.is_org_staff(organization_id) or client_id = public.my_client_id(organization_id))
  with check (public.is_org_staff(organization_id) or client_id = public.my_client_id(organization_id));

drop policy if exists transformation_photos_delete on public.transformation_photos;
create policy transformation_photos_delete on public.transformation_photos
  for delete to authenticated
  using (public.is_org_staff(organization_id) or client_id = public.my_client_id(organization_id));

-- FIN FASE 1B.
