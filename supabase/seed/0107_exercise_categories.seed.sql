-- =============================================================================
-- BOOTSTRAP — 8 categorías de ejercicios (taxonomía real, NO demo)
-- Fase 2 · galería por categoría. Reutiliza `exercise_categories` (0008) +
-- `library_exercises.category_id` (0009). NO crea tablas.
-- -----------------------------------------------------------------------------
-- ANOTACIÓN
--   1) Naturaleza : DATOS (INSERT de 8 filas de catálogo). NO borra ni actualiza nada;
--                   NO toca schema. Es contenido REAL (categorías base), no demo.
--   2) Riesgo     : BAJO. Idempotente: solo inserta las que FALTAN (WHERE NOT EXISTS por
--                   org + name). Re-ejecutar -> 0 filas.
--   3) Persistencia: CONSERVAR.
-- -----------------------------------------------------------------------------
-- Org: "Coach Fitness" = 2ad5f8cc-04d2-484c-8b58-4a0cc68ac651 (cambia el uuid si aplicas
--   en otra org). El coach puede editar/añadir/eliminar categorías después desde el panel.
-- `icon` = clave estable que la UI mapea a un ícono; `position` = orden de aparición.
-- =============================================================================

insert into public.exercise_categories (organization_id, name, icon, position)
select '2ad5f8cc-04d2-484c-8b58-4a0cc68ac651'::uuid, v.name, v.icon, v.position
from (values
  ('Piernas',   'legs',      0),
  ('Pecho',     'chest',     1),
  ('Espalda',   'back',      2),
  ('Brazos',    'arms',      3),
  ('Hombros',   'shoulders', 4),
  ('Core',      'core',      5),
  ('Cardio',    'cardio',    6),
  ('Movilidad', 'mobility',  7)
) as v(name, icon, position)
where not exists (
  select 1 from public.exercise_categories c
  where c.organization_id = '2ad5f8cc-04d2-484c-8b58-4a0cc68ac651'::uuid
    and c.name = v.name
    and c.deleted_at is null
)
returning 'exercise_categories' as tabla, name, icon, position;

-- FIN (bootstrap categorías).
