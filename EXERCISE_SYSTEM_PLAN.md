# Sistema de ejercicios/programas — Arquitectura definitiva

> Estado: **DISEÑO** (aprobación en curso). NO implementar hasta OK del usuario. Fuente:
> auditoría del flujo de ejercicios + visión final del producto. Sin merge/push.

## 1. Visión final del producto (fuente de verdad)
1. El coach tiene **control absoluto** sobre todo lo que ve el alumno.
2. Un ejercicio **NO aparece** para el alumno solo por existir en la biblioteca.
3. Flujo: **Coach → crea ejercicio → biblioteca privada del coach → lo asigna a uno o
   varios programas → asigna el programa a uno o varios alumnos → el alumno ve únicamente
   los ejercicios de ese programa.**
4. El alumno **nunca** ve ejercicios no asignados, **salvo** que el coach los **publique**.
5. **Descubre** = catálogo público controlado por el coach. Cada ejercicio tiene estado
   **Privado** (solo programas internos) o **Público** (aparece en Descubre).
6. Asignar el **mismo programa a muchos alumnos con un clic**.
7. Cambiar el programa de un alumno y que se refleje **de inmediato**.
8. Varios programas reutilizables (Principiante, Hipertrofia, Definición…) **sin duplicar
   ejercicios**.
9. Si el coach **modifica un ejercicio**, TODOS los programas que lo usan se actualizan
   **automáticamente**.
10. Los ejercicios existen **una sola vez** en la BD; los programas solo los **referencian**
    (nunca copias por alumno).
11. **Futuro:** un alumno podrá tener **varios programas** (Fuerza, Cardio, Rehabilitación,
    Nutrición) y **uno será el principal**. Preparar la BD desde ahora para no rehacerla.

## 2. ¿El modelo actual soporta esta evolución? (evaluación)
| Requisito | ¿Soportado hoy? | Acción |
|---|---|---|
| Ejercicios compartidos, sin copias por alumno (10) | **SÍ** — `training_exercises.exercise_id → library_exercises` | Ninguna |
| Un ejercicio en varios programas (3) | **SÍ** — es N:N vía filas `training_exercises` | Ninguna (UI opcional de "agregar a varios") |
| Editar ejercicio → se refleja en todos los programas (9) | **PARCIAL** — la ficha (imagen/técnica/video) se resuelve **en vivo**, pero el **nombre** está denormalizado en `training_exercises` | Resolver el **nombre en vivo** desde la biblioteca (denormalizado = solo fallback si se borró) |
| Cambiar/reasignar programa, reflejo inmediato (7) | **SÍ** (reasignación) | + refetch al enfocar la página |
| Varios programas reutilizables (8) | **SÍ** | Ninguna |
| Privado/Público, Descubre controlado (2,4,5) | **NO** — `library_exercises` no tiene estado de visibilidad | + columna `visibility` (default **private**) |
| Asignar a muchos alumnos con un clic (6) | **NO** (hoy es de a uno) | + asignación múltiple |
| **Varios programas por alumno, uno principal (11)** | **PARCIAL** — `student_assignments` es GENÉRICA (`resource_type`: training_program, nutrition_plan, course, challenge, document, routine, exercise) → ya admite múltiples filas por alumno; falta marcar el **principal** | + columna `is_primary` (+ `label`) AHORA, comportamiento sin cambiar |

**Conclusión:** la base es **correcta y no hay que rehacerla**. Solo hacen falta **ajustes
aditivos pequeños** (2 columnas nuevas) para dejarla lista para el escenario futuro.

## 3. Modelo relacional definitivo
```
organizations
   └─ library_exercises (id, name, ..., visibility 'private'|'public', deleted_at)   ← 1 sola vez
        ▲ exercise_id (FK, ON DELETE SET NULL)
   └─ training_programs → training_days → training_exercises (exercise_id + sets/reps/rest/notes)
        ▲ resource_id
   └─ student_assignments (client_id, resource_type, resource_id, status, is_primary, label)
        └─ clients (alumno)
```
- **Ejercicio ↔ Programa** = N:N (una fila `training_exercises` por uso; comparten
  `exercise_id`). Editar el ejercicio impacta a todos los programas (ficha en vivo).
- **Programa ↔ Alumno** = N:N vía `student_assignments` (un programa a muchos alumnos;
  un alumno a muchos programas). `is_primary` marca el principal; `resource_type`
  distingue Fuerza/Cardio/Nutrición… `status` (active/paused/completed/archived).
- **La prescripción** (sets/reps/rest/notes) vive en `training_exercises` (es del
  programa, no del ejercicio) → correcto que NO cambie al editar la ficha global.

## 4. Modelo de visibilidad (Privado/Público)
- Nueva columna `library_exercises.visibility text not null default 'private'
  check (visibility in ('private','public'))`.
