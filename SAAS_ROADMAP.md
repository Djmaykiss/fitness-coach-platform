# SaaS Roadmap — Orden definitivo del proyecto

> Estado: **DIRECCIÓN DEFINITIVA APROBADA** (sin código aún). Este documento fija el ORDEN
> de trabajo; el "cómo" detallado vive en los documentos enlazados. Sin merge/push hasta
> confirmar cada fase. La app es de **PRODUCCIÓN**, no una demo.

## Objetivo final
Una única arquitectura compartida por TODA la plataforma, mantenible durante años, lista
para producción, sin datos demo, sin lógica duplicada. Todo el contenido lo administra el
coach; el alumno solo consume lo publicado/asignado.

## Principio único de contenido (para TODA la plataforma)
```
Coach crea → Coach administra → Coach publica → Coach asigna → Alumno consume
```
`sin contenido = placeholder profesional` · `con contenido = real` · `nunca demo/ficticio`.

## Orden definitivo (5 fases)

### FASE 1 — Eliminar la filosofía demo (producción-ready)
Nada de contenido ficticio ni seeds visibles; Empty-States profesionales; todo administrado
por el coach; instalación/organización nueva empieza vacía.
- Detalle y checklist: **`PRODUCTION_READINESS_PLAN.md`** (P1–P5 + REGLA de empty-state).
- Incluye: flag `NEXT_PUBLIC_DEMO_CONTENT` (default `false`); gatear landing (Mock),
  login (bloque demo) y dashboard (`coaching.service`) → placeholders; gatear la siembra
  local; higiene de datos demo en Supabase (`0104_cleanup_demo.sql`, revisable).
- Prerrequisito de CONFIG (no código, puede hacerse ya): apuntar **producción a Supabase**
  (`NEXT_PUBLIC_DATA_BACKEND=supabase`, sin override) → resuelve de inmediato "el coach y
  el alumno no se ven". La RETIRADA formal del flag/Local es la Fase 4.

### FASE 2 — Arquitectura definitiva del contenido (un solo patrón)
Un patrón ÚNICO para todos los tipos de contenido: Ejercicios, Programas, Planes, Nutrición,
Recursos, Artículos, Transformaciones, Testimonios, Biblioteca multimedia.
- Detalle de ejercicios/programas: **`EXERCISE_SYSTEM_PLAN.md`** (Privado/Público default
  privado; 1 ejercicio referenciado por muchos programas; varios programas por alumno con
  uno principal `is_primary`; asignación múltiple; nombre en vivo).
- Patrón universal "Módulo de contenido" (a documentar en detalle al entrar la fase):
  entidad con `organization_id`, `visibility (private|public)` cuando aplique, estado
  `published`, timestamps + `deleted_at` (soft delete); CRUD del coach + publicar/asignar;
  vista del alumno solo de lo publicado/asignado; Empty-State cuando no hay contenido.
  Los módulos existentes que aún son seed (marketing de la landing) se migran a este patrón
  (CMS del coach).

### FASE 3 — Sistema multimedia único (Media Manager centralizado)
UN solo sistema de imágenes Y videos reutilizable en toda la plataforma (fotos de perfil,
Antes/Después, ejercicios, programas, planes, biblioteca, recursos, artículos, galerías,
portadas, testimonios, landing, dashboard). Nada de sistemas separados por módulo.
- Base ya construida (reutilizar, NO rehacer): **`IMAGE_SYSTEM_PLAN.md`** — Fase 1A
  (compresión + `storageRepository` dual + `<ImageUploader>`) y Fase 1B (`media_assets` +
  `mediaService`/`mediaRepository`) YA existen. La Fase 3 los **generaliza** a un **Media
  Manager**: soporte de VIDEO, biblioteca multimedia navegable, selección/reutilización de
  assets entre módulos, y el patrón de puentes por dominio sobre `media_assets`.

### FASE 4 — Backend único (Supabase, sin mezclas)
Todo funciona SOLO con Supabase en producción: retirar el flag `NEXT_PUBLIC_DATA_BACKEND`,
retirar el override por-repo, retirar/relegar los `Local*` a modo offline/dev, sin
comportamientos distintos. Es el **Bloque 11** de la migración (limpieza / congelar).
- Se hace DESPUÉS de tener la arquitectura limpia (Fases 1–3) para no arrastrar deuda.
- Regla vigente hasta aquí: no se elimina ningún `Local*` ni el flag hasta esta fase.

### FASE 5 — Optimización
Realtime, cache, lazy loading, WebP, miniaturas, compresión, CDN, optimización móvil,
performance. Parte ya iniciada en el sistema multimedia (WebP/miniatura/compresión en
`IMAGE_SYSTEM_PLAN.md` Fase 3); aquí se completa a nivel plataforma.

## REGLA PERMANENTE — Reutilizar antes de crear (anti-duplicación)
Antes de agregar CUALQUIER módulo nuevo (CRM, Agenda, IA, Pagos, etc.) es OBLIGATORIO
revisar primero si puede **reutilizar la arquitectura existente** antes de crear tablas,
sistemas de imágenes o formas de almacenamiento nuevas:
1. ¿Puede usar el **patrón de módulo de contenido** (entidad org-scoped + CRUD del coach +
   visibility/published + soft delete + Empty-State + vista de solo-consumo del alumno)?
2. ¿Sus imágenes/videos van por el **Media Manager** (`media_assets` + `storageService`)?
   Nunca un sistema de imágenes nuevo por módulo.
3. ¿Sus asignaciones a alumnos van por **`student_assignments`** (genérica: resource_type)?
4. ¿Su persistencia sigue el patrón **UI → service → repository (dual/único) → storage**?
5. ¿Reutiliza componentes UI comunes (Empty-State, `<ImageUploader>`, tabs, tarjetas)?
Solo si NADA de lo anterior aplica se justifica una tabla/sistema nuevo, y debe quedar
documentado. Objetivo: una sola arquitectura, sin lógica duplicada, mantenible por años.

## Documentos de referencia
- `PRODUCTION_READINESS_PLAN.md` — Fase 1 (eliminar demo + Empty-States).
- `EXERCISE_SYSTEM_PLAN.md` — Fase 2 (ejercicios/programas; patrón de contenido).
- `IMAGE_SYSTEM_PLAN.md` — Fase 3 (multimedia; base ya construida en 1A/1B).
- `APP_MIGRATION_PLAN.md` / `DATABASE_MASTER_PLAN.md` — Fase 4 (backend único / Bloque 11).
- `CLAUDE.md` — reglas permanentes (filosofía, empty-state, reutilizar-antes-de-crear).

## Reglas transversales
Migraciones nuevas y aditivas (idempotentes, sin `DROP/DELETE` de datos sin OK);
Local/Supabase en paridad hasta la Fase 4; lint + build + verificación (local y supabase) +
responsive por fase; se documenta en `CLAUDE.md`; sin commit/push hasta confirmación.
```
