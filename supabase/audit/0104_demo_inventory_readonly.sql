-- =============================================================================
-- INVENTARIO DE CONTENIDO DEMO / PRUEBA — SOLO LECTURA (READ ONLY)
-- Fase 1 · E6 de EXERCISE_SYSTEM_PLAN.md / PRODUCTION_READINESS_PLAN.md
-- -----------------------------------------------------------------------------
-- ⚠️  ESTE SCRIPT NO MODIFICA NADA. Son SOLO `SELECT`. No hay INSERT/UPDATE/DELETE.
--     Ejecútalo en el SQL Editor de Supabase para revisar el contenido demo antes
--     de decidir. El soft-delete va en un SEGUNDO script separado y solo tras tu OK.
--
-- Org objetivo: "Coach Fitness" = 2ad5f8cc-04d2-484c-8b58-4a0cc68ac651 (única org).
-- Heurística "demo": nombres tipo CUTOVER/ENTRENAR/Repro/Fix Tester/E2E/Full/Uiplan,
--   emails @example.com, cuentas admin@coach.com / cliente@coach.com, filas huérfanas
--   (sin bucket/path/url), clientes soft-deleted, duplicados.
-- =============================================================================

-- 0) La organización (NO se borra: tiene al dueño real) -----------------------
select 'ORG' as bloque, id, name, created_at, deleted_at
from public.organizations;

-- 1) USUARIOS / MEMBERSHIPS (email real vía auth.users) -----------------------
select 'USERS' as bloque, m.role, p.full_name, u.email, m.status,
  case
    when u.email like '%@example.com' then 'DEMO: email de prueba'
    when u.email in ('admin@coach.com','cliente@coach.com') then 'DEMO: cuenta demo'
    else 'revisar'
  end as motivo
from public.memberships m
join public.profiles p on p.id = m.profile_id
left join auth.users u on u.id = m.profile_id
where m.organization_id = '2ad5f8cc-04d2-484c-8b58-4a0cc68ac651'
order by m.role, u.email;

-- 2) CLIENTES (alumnos) -------------------------------------------------------
select 'CLIENTS' as bloque, c.id, c.name, u.email, c.access_status,
  c.deleted_at,
  case
    when u.email like '%@example.com' then 'DEMO: email de prueba'
    when c.name in ('Cliente Demo','Onboarding Test','Repro User','Fix Tester',
                    'Uiplan Tester','E2E Plan','Full Plan') then 'DEMO: nombre de prueba'
    when c.deleted_at is not null then 'ya soft-deleted (revisar)'
    else 'revisar (posible real)'
  end as motivo
from public.clients c
left join auth.users u on u.id = c.user_id
where c.organization_id = '2ad5f8cc-04d2-484c-8b58-4a0cc68ac651'
order by c.deleted_at nulls first, c.name;

-- 3) BIBLIOTECA DE EJERCICIOS -------------------------------------------------
select 'LIBRARY_EXERCISES' as bloque, id, name, muscle_group, deleted_at,
  case when name ilike '%CUTOVER%' or name ilike '%ENTRENAR%'
       then 'DEMO: nombre de verificación' else 'revisar' end as motivo
from public.library_exercises
where organization_id = '2ad5f8cc-04d2-484c-8b58-4a0cc68ac651'
order by name;

-- 4) PROGRAMAS DE ENTRENAMIENTO (+ días + ejercicios) -------------------------
select 'TRAINING_PROGRAMS' as bloque, p.id, p.name, p.deleted_at,
  count(distinct d.id) as dias, count(te.id) as ejercicios,
  case when p.name ilike '%cutover%' then 'DEMO: nombre de verificación' else 'revisar' end as motivo
from public.training_programs p
left join public.training_days d on d.program_id = p.id
left join public.training_exercises te on te.day_id = d.id
where p.organization_id = '2ad5f8cc-04d2-484c-8b58-4a0cc68ac651'
group by p.id, p.name, p.deleted_at;

-- 5) PLANES COMERCIALES (+ contratados) ---------------------------------------
select 'PLANS' as bloque, id, name, active, deleted_at, 'seed comercial (¿mantener?)' as motivo
from public.plans
where organization_id = '2ad5f8cc-04d2-484c-8b58-4a0cc68ac651'
order by position;

select 'CLIENT_PLANS' as bloque, cp.id, cp.plan_name, cp.status, c.name as cliente, c.deleted_at as cliente_borrado
from public.client_plans cp
left join public.clients c on c.id = cp.client_id
where cp.organization_id = '2ad5f8cc-04d2-484c-8b58-4a0cc68ac651';

-- 6) NUTRICIÓN (+ días + comidas) ---------------------------------------------
select 'NUTRITION_PLANS' as bloque, np.id, np.name, np.deleted_at,
  count(distinct nd.id) as dias, count(nm.id) as comidas
