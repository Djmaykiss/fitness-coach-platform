# DATABASE MASTER PLAN — Coach Fitness (Supabase)

> **Fuente de verdad** del modelo de datos Supabase. Todo el SQL se deriva de este
> documento. Diseño aprobado (v2, definitivo). No modificar la arquitectura sin
> registrar la decisión aquí y en `CLAUDE.md`.
>
> Estado de implementación: **Fase 0 y Fase 1 generadas** (`supabase/migrations/`).
> Fases 2–15: solo diseño (no implementadas).

## Principios

- **Multi-tenant real** desde el inicio: raíz `organizations`; TODO lleva
  `organization_id`. Preparado para cientos de organizaciones.
- **Identidad en 4 capas:** `auth.users` (Supabase Auth) → `profiles` (identidad
  global 1:1) → `memberships` (rol dentro de una org) → `coaches` (perfil profesional).
- **Roles** (`memberships.role`): `owner | admin | coach | client`.
- **Marca / white-label** vive en `organizations`; la **info profesional** del coach
  en `coaches`.
- **Columnas comunes** en toda tabla de contenido: `id uuid`, `organization_id`,
  `created_at`, `updated_at` (trigger), `created_by`, `deleted_at` (soft delete).
- **Enums** como `text` + `CHECK` (extensibles sin migración dura). Datos flexibles en
  `jsonb`; lo que se filtra/ordena queda como columna.
- **Multimedia** genérica: `media_assets` + puentes con FK real (`exercise_media`, …).
- **Asignaciones** genéricas: `student_assignments` (`resource_type` + `resource_id`).
- **Auditoría** por trigger genérico → `audit_logs`.
- **Seguridad**: RLS `ENABLE` + `FORCE` en todas las tablas; deny-by-default.
- La migración de la app **no reescribe UI ni services**: se implementan
  `Supabase*Repository` sobre las mismas interfaces y se cambia el cableado por
  repositorio con flag `NEXT_PUBLIC_DATA_BACKEND=local|supabase`.

## Diagrama (jerarquía)

```
auth.users (Supabase Auth)
   │ 1:1
profiles ──N:M(memberships: role)── organizations (tenant raíz / marca)
                                        ├── coaches (perfil profesional)
                                        ├── clients (alumnos)
                                        ├── catálogo (exercises, programs, nutrition,
                                        │            discover, onboarding) + media/tags/cats
                                        ├── comercial (leads, evaluations, crm, student_assignments)
                                        ├── actividad alumno (progress, results, checklists, photos)
                                        ├── chat (conversations/members/messages)
                                        ├── notifications
                                        ├── negocio (plans/subscriptions/payments, appointments, reports)
                                        └── audit_logs (transversal)
```

## Inventario completo de tablas (~48)

**Tenant/identidad:** `organizations`, `profiles`, `memberships`, `coaches`.
**Taxonomía/media:** `exercise_categories`, `nutrition_categories`,
`program_categories`, `tags`, `exercise_tags`, `program_tags`, `media_assets`,
`exercise_media`.
**Catálogo del coach:** `library_exercises`, `training_programs`, `training_days`,
`training_exercises`, `nutrition_plans`, `nutrition_days`, `nutrition_meals`,
`discover_routines`, `discover_categories`, `discover_articles`, `onboarding_messages`,
`onboarding_rewards`, `onboarding_predictions`.
**Alumnos/CRM:** `clients`, `leads`, `evaluations`, `client_progress`, `crm_records`,
`crm_history`, `student_assignments`.
**Actividad del alumno:** `workout_results`, `workout_day_progress`,
`exercise_series_progress`, `nutrition_meal_progress`, `client_checklists`,
`progress_photos`.
**Chat:** `conversations`, `conversation_members`, `messages`.
**Notificaciones:** `notifications`.
**Negocio/futuro:** `appointments`, `plans`, `subscriptions`, `payments`, `reports`.
**Transversal:** `audit_logs`.
**Deprecada (no se crea):** `program_rows`.

## Buckets de Storage (`{organization_id}/{entidad}/{id}/{archivo}`)

- Públicos (lectura): `logos`, `discover-images`, `exercise-images`, `exercise-gifs`,
  `nutrition-images`.
