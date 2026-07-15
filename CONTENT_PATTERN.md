# Patrón universal de contenido — Fase 2

> Estado: **DISEÑO** (sin código). Regla base de TODO módulo de contenido de la
> plataforma. Objetivo: una sola arquitectura, sin lógica duplicada, sin demo, todo lo
> administra el coach. Fuente del orden: `SAAS_ROADMAP.md`.

## 1. Estructura común (columnas de toda entidad de contenido)
| Columna | Tipo | Nota |
|---|---|---|
| `id` | uuid pk | `gen_random_uuid()` |
| `organization_id` | uuid not null → organizations | **org-scoped** (multi-tenant) |
| `created_by` | uuid | autor (profile) |
| `title` / `name` | text not null | según el módulo |
| `description` | text default '' | opcional |
| `status` | text (enum) | `draft\|private\|public\|archived` (ver §2) |
| `position` | integer default 0 | orden manual |
| `metadata` | jsonb default '{}' | campos flexibles que no se filtran |
| `created_at` | timestamptz default now() | |
| `updated_at` | timestamptz default now() | trigger `set_updated_at` |
| `deleted_at` | timestamptz | **soft-delete** (null = activo) |

- La **multimedia NO se guarda aquí**: va por el **Media Manager** (`media_assets` +
  `storageService`), referenciada por id/puente. Nunca binarios en estas tablas.
- Lo que se **filtra/ordena** es columna; lo demás va en `metadata`.

## 2. Estados permitidos (`status`) y cuándo usar cada uno
- **`draft`** — borrador del coach, en edición. NO visible para el alumno, NO asignable,
  NO en catálogo. Trabajo en progreso.
- **`private`** — terminado pero INTERNO: se usa dentro de programas/asignaciones (p. ej.
  un ejercicio privado dentro de un programa asignado se ve/entrena). NO aparece en el
  catálogo público (Descubre/landing).
- **`public`** — publicado: aparece en el catálogo público (Descubre / landing). Cualquier
  alumno/visitante lo ve.
- **`archived`** — retirado: se oculta del catálogo y de los selectores, pero se conserva
  (recuperable; distinto de `deleted_at`, que es borrado). Filtro "archivados" para el coach.

Reglas: no todo módulo usa los 4 estados. Un módulo de **catálogo** (ejercicios, testimonios,
transformaciones, artículos) usa `draft → public/private → archived`. Un módulo **asignado**
(programas, nutrición) usa `draft → active(=asignable) → archived` (lo "público" no aplica;
la visibilidad la da la asignación). El **entrenamiento del alumno NUNCA depende de `status`**:
resuelve por id el recurso asignado aunque sea `private`.

## 3. Flujo universal
```
Coach crea (draft)
  → Coach edita
  → Coach publica (public) o mantiene interno (private)   [módulos de catálogo]
  → Coach asigna a alumno(s) via student_assignments      [módulos asignables]
  → Alumno consume SOLO lo publicado o lo asignado
  → Coach archiva (archived) o borra (soft-delete: deleted_at)
```

## 4. Reglas comunes (obligatorias en cada módulo)
1. **org-scoped**: todo lleva `organization_id`; nunca cruzar orgs.
2. **RLS**: staff (owner/admin/coach) CRUD de su org; miembros SELECT de su org;
   público (anon) solo lo `public` cuando aplique (landing). Alumno gestiona solo lo suyo.
3. **Soft-delete** siempre (`deleted_at`); nunca DELETE físico sin backup + confirmación.
4. **Empty-State** profesional (`ContentPlaceholder`) cuando no hay contenido real. Nunca
   ocultar la sección sin más; nunca datos ficticios.
5. **Sin demo**: seeds solo tras `isDemoContent()`; producción arranca vacío.
6. **Sin duplicados**: dedupe por id en las listas; un recurso existe UNA vez y se referencia.
7. **Local/Supabase en paridad**: `Local*` y `Supabase*` cumplen la MISMA interfaz; se
   eligen por `pickRepository(key, local, supabase)`.
8. **Media Manager reutilizable**: imágenes/videos por `media_assets` + `storageService` +
   `<ImageUploader>`. Nunca un sistema de imágenes por módulo.
9. **No hardcodear contenido** en componentes; todo sale de datos administrables.
10. **Todo administrable por el coach**: crear/editar/eliminar/publicar/despublicar/archivar/
    asignar desde `/admin`. El alumno solo consume.