from public.nutrition_plans np
left join public.nutrition_days nd on nd.plan_id = np.id
left join public.nutrition_meals nm on nm.day_id = nd.id
where np.organization_id = '2ad5f8cc-04d2-484c-8b58-4a0cc68ac651'
group by np.id, np.name, np.deleted_at;

-- 7) DESCUBRE (rutinas / categorías / artículos) ------------------------------
select 'DISCOVER_ROUTINES' as bloque, count(*) as filas from public.discover_routines
  where organization_id = '2ad5f8cc-04d2-484c-8b58-4a0cc68ac651';
select 'DISCOVER_CATEGORIES' as bloque, count(*) as filas from public.discover_categories
  where organization_id = '2ad5f8cc-04d2-484c-8b58-4a0cc68ac651';
select 'DISCOVER_ARTICLES' as bloque, count(*) as filas from public.discover_articles
  where organization_id = '2ad5f8cc-04d2-484c-8b58-4a0cc68ac651';

-- 8) BIBLIOTECA MULTIMEDIA (media_assets) — buscar HUÉRFANOS ------------------
select 'MEDIA_ASSETS' as bloque, id, title, context, bucket, path, url, deleted_at,
  case when coalesce(bucket,'')='' and coalesce(path,'')='' and coalesce(url,'')=''
       then 'DEMO/HUÉRFANO: sin bucket/path/url' else 'revisar' end as motivo
from public.media_assets
where organization_id = '2ad5f8cc-04d2-484c-8b58-4a0cc68ac651'
order by created_at;

-- 9) FOTOS (progreso / transformación) ----------------------------------------
select 'PROGRESS_PHOTOS' as bloque, id, client_id, date, front, side, back, url,
  case when coalesce(url,'')='' and coalesce(front,'')='' then 'DEMO/HUÉRFANO: sin imagen' else 'revisar' end as motivo
from public.progress_photos
where organization_id = '2ad5f8cc-04d2-484c-8b58-4a0cc68ac651';
select 'TRANSFORMATION_PHOTOS' as bloque, count(*) as filas from public.transformation_photos
  where organization_id = '2ad5f8cc-04d2-484c-8b58-4a0cc68ac651';

-- 10) ASIGNACIONES (+ detectar DUPLICADOS activos) ----------------------------
select 'STUDENT_ASSIGNMENTS' as bloque, a.id, a.resource_type, a.status,
  c.name as cliente, c.deleted_at as cliente_borrado, a.resource_id
from public.student_assignments a
left join public.clients c on c.id = a.client_id
where a.organization_id = '2ad5f8cc-04d2-484c-8b58-4a0cc68ac651'
order by a.client_id, a.resource_type;

-- duplicados: mismo cliente + mismo resource_type con >1 activa
select 'ASSIGNMENTS_DUPLICADAS' as bloque, client_id, resource_type, count(*) as activas
from public.student_assignments
where organization_id = '2ad5f8cc-04d2-484c-8b58-4a0cc68ac651' and status = 'active'
group by client_id, resource_type
having count(*) > 1;

-- 11) LEADS / EVALUACIONES / CRM ----------------------------------------------
select 'LEADS' as bloque, id, name, email, source, status
from public.leads where organization_id = '2ad5f8cc-04d2-484c-8b58-4a0cc68ac651';

select 'EVALUATIONS' as bloque, e.id, e.client_id, e.lead_id,
  c.name as cliente, c.deleted_at as cliente_borrado
from public.evaluations e
left join public.clients c on c.id = e.client_id
where e.organization_id = '2ad5f8cc-04d2-484c-8b58-4a0cc68ac651';

select 'CRM_RECORDS' as bloque, cr.id, cr.entity_id, cr.stage,
  c.name as cliente, c.deleted_at as cliente_borrado
from public.crm_records cr
left join public.clients c on c.id = cr.entity_id
where cr.organization_id = '2ad5f8cc-04d2-484c-8b58-4a0cc68ac651';

-- 12) ONBOARDING (mensajes / recompensas / predicciones) ----------------------
select 'ONBOARDING_MESSAGES' as bloque, count(*) as filas from public.onboarding_messages
  where organization_id = '2ad5f8cc-04d2-484c-8b58-4a0cc68ac651';
select 'ONBOARDING_REWARDS' as bloque, count(*) as filas from public.onboarding_rewards
  where organization_id = '2ad5f8cc-04d2-484c-8b58-4a0cc68ac651';
select 'ONBOARDING_PREDICTIONS' as bloque, count(*) as filas from public.onboarding_predictions
  where organization_id = '2ad5f8cc-04d2-484c-8b58-4a0cc68ac651';

-- 13) STORAGE (objetos bajo la carpeta de la org) -----------------------------
select 'STORAGE_OBJECTS' as bloque, bucket_id, name, created_at
from storage.objects
where (storage.foldername(name))[1] = '2ad5f8cc-04d2-484c-8b58-4a0cc68ac651'
order by bucket_id, name;

-- FIN (solo lectura).
