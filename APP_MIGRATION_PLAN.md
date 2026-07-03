# APP MIGRATION PLAN — localStorage → Supabase

> **Fuente de verdad** de la migración de la **aplicación** (capa de datos) hacia
> Supabase. El modelo de BD vive en `DATABASE_MASTER_PLAN.md`; este documento gobierna
> el **orden, dependencias, checklist, rollback, pruebas y criterios de cierre** de
> cada bloque de migración de repositorios.
>
> Estado: **Bloques 0, 1 y 2 COMPLETADOS**. La app sigue 100% en `localStorage`
> por defecto (flag `local`); los Bloques 1 (Auth + Organización/Settings) y 2
> (Catálogo del coach) están migrados y verificados en vivo, activables por flag.
> Bloques 3–11 pendientes.

## Progreso

- **Bloque 2 — Catálogo del coach (HECHO):** BD Fases 2 y 3 aplicadas
  (`supabase/migrations/0008_phase2_taxonomy_media.sql`, `0009_phase3_catalog.sql`).
  Repos: `SupabaseDiscoverRepository` (`discover_routines/categories/articles`),
  `SupabaseOnboardingContentRepository` (`onboarding_messages/rewards/predictions`) —
  ambos sobre `content-crud.ts` (`publishableEntity`: CRUD + publicar/despublicar,
  `create` publica por defecto, `remove`=soft delete, orden newest-first) — y
  `SupabaseExerciseLibraryRepository` (`library_exercises` + media normalizada en
  `exercise_media`→`media_assets`, ensamblado/reconciliación de slots image/gif/video).
  Cableados en `index.ts` con factoría lazy (`pickRepository<Interface>`). **Verificado
  en vivo (23/23 OK):** CRUD completo de los 3 repos, media (crear/editar/borrar slots),
  RLS (alumno sin escritura y solo publicado; anon lee publicado, no ve no-publicado ni
  `library_exercises` ni inserta), lectura pública de `published`, array `muscle_groups`,
  soft delete, orden newest-first, `published` default true. Lint + build limpios.
  **Cierre (Regla #12):** `discoverRepository` 15/15 ✅ · `onboardingContentRepository`
  15/15 ✅ · `exerciseLibraryRepository` 5/5 ✅. Para activar en dev:
  `NEXT_PUBLIC_SUPABASE_REPOS=auth,settings,discover,onboardingContent,exerciseLibrary`.

- **Bloque 1 — Auth + Organización/Settings (HECHO):** `src/services/supabase-auth.service.ts`
  (Supabase Auth: login/register/logout/sesión/`onAuthChange`; arma `AuthUser` desde
  `profiles`+`memberships`, rol owner/admin/coach→`admin`, client→`client`; `register`
  solo `signUp`, la fila `clients` se difiere al Bloque 4); `src/context/auth-context.tsx`
  gateado por `backendFor("auth")` (solo su interior; `local`=mock byte-idéntico,
  `supabase`=SDK; `useAuth()` sin cambios); `src/repositories/supabase/org-context.ts`
  (`getCurrentOrgId()`: `profiles.default_organization_id`→primera membership `active`,
  cacheado); `src/repositories/supabase/settings.repository.ts` (`SupabaseSettingsRepository`
  get/save→`organizations`), cableado en `index.ts` con factoría lazy. `.env.local` (no
  commiteado) con URL+anon key. Seed `supabase/seed/0100_block1_demo_org.seed.sql` ejecutado
  (1 org + owner/coach + membership client). **Verificado en vivo (16/16 OK):** login
  coach/alumno, `profiles` auto-creados por trigger, `organizations`/`memberships`,
  resolver de org, settings save+get persistido, RLS (alumno no edita org; anónimo ve 0
  filas). Lint + build limpios. Para probar en la app: descomentar
  `NEXT_PUBLIC_SUPABASE_REPOS=auth,settings` en `.env.local`. Repos: `auth` (interior de
  auth-context) + `settings` (`SettingsRepository`, 2/2 métodos → ✅). Sin merge/push.
- **Bloque 0 — Fundaciones (HECHO):** instalado `@supabase/supabase-js` (^2.110);
  `src/lib/supabase.ts` (cliente lazy: no rompe sin credenciales); `src/repositories/
  backend.ts` (flag `NEXT_PUBLIC_DATA_BACKEND` + override `NEXT_PUBLIC_SUPABASE_REPOS`
  + `pickRepository`); `src/repositories/supabase/{mappers,query}.ts` + `README.md`;
  `src/repositories/index.ts` cablea los 13 repos migrables con `pickRepository(...)`
  (sin factoría Supabase aún → SIEMPRE `Local`, comportamiento idéntico). Verificado:
  lint + build limpios, login/admin/CRM/biblioteca funcionan con `localStorage`, sin
  errores de consola, Supabase no se instancia. Sin migrar ningún repo, sin tocar
  UI/services/auth.

## Principios (no negociables)

- **UI → services → repositories** se mantiene. La migración **solo** reescribe la capa
  de repositorios (`Local*` → `Supabase*`) + el interior de `auth-context`. **No se toca
  UI ni services.**
- **Interfaces = contrato:** cada `Supabase*Repository` implementa las MISMAS firmas de
  `src/repositories/types.ts`.
- **Feature flag** `NEXT_PUBLIC_DATA_BACKEND=local|supabase` (con override por-repo en
  desarrollo). **Default `local`** hasta el cutover.
- **Nunca se elimina un `Local*`** durante la migración → rollback instantáneo.
- **Cada repo de contenido necesita PRIMERO su fase de BD** (ver `DATABASE_MASTER_PLAN.md`).
- **Sin datos que migrar:** producción arranca limpia en Supabase (+ seed demo para
  paridad). `pending-evaluation` NO migra (pre-auth, queda en localStorage). Los `Mock*`
  de marketing NO migran.
- **Cero regresiones:** cada bloque cierra con lint + build + paridad de sus flujos.

## Repos que NO migran

- `contentRepository`, `testimonialRepository`, `transformationRepository`,
  `programRepository` (ProgramRow legacy) → `Mock*`, marketing estático.
- `pendingEvaluationRepository` → se queda en `localStorage` (handoff pre-auth).

## Plomería nueva (solo capa de repos)

- `src/lib/supabase.ts` (cliente de navegador: anon key + sesión).
- Resolver de **org actual** (cachea `profiles.default_organization_id`) para fijar
  `organization_id` en los INSERT. Las lecturas las scopea RLS.
- Mapeadores fila↔tipo (snake_case↔camelCase) y **ensamblado anidado** (programas/nutrición).
- Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  (+ `SUPABASE_SERVICE_ROLE_KEY` solo local, para seeds/import).

---

## 1. Orden exacto de migración

| Bloque | Nombre | Repos migrados | Fase BD requerida |
|---|---|---|---|
| **0** | Fundaciones | (ninguno; instala cliente, flag, resolver, mapeadores) | — |
| **1** | Auth + Organización | `auth-context`/`auth.service`/`userRepository`, `settingsRepository` | 0/1/1.5 (ya) |
| **2** | Catálogo del coach | `exerciseLibraryRepository`, `discoverRepository`, `onboardingContentRepository` | 2, 3 |
| **3** | Leads + Evaluaciones | `leadRepository` (RPC anónima) | 4 |
| **4** | Alumnos + Progreso + Asignaciones | `clientRepository`, `progressRepository` (+ cierre `register→clients`) | 5 |
| **5** | Entrenamiento | `trainingProgramRepository` | 6 |
| **6** | Nutrición | `nutritionPlanRepository` | 7 |
| **7** | Actividad del alumno | `coachingRepository` (+ `workout_results`) | 8, 9 (chat) |
| **8** | CRM | `crmRepository` | 10 |
| **9** | Notificaciones | `notificationsRepository` | 11 |
| **10** | Cutover + verificación total | (flip global a `supabase`) | — |
| **11** | Limpieza (post-estable) | (retiro de flag / Local como modo offline) | — |

> Los bloques 0–9 se **desarrollan y prueban en aislamiento** (flag por-repo en dev)
> mientras la app corre en `local`. El **cutover** (Bloque 10) es el único flip global.

## 2. Dependencias entre bloques

```
0 Fundaciones
└─▶ 1 Auth+Org ──▶ 2 Catálogo ──▶ 3 Leads ──▶ 4 Alumnos ──┬─▶ 5 Entrenamiento ─┐
                                                          ├─▶ 6 Nutrición ──────┤
                                                          └─▶ 7 Actividad ──────┤
                                                                                ├─▶ 8 CRM ─▶ 9 Notif ─▶ 10 Cutover ─▶ 11 Limpieza
                                                          (7 depende de 5 y 6)  ┘
```

- **Bloque 0** precede a todo (cliente + flag + resolver).
- **Bloque 1** precede a todo lo demás: sin auth/org no hay `organization_id` ni sesión
  para RLS.
- **Bloque 4 (clients)** es prerequisito de 5, 6, 7, 8 (todos referencian `client_id`) y
  cierra el `register→clients` iniciado en el Bloque 1.
- **Bloque 7 (actividad)** depende de 5 y 6 (referencia días/comidas asignados).
- **Bloque 8 (CRM)** depende de 3 (leads) y 4 (clients).
- **Bloque 9 (notificaciones)** depende de casi todo (deriva de leads/clients/accesos/
  entrenos); se hace al final.
- **Bloque 10 (cutover)** requiere 1–9 completos.
- Regla dura: **no iniciar un bloque sin su Fase de BD aplicada y verificada**.

## 3. Checklist por repositorio

### Checklist ESTÁNDAR (aplica a cada repo)
- [ ] Fase(s) de BD del repo creadas y verificadas (ver `DATABASE_MASTER_PLAN.md`).
- [ ] Mapeadores fila↔tipo de dominio (snake_case↔camelCase; ensamblado anidado si aplica).
- [ ] `Supabase<Nombre>Repository` implementa **todas** las firmas de la interfaz.
- [ ] `organization_id` fijado en INSERT vía el resolver de org.
- [ ] Errores de Supabase traducidos al contrato (never throw fuera de contrato; `null`/`[]` donde la interfaz lo espera).
- [ ] Wiring por flag en `src/repositories/index.ts` (default `local`).
- [ ] Prueba de integración aislada contra Supabase dev (todas las firmas).
- [ ] Prueba de paridad del/los flujo(s) de UI afectados (mismos que ya validados).
- [ ] `npm run lint` + `npm run build` limpios; consola sin errores.
- [ ] `Local*` intacto (rollback por flag disponible).

### Detalle por repositorio

**auth (`auth.service` + `auth-context` + `userRepository`)** · Fase BD 1
- Destino: Supabase Auth + `profiles` + `memberships`.
- Métodos: `login` (`signInWithPassword`), `register` (`signUp` + membership; el `clients`
  se crea en Bloque 4 vía RPC), `logout`, rehidratación de sesión (SDK), `getUsers`/
  `findByEmail` (admin) → `profiles`+`memberships`.
- Notas: preservar API de `useAuth()`. Recrear usuarios demo en Auth + seed de org.

**settingsRepository** · Fase BD 1 · Destino `organizations`
- Métodos: `get()`, `save(patch)`. `get` = org del usuario actual; `save` = update de su org.

**exerciseLibraryRepository** · Fase BD 2/3 · Destino `library_exercises` (+`exercise_media`)
- Métodos: `getExercises`, `getExercise`, `createExercise`, `updateExercise`, `deleteExercise`.
- Notas: multimedia vía `exercise_media`/`media_assets`; `published` para lectura anon.

**discoverRepository** · Fase BD 3 · Destino `discover_routines/categories/articles`
- Métodos (×3 entidades): `get*`, `create*`, `update*`, `delete*`, `set*Published`.
- Notas: lectura **anon** de `published` (landing/descubre).

**onboardingContentRepository** · Fase BD 3 · Destino `onboarding_messages/rewards/predictions`
- Métodos (×3 entidades): `get*`, `create*`, `update*`, `delete*`, `set*Published`.
- Notas: lectura **anon** de `published` (wizard).

**leadRepository** · Fase BD 4 · Destino `leads` (+`evaluations`)
- Métodos: `getLeads`, `createLead`, `createEvaluationLead` (**RPC anónima**), `updateStatus`,
  `updateLead`, `deleteLead`.

**clientRepository** · Fase BD 5 · Destino `clients` (+`evaluations`)
- Métodos: `getClients`, `findByUserId`, `createClient`, `updateClient`, `deleteClient`.
- Notas: cierra `register→clients` (RPC) + `my_client_id`.

**progressRepository** · Fase BD 5 · Destino `client_progress`
- Métodos: `getForClient`, `saveForClient`, `removeForClient`.

**trainingProgramRepository** · Fase BD 6 · Destino `training_programs/days/exercises`,
`student_assignments`, `workout_day_progress`, `exercise_series_progress`, `workout_results`
- Métodos (~20): CRUD programa; `addDay/deleteDay/duplicateDay`; `addExercise/deleteExercise/
  duplicateExercise/moveExercise`; `assignToClient/getAssignment` (via `student_assignments`);
  `getWorkoutProgress/setDayCompleted`; `getExerciseProgress/toggleSeries`;
  `getWorkoutResults/addWorkoutResult`.
- Notas: **ensamblado anidado** (retornar `TrainingProgram` con `days[].exercises[]`).

**nutritionPlanRepository** · Fase BD 7 · Destino `nutrition_plans/days/meals`,
`student_assignments`, `nutrition_meal_progress`
- Métodos (~14): CRUD plan; `addDay/deleteDay`; `addMeal/deleteMeal`; `assignToClient/
  getAssignment`; `getMealProgress/setMealCompleted`.
- Notas: ensamblado anidado.

**coachingRepository** · Fase BD 8 + 9 (chat) · Destino `progress_photos`, `client_checklists`,
`conversations/conversation_members/messages`
- Métodos: `getPhotos/addPhoto` (Storage `progress-photos`), `getChecks/setCheck`,
  `getChat/addChatMessage`, `removeClient`.
- Notas: fotos a Storage; chat a la arquitectura de conversaciones.

**crmRepository** · Fase BD 10 · Destino `crm_records` + `crm_history`
- Métodos: `getRecords`, `getRecord`, `upsert`, `setStage` (agrega a historial).

**notificationsRepository** · Fase BD 11 · Destino `notifications` / `notification_reads`
- Métodos: `getReadIds`, `markRead`, `markAllRead`.
- Notas: la derivación de notificaciones sigue en el servicio; aquí solo el estado leído.

## 4. Estrategia de rollback

- **Por flag (instantáneo):** volver `NEXT_PUBLIC_DATA_BACKEND=local` (global) o el override
  por-repo → la app vuelve a `Local*` sin redeploy de código (solo variable de entorno).
- **`Local*` nunca se borra** hasta el Bloque 11 (y solo con aprobación explícita).
- **Cutover reversible:** el Bloque 10 se hace primero en **staging**; si la matriz de
  paridad falla, se revierte el flag y se corrige antes de tocar producción.
- **Datos:** al arrancar limpio en Supabase, un rollback no pierde datos de negocio reales
  (aún no los hay); en producción con datos reales, todo cambio destructivo requiere backup
  + confirmación (regla del DB plan).
- **Git:** cada bloque es un commit atómico en rama `feature/*`; revertir = `git revert`
  del bloque + flag a `local`.

## 5. Estrategia de pruebas

**Niveles:**
1. **Integración por repo (dev):** con el override del repo en `supabase`, ejercitar
   **todas** sus firmas contra el proyecto Supabase de dev (crear/leer/editar/borrar/
   casos límite) y verificar RLS (staff vs alumno vs anón vs cross-org).
2. **Paridad de flujo (UI):** repetir el flujo de UI ya validado del dominio (ver §5 del
   plan en chat / historial): p. ej. Bloque 5 = crear programa→días→ejercicios→duplicar/
   mover→asignar→alumno lo ve en dashboard y `/entrenar`.
3. **Aislamiento multi-tenant:** una segunda org no ve datos de la primera.
4. **Superficie anónima:** wizard/landing sin sesión (lectura de `published` + RPC de lead).
5. **Responsive + consola:** 320–1440 sin overflow, consola limpia.
6. **Cutover (Bloque 10):** matriz completa (todos los flujos coach + alumno) en staging.

**Herramientas:** cliente Supabase de dev; el preview de la app para paridad de UI;
`npm run lint` + `npm run build` en cada cierre. **Sin `DROP/DELETE` de datos** en pruebas.

## 6. Criterios para considerar un bloque TERMINADO (Definition of Done)

Un bloque está terminado **solo si**:
1. Todas las Fases de BD del bloque están aplicadas y verificadas en Supabase.
2. El/los `Supabase*Repository` implementan **todas** las firmas de su interfaz, sin
   cambiar ninguna firma.
3. **No se modificó UI ni services** (salvo el interior de `auth-context` en el Bloque 1).
4. Pruebas de integración por repo **verdes** (todas las firmas + RLS).
5. Pruebas de **paridad de UI** verdes (mismos flujos que en `local`, sin regresión).
6. `npm run lint` + `npm run build` limpios; **consola del navegador sin errores**;
   responsive 320–1440 sin overflow.
7. `Local*` intacto; **rollback por flag verificado** (flip a `local` y la app funciona).
8. `organization_id` correcto en todos los INSERT; aislamiento multi-tenant probado.
9. Commit atómico del bloque en la rama; **sin merge ni push** salvo indicación explícita.
10. `CLAUDE.md` / este documento actualizados con cualquier decisión técnica nueva.

---

_Referencias: `DATABASE_MASTER_PLAN.md` (modelo + fases de BD), `CLAUDE.md` (reglas
permanentes), `src/repositories/types.ts` (contrato de interfaces)._
