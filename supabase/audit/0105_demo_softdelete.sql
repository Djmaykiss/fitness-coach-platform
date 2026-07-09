-- =============================================================================
-- LIMPIEZA DE CONTENIDO DEMO — SOLO SOFT-DELETE (nunca DELETE físico)
-- Fase 1 · E6.   Ejecutar en el SQL Editor DESPUÉS de revisar el inventario
-- (`0104_demo_inventory_readonly.sql`). Alcance: OPCIÓN 2 (conservador).
-- -----------------------------------------------------------------------------
-- ANOTACIÓN
--   1) Naturaleza : SOLO `UPDATE ... set deleted_at = now()` (soft-delete). NO hay
--                   DELETE físico. NO toca schema.
--   2) Riesgo     : BAJO. Solo marca como borrado contenido EVIDENTEMENTE de prueba,
--                   por nombre/condición explícita, scopeado a la org. Idempotente
--                   (`where deleted_at is null` -> re-ejecutar no re-afecta).
--   3) Persistencia: el archivo se CONSERVA como registro; el efecto es reversible
--                    (poner `deleted_at = null` restaura).
-- -----------------------------------------------------------------------------
-- NO TOCA (opción 2): ningún usuario/cliente/coach/organización; clientes ACTIVOS
--   (Jesus Romero, ivania perez, La cobra Lopez); planes Básico/Intermedio/Elite;
--   plan de nutrición; leads; evaluaciones; CRM. Las DUDAS van al reporte final.
--
-- Cada bloque usa `returning` para que el SQL Editor muestre exactamente qué marcó.
-- Org: "Coach Fitness" = 2ad5f8cc-04d2-484c-8b58-4a0cc68ac651.
-- =============================================================================

-- 1) EJERCICIOS de prueba (biblioteca) — los 3 "Sentadilla*" de verificación -----
update public.library_exercises
set deleted_at = now()
where organization_id = '2ad5f8cc-04d2-484c-8b58-4a0cc68ac651'
  and deleted_at is null
  and name in ('Sentadilla CUTOVER', 'Sentadilla ENTRENAR', 'Sentadilla Búlgara en Casa')
returning 'library_exercises' as tabla, id, name;

-- 2) PROGRAMA de prueba — "Full Body Cutover" -----------------------------------
update public.training_programs
set deleted_at = now()
where organization_id = '2ad5f8cc-04d2-484c-8b58-4a0cc68ac651'
  and deleted_at is null
  and name = 'Full Body Cutover'
returning 'training_programs' as tabla, id, name;

-- 3) BIBLIOTECA MULTIMEDIA — filas HUÉRFANAS (sin bucket/path/url) ---------------
update public.media_assets
set deleted_at = now()
where organization_id = '2ad5f8cc-04d2-484c-8b58-4a0cc68ac651'
  and deleted_at is null
  and coalesce(bucket, '') = ''
  and coalesce(path, '') = ''
  and coalesce(url, '') = ''
returning 'media_assets' as tabla, id, title;

-- 4) ASIGNACIÓN HUÉRFANA — apunta al programa de prueba Y su cliente YA está
--    borrado (NO toca la asignación de clientes activos como Jesus; esa va al reporte)
update public.student_assignments a
set deleted_at = now(), status = 'archived'
where a.organization_id = '2ad5f8cc-04d2-484c-8b58-4a0cc68ac651'
  and a.deleted_at is null
  and a.resource_type = 'training_program'
  and a.resource_id in (
    select id from public.training_programs
    where name = 'Full Body Cutover'
      and organization_id = '2ad5f8cc-04d2-484c-8b58-4a0cc68ac651'
  )
  and a.client_id in (
    select id from public.clients
    where deleted_at is not null
      and organization_id = '2ad5f8cc-04d2-484c-8b58-4a0cc68ac651'
  )
returning 'student_assignments' as tabla, id, client_id, resource_id;

-- =============================================================================
-- REPORTE — DUDAS / NO TOCADO (revisa y decide manualmente; el script NO los borra)
-- =============================================================================

-- (a) Asignación del programa de prueba para un CLIENTE ACTIVO (Jesus) — al quitar
--     el programa, este alumno quedará "sin programa" hasta que le asignes uno real.
select 'DUDA · asignación de cliente activo a programa de prueba' as reporte,
  a.id, c.name as cliente, a.resource_type, a.status
from public.student_assignments a
join public.clients c on c.id = a.client_id
where a.organization_id = '2ad5f8cc-04d2-484c-8b58-4a0cc68ac651'
  and a.deleted_at is null
  and a.resource_type = 'training_program'
  and c.deleted_at is null
  and a.resource_id in (
    select id from public.training_programs
    where name = 'Full Body Cutover'
      and organization_id = '2ad5f8cc-04d2-484c-8b58-4a0cc68ac651'
  );

-- (b) Foto de progreso VACÍA (sin imagen). `progress_photos` NO tiene columna
--     `deleted_at` -> no se puede soft-delete; borrarla requeriría DELETE físico
--     (prohibido). Decisión manual (o migración futura que agregue deleted_at).
select 'DUDA · progress_photos sin deleted_at (no soft-deletable)' as reporte,
  id, client_id, date, front, side, back, url
from public.progress_photos
where organization_id = '2ad5f8cc-04d2-484c-8b58-4a0cc68ac651'
  and coalesce(url, '') = '' and coalesce(front, '') = ''
    and coalesce(side, '') = '' and coalesce(back, '') = '';

-- (c) Evaluaciones/CRM ligadas a clientes de prueba YA borrados (quedan ocultas
--     porque su cliente está soft-deleted; se listan por transparencia, NO se tocan).
select 'INFO · evaluaciones de clientes ya borrados' as reporte, e.id, e.client_id
from public.evaluations e
join public.clients c on c.id = e.client_id
where e.organization_id = '2ad5f8cc-04d2-484c-8b58-4a0cc68ac651'
  and c.deleted_at is not null;

-- FIN (solo soft-delete + reporte).
