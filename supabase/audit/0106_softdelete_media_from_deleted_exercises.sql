-- =============================================================================
-- LIMPIEZA — SOFT-DELETE de media_assets ligados a EJERCICIOS YA BORRADOS
-- Fase 1 · E6 (follow-up de 0105). Ejecutar en el SQL Editor.
-- -----------------------------------------------------------------------------
-- ANOTACIÓN
--   1) Naturaleza : SOLO `UPDATE ... set deleted_at = now()` (soft-delete). NO hay
--                   DELETE físico. NO toca schema.
--   2) Riesgo     : BAJO. Solo marca la multimedia (`media_assets`) que está ligada
--                   —vía el puente `exercise_media`— a `library_exercises` que YA
--                   están soft-deleted. No toca ejercicios activos ni su media, ni
--                   clientes/usuarios/coaches/organizaciones/planes/programas.
--   3) Persistencia: se CONSERVA el archivo como registro. Efecto REVERSIBLE
--                    (`deleted_at = null` restaura).
-- -----------------------------------------------------------------------------
-- Idempotente: `deleted_at is null` -> re-ejecutar devuelve 0 filas.
-- `returning` muestra exactamente qué se marcó.
-- Org: "Coach Fitness" = 2ad5f8cc-04d2-484c-8b58-4a0cc68ac651.
-- Contexto: son los 7 media (links YouTube/imagen/gif) de los 3 ejercicios
--   "Sentadilla*" soft-deleted en 0105; ya invisibles (su ejercicio está borrado).
-- =============================================================================

update public.media_assets
set deleted_at = now()
where organization_id = '2ad5f8cc-04d2-484c-8b58-4a0cc68ac651'
  and deleted_at is null
  and id in (
    select em.media_id
    from public.exercise_media em
    join public.library_exercises le on le.id = em.exercise_id
    where le.deleted_at is not null                                   -- ejercicio YA borrado
      and le.organization_id = '2ad5f8cc-04d2-484c-8b58-4a0cc68ac651'
  )
returning 'media_assets' as tabla, id, kind, url;

-- FIN (solo soft-delete de media de ejercicios ya borrados).
