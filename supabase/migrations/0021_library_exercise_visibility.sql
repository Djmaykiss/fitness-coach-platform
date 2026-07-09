-- =============================================================================
-- EJERCICIOS · Privado/Público — `library_exercises.visibility`
-- Fase 2 · E2 de EXERCISE_SYSTEM_PLAN.md   (requiere 0009 aplicada)
-- -----------------------------------------------------------------------------
-- ANOTACIÓN DEL SCRIPT
--   1) Naturaleza : SOLO ESTRUCTURA (1 columna nueva + 1 índice). ADITIVO. No inserta
--                   ni borra datos; no toca migraciones anteriores.
--   2) Riesgo     : BAJO. `add column if not exists` con default -> las filas existentes
--                   quedan `private` (el default) sin alterar ninguna otra columna; no
--                   rompe los ejercicios existentes.
--   3) Persistencia: CONSERVAR (esquema permanente).
-- -----------------------------------------------------------------------------
-- Modelo: `visibility` = 'private' | 'public'. DEFAULT 'private' -> TODO ejercicio
--   nuevo (y los existentes al migrar) nace PRIVADO; solo el coach lo hace público.
-- IMPORTANTE (comportamiento):
--   - La visibilidad SOLO gobierna Descubre (catálogo). El entrenamiento asignado
--     resuelve el ejercicio por id SIEMPRE (aunque sea privado) -> nunca rompe un
--     programa por ocultar un ejercicio.
--   - La RLS de `library_exercises` (0009: SELECT para miembros de la org, staff-CRUD)
--     NO cambia. Descubre filtra `visibility = 'public'` en la query (capa de app).
--   - Efecto al aplicar: los ejercicios existentes pasan a `private` -> Descubre se ve
--     vacío hasta que el coach PUBLIQUE (comportamiento pedido).
-- Idempotente (`add column if not exists` / `create index if not exists`).
-- =============================================================================

alter table public.library_exercises
  add column if not exists visibility text not null default 'private'
    check (visibility in ('private', 'public'));

create index if not exists library_exercises_visibility_idx
  on public.library_exercises (organization_id, visibility);

-- FIN E2 (visibility).