- Privados: `avatars`, `progress-photos`, `documents`, `exercise-videos`,
  `message-attachments`, `report-files`.

## Flujo de autenticación

Supabase Auth (email/clave). Trigger `on auth.users insert` → crea `profiles`. El
owner crea su `organization` + `membership(owner)` vía RPC `create_organization`;
invita coaches (`membership(coach)`); el alumno entra por onboarding (lead→convert)
que crea `auth.users` + `clients` + `membership(client)`. Org y rol se resuelven por
`memberships`. La captura anónima del lead va por RPC `SECURITY DEFINER` (sin INSERT
abierto). `useAuth()` mantiene su API; solo cambia su implementación interna.

## Estrategia RLS

`ENABLE` + `FORCE` en todas las tablas. Helpers `SECURITY DEFINER STABLE`:
`current_org_ids()`, `has_org_role(org, roles[])`, `is_org_staff(org)`,
`my_client_id(org)` (este último se crea en la fase que crea `clients`). Patrón:
- **Staff (owner/admin/coach):** CRUD donde `organization_id ∈ current_org_ids()`.
- **Alumno (client):** SELECT de su `clients`, de sus recursos asignados
  (`student_assignments`) y del contenido `published` de su org; INSERT/UPDATE solo de
  SU actividad con `client_id = my_client_id()`.
- **Anónimo:** sin políticas directas; solo RPC de captura de lead y lectura de
  publicado por RPC/servidor.
- `audit_logs`/`payments`: SELECT staff; escritura por trigger/service-role.
- Storage: políticas por prefijo de path `{org}/…`.

## Fases de implementación

| Fase | Contenido | Estado |
|---|---|---|
| 0 | Extensiones, helpers base, `set_updated_at`, `audit_logs` + trigger de auditoría genérico | **Implementada** |
| 1 | `organizations`, `profiles`, `memberships`, `coaches` + Auth trigger + helpers RLS + RLS + Storage | **Implementada** |
| 2 | Taxonomía + media (`*_categories`, `tags`, `media_assets`) | **Implementada** |
| 3 | Catálogo (`library_exercises`+`exercise_media`, `discover_*`, `onboarding_*`) | **Implementada** |
| 4 | `leads` + `evaluations` (RPC anónima) | **Implementada** |
| 5 | `clients` + `client_progress` + `student_assignments` (+`my_client_id`) | Diseño |
| 6 | Entrenamiento (`training_programs`→días→ejercicios) | Diseño |
| 7 | Nutrición (`nutrition_plans`→días→comidas) | Diseño |
| 8 | Actividad del alumno | Diseño |
| 9 | Chat | Diseño |
| 10 | CRM (`crm_records`+`crm_history`) | Diseño |
| 11 | `notifications` | Diseño |
| 12 | Pagos | Diseño |
| 13 | `appointments` | Diseño |
| 14 | `reports` | Diseño |
| 15 | Swap final de repositorios y retiro del flag `local` | Diseño |

## Refinamientos de orden (decisiones registradas en la implementación)

- Los **helpers RLS que dependen de `memberships`** (`current_org_ids`,
  `has_org_role`, `is_org_staff`) se crean en la **Fase 1** (no en la 0), porque
  necesitan que la tabla exista. La Fase 0 solo contiene infra sin dependencia de
  tablas de negocio (`set_updated_at`, `audit_logs`, `audit_trigger`).
- `my_client_id(org)` se difiere a la **Fase 5** (necesita `clients`).
- La política de escritura de `progress-photos` por el propio alumno se difiere a la
  **Fase 5** (necesita `clients` + `my_client_id`). En Fase 1 solo se crean los buckets
  y las políticas de staff.

## Política de anotación de cada SQL

Cada archivo/bloque indica en su cabecera:
1. **Modifica datos** o **solo estructura**.
2. **Riesgo**: bajo / medio / alto.
3. **Conservar** o **eliminar** después.

Regla general: DDL (`CREATE TABLE`/índices/RLS/funciones/triggers) = estructura,
riesgo bajo, **conservar**. Seed de org/coach = datos, **conservar**. Seeds demo /
importadores únicos = datos, **eliminar** después. Ningún `DROP`/`DELETE` sin backup y
confirmación explícita.