## 5. Módulos que usarán este patrón
Ejercicios · Programas · Nutrición · Planes · Recursos · Artículos · Transformaciones ·
Testimonios · Biblioteca multimedia · Descubre.
- **Referencia ya implementada**: **Ejercicios** (Privado/Público + categorías + Descubre +
  entrenamiento independiente del estado). Es el patrón "módulo de catálogo" ejemplar.

## 6. Tablas: reutilizar vs. ajuste aditivo vs. nueva
**Reutilizar tal cual (ya cumplen el patrón):**
- `media_assets` (+ `exercise_media`) → Biblioteca multimedia (Media Manager). Tiene
  metadata/context/deleted_at.
- `student_assignments` (genérica: `resource_type`/`resource_id`/`status`) → asignaciones
  de programas/nutrición/etc. a alumnos.
- `exercise_categories`/`nutrition_categories`/`program_categories`/`tags` → taxonomía.
- `library_exercises` → Ejercicios (ya con `visibility` + `category_id`).
- `discover_routines`/`discover_categories`/`discover_articles` → Descubre/Artículos
  (tienen `published` + `deleted_at`).
- `onboarding_messages`/`rewards`/`predictions` → contenido de onboarding (`published`).
- `training_programs`/`nutrition_plans` → Programas/Nutrición (tienen `deleted_at`).
- `plans` (+ `plan_features`) → Planes comerciales (tiene `active` + `deleted_at`).

**Ajuste ADITIVO (agregar columnas; migración nueva, sin borrar):**
- Unificar el estado hacia `status text check (draft|private|public|archived)` donde hoy
  hay señales parciales: `published boolean` (discover/onboarding) y `active boolean`
  (plans) se conservan pero se COMPLEMENTAN con `status` para soportar `draft`/`archived`;
  `training_programs`/`nutrition_plans` (solo `deleted_at`) ganan `status` para tener
  borrador/archivado. Nota: `library_exercises.visibility (private|public)` ya cubre su
  caso; `status` es su superconjunto (se puede alinear luego, sin urgencia).
- Agregar `metadata jsonb default '{}'` donde falte, para campos flexibles.
- (Todo `add column if not exists`, idempotente, aditivo.)

**Tablas NUEVAS (el módulo no existe todavía):**
- `testimonials` → Testimonios de marketing (coach-curados; hoy son `Mock*` ficticios).
- `transformations` → Antes/Después de marketing curado por el coach (DISTINTO de
  `transformation_photos`, que son las fotos PRIVADAS del alumno).
- `resources` → Recursos/descargables del coach. **Alternativa preferida (reutilizar):**
  modelar Recursos como `media_assets` con `context='resource'` + `title/description`, sin
  tabla nueva. Solo crear tabla si necesita campos propios que no encajen en `metadata`.

## 7. Orden recomendado de Fase 2 (de MENOR a MAYOR riesgo)
1. **Testimonios** (tabla nueva `testimonials`) — aislado, solo landing, sin asignaciones ni
   estructura anidada. Sirve de plantilla del "módulo de catálogo" universal (CRUD + status
   + Empty-State + RLS + Local/Supabase). **Menor blast radius.**
2. **Transformaciones (marketing)** (tabla nueva `transformations`) — igual de aislado;
   reutiliza el Media Manager para las imágenes Antes/Después.
3. **Recursos** (sobre `media_assets` context='resource') + **Artículos** (`discover_articles`
   ya existe) — contenido que el alumno consume; bajo riesgo (tablas existentes o Media).
4. **Descubre** — consolidar categorías/rutinas/artículos ya existentes bajo el patrón
   (mayormente hecho; ajustes de estado/Empty-State).
5. **Planes** — existe (`plans`); ajuste aditivo de `status` + Empty-State en landing.
6. **Nutrición** y **Programas** — existen y son ASIGNABLES con estructura anidada
   (días/comidas, días/ejercicios). Mayor superficie: `status` + Empty-States + asignación
   múltiple. **Mayor riesgo** (tocan el entrenamiento/plan del alumno).
7. **Ejercicios** — **ya implementado** (referencia); solo alinear `visibility`↔`status` si se
   decide unificar (opcional, último).

## Reglas de trabajo (Fase 2)
Cada módulo: migración nueva y aditiva (idempotente) revisable antes de aplicar; UI → service
→ repository (Local+Supabase) → storage; lint + build + verificación en local (demo ON/OFF) y
Supabase; commit local; sin push hasta confirmar. Se documenta en `CLAUDE.md`.
