# Repositorios Supabase

Implementaciones `Supabase*Repository` que cumplen las MISMAS interfaces de
`src/repositories/types.ts`. Fuente de verdad del proceso: `APP_MIGRATION_PLAN.md`.
Fuente de verdad del esquema: `DATABASE_MASTER_PLAN.md`.

> Estado: **Bloque 0 (fundaciones)**. Aún **no hay ningún repositorio migrado**. Esta
> carpeta contiene solo utilidades (`mappers.ts`, `query.ts`) y este patrón.

## Variables de entorno (no se commitean; `.env*` está en `.gitignore`)

Crear `.env.local` con:

```
NEXT_PUBLIC_SUPABASE_URL=https://<proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>

# Selector de backend (default local):
NEXT_PUBLIC_DATA_BACKEND=local            # o "supabase" (cutover global)
# Override por-repo en desarrollo (opcional):
NEXT_PUBLIC_SUPABASE_REPOS=exerciseLibrary,discover

# Solo para seeds/import locales (NUNCA en el cliente):
# SUPABASE_SERVICE_ROLE_KEY=<service role>
```

Mientras `NEXT_PUBLIC_DATA_BACKEND=local` (default) y no haya repos en
`NEXT_PUBLIC_SUPABASE_REPOS`, la app funciona 100% con `localStorage` (los
`Supabase*Repository` no se instancian).

## Patrón para implementar un repositorio (a partir del Bloque 2)

1. Aplicar antes su(s) fase(s) de BD (ver `DATABASE_MASTER_PLAN.md`).
2. Crear `src/repositories/supabase/<nombre>.repository.ts` que implemente la interfaz
   de `types.ts` (mismas firmas, sin cambiarlas).
3. Usar `getSupabaseClient()` (via `query.ts`), `unwrap*/assertOk` para las respuestas y
   `keysToSnake/keysToCamel/definedOnly` para el mapeo dominio↔fila.
4. Fijar `organization_id` en los INSERT con el resolver de org (se añade en el bloque
   de Auth). Las lecturas las scopea RLS.
5. Cablearlo en `src/repositories/index.ts` con `pickRepository("<key>", localImpl, () => new Supabase...)`.
   La factoría Supabase es lazy; solo se instancia si el backend de ese repo es `supabase`.
6. Cerrar con el checklist y los criterios de "bloque terminado" de `APP_MIGRATION_PLAN.md`.

## Utilidades disponibles

- `mappers.ts`: `toSnake/toCamel`, `keysToSnake/keysToCamel`, `omit`, `definedOnly`.
- `query.ts`: `db()` (cliente), `unwrap/unwrapMaybe/unwrapList/assertOk`, `usesSupabase`.
