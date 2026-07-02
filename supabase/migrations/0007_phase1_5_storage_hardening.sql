-- =============================================================================
-- FASE 1.5 · Hardening (3) lectura de avatars restringida  (4) límites de Storage
-- Fuente de verdad: DATABASE_MASTER_PLAN.md   (requiere Fase 0 y Fase 1 aplicadas)
-- -----------------------------------------------------------------------------
-- ANOTACIÓN DEL SCRIPT
--   1) Naturaleza : MIXTO. (a) MODIFICA DATOS de configuración (UPDATE de límites
--                   en storage.buckets; son filas de config, no datos de negocio).
--                   (b) ESTRUCTURA/SEGURIDAD (reemplaza la política de lectura de
--                   avatars). No inserta/borra datos de negocio.
--   2) Riesgo     : MEDIO (límites muy estrictos podrían rechazar subidas válidas;
--                   ajusta los valores si tu contenido los supera).
--   3) Persistencia: CONSERVAR.
-- -----------------------------------------------------------------------------
-- No modifica el modelo de datos ni crea tablas/buckets nuevos.
-- =============================================================================

-- 1) Límites de tamaño (bytes) y MIME por bucket -----------------------------
-- Imágenes (5 MB)
update storage.buckets set file_size_limit = 5242880,
  allowed_mime_types = array['image/png','image/jpeg','image/webp']
  where id in ('discover-images','exercise-images','nutrition-images');

-- Logos (2 MB; permite SVG)
update storage.buckets set file_size_limit = 2097152,
  allowed_mime_types = array['image/png','image/jpeg','image/webp','image/svg+xml']
  where id = 'logos';

-- Avatars (2 MB)
update storage.buckets set file_size_limit = 2097152,
  allowed_mime_types = array['image/png','image/jpeg','image/webp']
  where id = 'avatars';

-- GIFs (15 MB)
update storage.buckets set file_size_limit = 15728640,
  allowed_mime_types = array['image/gif','image/webp']
  where id = 'exercise-gifs';

-- Fotos de progreso (10 MB)
update storage.buckets set file_size_limit = 10485760,
  allowed_mime_types = array['image/png','image/jpeg','image/webp']
  where id = 'progress-photos';

-- Videos (50 MB; para archivos mayores subir el límite GLOBAL del proyecto en
-- Dashboard -> Storage -> Settings, ya que el límite por bucket no puede excederlo).
update storage.buckets set file_size_limit = 52428800,
  allowed_mime_types = array['video/mp4','video/webm']
  where id = 'exercise-videos';

-- Documentos y reportes (20 MB, PDF)
update storage.buckets set file_size_limit = 20971520,
  allowed_mime_types = array['application/pdf']
  where id in ('documents','report-files');

-- Adjuntos de chat (20 MB; imágenes + PDF)
update storage.buckets set file_size_limit = 20971520,
  allowed_mime_types = array['image/png','image/jpeg','image/webp','application/pdf']
  where id = 'message-attachments';

-- 2) Lectura de avatars: solo el propio usuario o staff de su organización ----
-- (la primera carpeta del path de avatars es el profile_id del dueño).
drop policy if exists "avatars read" on storage.objects;
create policy "avatars read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'avatars'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1
        from public.memberships m
        where m.profile_id = public.storage_org(name)
          and public.is_org_staff(m.organization_id)
      )
    )
  );

-- FIN FASE 1.5 · storage hardening.
