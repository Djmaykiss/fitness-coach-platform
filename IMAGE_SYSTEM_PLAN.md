# Sistema de imágenes — Arquitectura y plan de implementación

> Estado: **DISEÑO APROBADO**. Se implementa **por fases**, cada fase con lint + build +
> verificación (local y supabase) + commit local, **sin merge/push hasta confirmación**.
> Fuente de patrones: `CLAUDE.md`, `APP_MIGRATION_PLAN.md`, `DATABASE_MASTER_PLAN.md`.

## Objetivo
Subsistema **profesional y escalable** (miles de usuarios) para subir imágenes en toda la
plataforma, con **compresión en el navegador**, preview, drag & drop, barra de progreso y
reintento, guardando en **Supabase Storage** en producción y en **IndexedDB** en modo
local, manteniendo el patrón dual tras el flag `NEXT_PUBLIC_DATA_BACKEND`.

## Reglas duras
- En tablas **solo** `bucket/path/url + metadata` (mime, ancho, alto, bytes, checksum,
  thumb). **Nunca** el binario en una columna.
- Comprimir **antes** de subir. Aceptar **jpg/png/webp**. Convertir a **WebP** si el
  navegador lo soporta (si no, JPEG de alta calidad).
- Patrón por capas: `UI (<ImageUploader/>) → service → repository → storage`. La UI nunca
  toca Storage directamente.
- Dual **Local/Supabase** tras el flag; los `Local*` no se eliminan (rollback).
- Migraciones **nuevas** (no modificar previas). Sin `DROP/DELETE` de datos.

## Decisiones (confirmadas con el usuario)
1. **Metadata sobre `media_assets`** (tabla genérica ya existente, mig. `0008`) + puentes
   por dominio — NO se crea `content_media` paralela.
2. **Buckets: reusar los existentes + agregar faltantes** (no un único `coach-fitness-media`,
   para conservar la RLS por dominio ya endurecida en `0004`/`0007`).
3. **Subida resumible (tus)** vía el endpoint resumible de Supabase Storage
   (`tus-js-client`) → barra de progreso real + reintento robusto.

## Reconciliación con lo existente
- `media_assets` (0008): `id, organization_id, kind, bucket, path, url, mime, size, title,
  created_by, timestamps, deleted_at`. RLS: **staff CRUD**, SELECT miembros de la org.
  → Se **extiende** (ALTER en migración nueva) con `width, height, checksum, thumb_path,
  thumb_url, context, owner_kind, owner_id, metadata jsonb`.
- `progress_photos` (0014): forma `front/side/back` texto, **RLS de alumno** (dueño) +
  staff. → Se **extiende** a modelo fila-por-foto con `phase (before|after|progress)` +
  columnas de storage; las filas viejas siguen legibles.
- Buckets existentes (0004/0007): `progress-photos` (privado, carpeta por dueño),
  `exercise-images`, `discover-images`, `nutrition-images`, `logos` (públicos). Se
  **agregan** los que falten: `transformation-images`, `content-media` (públicos).
- **RLS derivada clave**: `media_assets` es **staff-write** → el **contenido del coach**
  usa `media_assets` + puentes; las **fotos del alumno** (privadas) usan
  `progress_photos`/`transformation_photos` (RLS de alumno dueño), NO `media_assets`.

## Arquitectura
```
<ImageUploader/>  (drag&drop · preview · progress · retry · responsive)
   │ 1) valida (jpg/png/webp) + comprime (canvas → WebP/JPEG) + miniatura
   ▼
 storageService ─► storageRepository  (pickRepository por flag)
   │                 ├─ Local:    IndexedDB (blob)  → { path, url:dataURL }
   │                 └─ Supabase: Storage tus upload → { path, url|signedUrl }  (+progreso)
   ▼ 2) para contenido del coach:
 mediaService  ─► mediaRepository → fila en `media_assets` (+ puente por dominio)
   │ 2') para fotos del alumno:
 coachingService/…-► progress_photos / transformation_photos (storage ref + fase)
```

