# Supabase — SQL de migración (Fase 0 y Fase 1)

Fuente de verdad del modelo: **`../DATABASE_MASTER_PLAN.md`**.
Aquí solo vive el SQL. Estado: **Fase 0 y Fase 1** (identidad/tenant). Fases 2–15 aún
no implementadas.

## Cómo ejecutar

En el **SQL Editor** de Supabase (o `supabase db push` si usas la CLI), ejecutar en
este orden exacto:

| # | Archivo | Naturaleza | Riesgo | Conservar/Eliminar |
|---|---|---|---|---|
| 1 | `migrations/0000_phase0_infra.sql` | Solo estructura | Bajo | **Conservar** |
| 2 | `migrations/0001_phase1_identity_tables.sql` | Solo estructura | Bajo | **Conservar** |
| 3 | `migrations/0002_phase1_functions.sql` | Solo estructura | Bajo-Medio | **Conservar** |
| 4 | `migrations/0003_phase1_rls_policies.sql` | Estructura/seguridad | Medio | **Conservar** |
| 5 | `migrations/0004_phase1_storage.sql` | Estructura + config buckets | Medio | **Conservar** |

- Ninguno inserta datos de negocio. Ninguno contiene `DROP`/`DELETE` de datos.
- Todos son **idempotentes** (se pueden re-ejecutar sin error).
- Reversibles con `DROP` de las funciones/tablas/policies creadas (bajo confirmación).

## Qué crea

- **Fase 0:** extensión `pgcrypto`, `set_updated_at()`, tabla `audit_logs` (+RLS
  bloqueada) y `audit_trigger()` genérico.
- **Fase 1:** tablas `organizations`, `profiles`, `memberships`, `coaches`
  (+ índices, `updated_at` y triggers de auditoría); helpers RLS
  (`current_org_ids`, `has_org_role`, `is_org_staff`); trigger `handle_new_user`
  (crea el profile al registrarse); RPC `create_organization`; políticas RLS; y los
  buckets de Storage con sus políticas.

## Pendiente (próximas fases, NO aquí)

- `my_client_id()` y la escritura de `progress-photos` por el alumno → **Fase 5**
  (necesitan la tabla `clients`).
- Resto del catálogo, actividad, chat, CRM, notificaciones, pagos, citas y reportes.

## Verificación

Sin Postgres local en este entorno, la validación de **sintaxis** se hizo de forma
estática (bloques `$$` balanceados, sentencias terminadas, sin `DROP/DELETE` de datos).
La validación en **runtime** se realiza al ejecutar cada script en Supabase (que
reporta cualquier error de dependencia o permisos). Ejecutar en el orden de la tabla.