- **Privado (default):** solo se usa dentro de programas; NO aparece en Descubre.
- **Público:** aparece en Descubre (catálogo del coach).
- **Regla dura:** la visibilidad SOLO gobierna Descubre. El **entrenamiento asignado
  resuelve el ejercicio por `exercise_id` SIEMPRE** (aunque sea privado) → nunca rompe un
  programa por ocultar un ejercicio.
- RLS: `library_exercises` sigue SELECT para miembros de la org (necesario para resolver
  programas). Descubre filtra `visibility='public'` en la query.
- **Nota de migración:** al aplicar, las filas existentes quedan `private` → Descubre
  aparecerá vacío hasta que el coach **publique**. Es el comportamiento pedido (2/4/5).

## 5. Varios programas por alumno + principal (futuro, preparado ahora)
- `student_assignments` gana `is_primary boolean not null default false` y
  `label text not null default ''` (nombre visible tipo "Fuerza", "Cardio").
- **Ahora:** se mantiene el comportamiento actual (1 programa de entrenamiento activo =
  el principal; `assignToClient` marca `is_primary=true`). **Sin cambio de UX.**
- **Futuro (sin nueva migración):** permitir varias filas `active` por alumno; el alumno
  ve todas sus "tarjetas" de programa y el `is_primary` define la vista por defecto.
- Nutrición ya encaja como `resource_type='nutrition_plan'` (Bloque 6) → un "programa" más.

## 6. Plan por fases (cada una: lint+build+verificación local y supabase; sin push hasta OK)
- **E1 — Backend único (raíz del problema):** Vercel `NEXT_PUBLIC_DATA_BACKEND=supabase`,
  SIN `NEXT_PUBLIC_SUPABASE_REPOS`. Guard opcional en `backend.ts` que avisa si hay mezcla.
- **E2 — Visibilidad Privado/Público:** migración `0021` (`visibility` en
  `library_exercises`); tipo `LibraryExercise.visibility`; repos Local/Supabase; toggle
  **Publicar/Ocultar** en el admin de biblioteca; Descubre filtra `public` + **dedupe**.
- **E3 — Nombre en vivo + sync:** la vista del alumno y `/entrenar` resuelven el **nombre**
  desde la biblioteca (fallback al denormalizado si se borró) + **refetch al enfocar**.
- **E4 — Asignación múltiple:** un programa a **varios alumnos** de un clic
  (`assignToClients`), + cambio/reasignación inmediata.
- **E5 — Futuro-proof asignaciones:** migración `0022` (`is_primary` + `label` en
  `student_assignments`); `assignToClient` marca `is_primary=true` (comportamiento igual).
- **E6 — Limpieza de datos demo (revisable):** `supabase/seed/0104_cleanup_demo_exercises.sql`
  (LISTA + soft-delete de ejercicios/programas de prueba de la org, idempotente); seeds
  `src/data/*` quedan SOLO para modo local/demo; org nueva empieza vacía.

## 7. Archivos por fase
| Fase | Archivos |
|---|---|
| E1 | Vercel env · `src/repositories/backend.ts` (guard) |
| E2 | `supabase/migrations/0021_library_exercise_visibility.sql` · `src/types` · `src/repositories/{local,supabase}/exercise-library.repository.ts` · `src/data/exercise-library.ts` (default visibility) · `src/components/admin/exercise-library.tsx` · `src/app/descubre/page.tsx` |
| E3 | `src/components/dashboard/training-program-view.tsx` · `src/app/entrenar/page.tsx` |
| E4 | `src/components/admin/training-programs.tsx` · `src/services/training.service.ts` · `src/repositories/{local,supabase}/training-program.repository.ts` · `src/repositories/types.ts` |
| E5 | `supabase/migrations/0022_student_assignment_primary.sql` · repos/servicio de asignación (marcar is_primary) |
| E6 | `supabase/seed/0104_cleanup_demo_exercises.sql` · `src/data/exercise-library.ts` · `src/data/training.ts` |

## 8. Qué cambia respecto a la propuesta inicial (auditoría)
1. **Visibilidad = enum `visibility('private'|'public')` con default `private`** (antes:
   `visible boolean default true`). Cumple "no aparece solo por existir" y "Privado/Público".
2. **#9 nombre en vivo:** resolver el **nombre** del ejercicio desde la biblioteca (antes
   solo se resolvía la ficha; el nombre quedaba denormalizado). El denormalizado pasa a ser
   fallback para ejercicios borrados.
3. **Nueva fase E5 (`is_primary`+`label` en `student_assignments`)** para dejar lista la BD
   para "varios programas por alumno con uno principal" SIN rehacerla luego (antes no estaba).
4. El resto (backend único, dedupe, refetch, asignación múltiple, limpieza demo) se mantiene.

## 9. Reglas
- Nada destructivo sin OK; migraciones **nuevas y aditivas** (0021, 0022), idempotentes,
  sin `DROP/DELETE` de datos. Local/Supabase en paridad. Sin push/commit hasta confirmar
  cada fase. No romper auth/registro/dashboards.
```