### Piezas nuevas
- `src/lib/image-compress.ts` — compresión canvas (downscale a lado máx configurable por
  contexto; re-encode WebP si `canvas.toBlob('image/webp')` soporta, si no JPEG ~0.82) +
  generación de miniatura (~400px). Devuelve `{ blob, width, height, size, mime, thumb }`.
  Rechaza tipos no permitidos. Calcula `checksum` (SHA-256 del blob) para dedupe.
- `storageRepository` (interfaz en `types.ts`) + `LocalStorageRepository` (IndexedDB,
  store `media-blobs`; guarda blob y devuelve dataURL) + `SupabaseStorageRepository`
  (tus resumible con `onProgress`, `remove`, `getPublicUrl`, `createSignedUrl`). Cableado
  en `index.ts` con `pickRepository` (repoKey `storage`).
- `src/services/storage.service.ts` — orquesta compresión + subida + (opcional) fila de
  media; expone `upload(file, { context, ownerKind, ownerId, onProgress })`,
  `remove(ref)`, `getUrl(ref)`.
- `mediaService` + `mediaRepository` (Local + Supabase) sobre `media_assets`.
- `src/components/media/image-uploader.tsx` — componente reutilizable controlado
  (`onUploaded(assets)`), 1 o N archivos, preview, barra de progreso por archivo,
  reintentar, eliminar; responsive; accesible.
- Migración `0020_media_storage.sql` (NUEVA): buckets faltantes + RLS de Storage;
  `ALTER media_assets` (columnas nuevas); `ALTER progress_photos` (fila-por-foto + storage);
  `transformation_photos`. Idempotente, sin borrar datos.

## Fases

### FASE 1 — Infraestructura (sin cablear pantallas; se prueba con harness)
- **1A (frontend, sin BD, verificable en local):** `image-compress.ts` + `storageRepository`
  (Local IndexedDB + Supabase tus, ambos completos) + `storageService` + `<ImageUploader>`
  + dep `tus-js-client`. Verificar en modo local (comprime, guarda en IndexedDB, preview,
  progreso) y en supabase contra un bucket existente (`exercise-images`).
- **1B (BD + metadata):** migración `0020_media_storage.sql` (aplicar en Supabase) +
  `mediaService`/`mediaRepository` sobre `media_assets`. Verificar en vivo (staff sube →
  fila `media_assets` + objeto en Storage; alumno no puede en buckets ajenos).

### FASE 2 — Cableado
- **Alumno:** subir Antes/Después/Progreso (ilimitadas) desde dashboard/perfil; línea de
  tiempo; comparador Antes/Después (reusa `BeforeAfter`). Persiste en
  `progress_photos`/`transformation_photos`.
- **Coach:** reemplazar los campos "Imagen (URL)" por `<ImageUploader>` en: ejercicios,
  planes, transformaciones, artículos/rutinas de Descubre, recursos, portadas, galerías +
  **biblioteca multimedia** (navegador de `media_assets` reutilizable).

### FASE 3 — Optimización
- Miniaturas automáticas (ya generadas en 1A; exponer/usar), **WebP**, **lazy loading**
  (`loading="lazy"`/`next/image`), **cache** (`cacheControl` en Storage), **borrado
  seguro** (Storage + fila + puente), **reemplazo**, edición de **metadata**, organización
  por **carpetas** (`{org}/{context}/{ownerId}/{assetId}.<ext>`), **dedupe** por checksum.

## Convención de rutas (paths en Storage)
`{organization_id}/{context}/{ownerId}/{assetId}.<ext>` (contenido del coach) ·
`{organization_id}/{client_id}/{phase}/{assetId}.<ext>` (fotos del alumno, bucket privado).

## Estrategia de pruebas por fase
Lint + build + verificación en vivo **en ambos modos** (local: IndexedDB; supabase: Storage
real) + responsive 320–1440 + consola limpia. RLS: alumno solo su carpeta/filas; staff toda
su org; anónimo nada. Cada fase se documenta en `CLAUDE.md` y cierra con commit local.
```
