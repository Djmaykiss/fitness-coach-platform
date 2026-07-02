-- =============================================================================
-- FASE 1 · Storage: buckets + políticas
-- Fuente de verdad: DATABASE_MASTER_PLAN.md   (requiere 0000..0003 aplicados)
-- -----------------------------------------------------------------------------
-- ANOTACIÓN DEL SCRIPT
--   1) Naturaleza : ESTRUCTURA + 1 upsert de configuración de buckets.
--                   El INSERT en storage.buckets crea contenedores vacíos (no sube
--                   archivos); es configuración, no datos de negocio.
--   2) Riesgo     : MEDIO (define acceso a archivos; revisar antes de prod).
--   3) Persistencia: CONSERVAR.
-- -----------------------------------------------------------------------------
-- Convención de path: {organization_id}/{entidad}/{id}/{archivo}
-- (la primera carpeta = organization_id). La app garantiza esta convención.
-- La escritura de progress-photos por el propio alumno se agrega en la Fase 5.
-- =============================================================================

-- 1) Buckets ------------------------------------------------------------------
insert into storage.buckets (id, name, public) values
  ('logos',               'logos',               true),
  ('discover-images',     'discover-images',     true),
  ('exercise-images',     'exercise-images',     true),
  ('exercise-gifs',       'exercise-gifs',       true),
  ('nutrition-images',    'nutrition-images',    true),
  ('avatars',             'avatars',             false),
  ('progress-photos',     'progress-photos',     false),
  ('documents',           'documents',           false),
  ('exercise-videos',     'exercise-videos',     false),
  ('message-attachments', 'message-attachments', false),
  ('report-files',        'report-files',        false)
on conflict (id) do nothing;

-- 2) Helper: organization_id desde el path (cast seguro; null si no es uuid) --
create or replace function public.storage_org(p_name text)
returns uuid
language plpgsql
stable
as $$
declare
  v uuid;
begin
  begin
    v := (storage.foldername(p_name))[1]::uuid;
  exception when others then
    v := null;
  end;
  return v;
end;
$$;

-- 3) Políticas sobre storage.objects -----------------------------------------
-- Lectura pública de los buckets públicos.
drop policy if exists "public buckets read" on storage.objects;
create policy "public buckets read" on storage.objects
  for select to anon, authenticated
  using (bucket_id in ('logos', 'discover-images', 'exercise-images', 'exercise-gifs', 'nutrition-images'));

-- Staff (owner/admin/coach) lee los buckets privados de su org.
drop policy if exists "staff read private" on storage.objects;
create policy "staff read private" on storage.objects
  for select to authenticated
  using (
    bucket_id in ('progress-photos', 'documents', 'exercise-videos', 'message-attachments', 'report-files')
    and public.is_org_staff(public.storage_org(name))
  );

-- Staff escribe (insert/update/delete) en los buckets de su org.
drop policy if exists "staff write insert" on storage.objects;
create policy "staff write insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in (
      'logos', 'discover-images', 'exercise-images', 'exercise-gifs', 'nutrition-images',
      'progress-photos', 'documents', 'exercise-videos', 'message-attachments', 'report-files'
    )
    and public.is_org_staff(public.storage_org(name))
  );

drop policy if exists "staff write update" on storage.objects;
create policy "staff write update" on storage.objects
  for update to authenticated
  using (public.is_org_staff(public.storage_org(name)))
  with check (public.is_org_staff(public.storage_org(name)));

drop policy if exists "staff write delete" on storage.objects;
create policy "staff write delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id in (
      'logos', 'discover-images', 'exercise-images', 'exercise-gifs', 'nutrition-images',
      'progress-photos', 'documents', 'exercise-videos', 'message-attachments', 'report-files'
    )
    and public.is_org_staff(public.storage_org(name))
  );

-- Avatars: cada usuario gestiona su propia carpeta ({profile_id}/...).
drop policy if exists "avatars read" on storage.objects;
create policy "avatars read" on storage.objects
  for select to authenticated
  using (bucket_id = 'avatars');

drop policy if exists "avatars insert" on storage.objects;
create policy "avatars insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars update" on storage.objects;
create policy "avatars update" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars delete" on storage.objects;
create policy "avatars delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- FIN FASE 1 · Storage.
