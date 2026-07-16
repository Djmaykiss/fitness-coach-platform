-- =============================================================================
-- RESTORE del alumno demo (Coach Fitness) — revierte un SOFT-DELETE puntual
-- -----------------------------------------------------------------------------
-- CONTEXTO: el cliente del alumno demo (`cliente@coach.com`) quedó soft-deleted
--   (`clients.deleted_at` seteado el 2026-07-07), lo que hacía que `my_client_id()`
--   devolviera NULL y rompiera el dashboard/subida de fotos del alumno en modo Supabase.
--   Auditoría previa (staff): EXISTE 1 sola fila `clients` para ese `user_id` en la org
--   (id b1c1e02a…, access_status Activo), SIN cliente activo duplicado -> restaurar es
--   seguro y no crea conflicto de integridad.
-- -----------------------------------------------------------------------------
-- ANOTACIÓN DEL SCRIPT
--   1) ¿Modifica datos? : SÍ (UPDATE de 1 fila: `deleted_at` -> NULL). NO toca esquema.
--   2) Nivel de riesgo  : BAJO (revierte un soft-delete de datos DEMO; idempotente;
--                          scoping por id + org + `deleted_at is not null`).
--   3) Persistencia     : CONSERVAR como referencia del estado esperado del demo
--                          (idempotente; puede BORRARSE tras aplicarlo si se prefiere).
-- Idempotente: si el cliente ya está activo, no hace nada. Sin DROP/DELETE.
-- Ejecutar en el SQL Editor de Supabase (o equivalente REST como staff).
-- =============================================================================

update public.clients
set deleted_at = null
where id = 'b1c1e02a-5344-4aa3-b4a1-1655ef421e91'
  and organization_id = '2ad5f8cc-04d2-484c-8b58-4a0cc68ac651'
  and deleted_at is not null;

-- Verificación (debe devolver deleted_at = null):
-- select id, name, access_status, deleted_at from public.clients
-- where id = 'b1c1e02a-5344-4aa3-b4a1-1655ef421e91';
