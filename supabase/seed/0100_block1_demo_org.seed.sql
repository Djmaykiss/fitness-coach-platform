-- =============================================================================
-- BLOQUE 1 (APP_MIGRATION_PLAN.md) · Seed de organización + membresías demo
-- Fuente de verdad: APP_MIGRATION_PLAN.md / DATABASE_MASTER_PLAN.md
-- Requiere Fase 0/1/1.5 aplicadas.
-- -----------------------------------------------------------------------------
-- ANOTACIÓN DEL SCRIPT
--   1) Naturaleza : MODIFICA DATOS (crea 1 org + membresías + 1 coach). Es el seed
--                   del negocio demo para pruebas de paridad; NO es esquema.
--   2) Riesgo     : MEDIO (inserta datos; referencia uids reales de auth.users).
--   3) Persistencia: CONSERVAR (seed del negocio demo). Idempotente: re-ejecutable.
-- -----------------------------------------------------------------------------
-- PRERREQUISITO: crear ANTES los 2 usuarios demo en Supabase (Dashboard -> Auth ->
-- Add user), de modo que el trigger handle_new_user cree sus filas en `profiles`:
--     admin@coach.com   / 123456   (será OWNER + COACH)
--     cliente@coach.com / 123456    (será CLIENT)
-- Luego copiar sus UIDs (Dashboard -> Auth -> Users) y reemplazarlos abajo.
-- =============================================================================

do $$
declare
  -- >>> REEMPLAZAR por los UID reales de auth.users <<<
  v_admin  uuid := '75db1223-1234-412d-9900-05e3fdd92dd1';  -- uid de admin@coach.com (coach)
  v_client uuid := 'c06c9215-f3f8-4c5b-b615-759f3a296f6d';  -- uid de cliente@coach.com (alumno)
  v_org uuid;
begin
  -- Guard de idempotencia: si el admin ya es owner de una org, no repetir.
  if exists (select 1 from public.memberships where profile_id = v_admin and role = 'owner') then
    raise notice 'Seed ya aplicado (admin ya es owner). Nada que hacer.';
    return;
  end if;

  -- Verificar que existan los profiles (creados por el trigger al dar de alta los users).
  if not exists (select 1 from public.profiles where id = v_admin)
     or not exists (select 1 from public.profiles where id = v_client) then
    raise exception 'Falta crear los usuarios demo en Auth (profiles inexistentes). Crea admin@coach.com y cliente@coach.com primero.';
  end if;

  -- 1) Organización (marca / white-label demo; defaults de coachConfig).
  insert into public.organizations
    (name, business_name, tagline, description, phone, whatsapp, monthly_price, currency, created_by)
  values
    ('Coach Fitness', 'Coach Fitness', 'Fitness Coaching',
     'Entrenamiento personalizado, seguimiento semanal y un plan claro.',
     '+1 (786) 870-4262', '17868704262', 50, 'USD', v_admin)
  returning id into v_org;

  -- 2) Owner (admin) + su perfil profesional de coach.
  insert into public.memberships (profile_id, organization_id, role, status)
  values (v_admin, v_org, 'owner', 'active');

  insert into public.coaches (organization_id, profile_id, headline, created_by)
  values (v_org, v_admin, 'Coach', v_admin);

  update public.profiles
  set default_organization_id = v_org,
      first_name = coalesce(nullif(first_name, ''), 'Coach')
  where id = v_admin;

  -- 3) Alumno demo (solo la membership client; la fila `clients` se crea en el Bloque 4).
  insert into public.memberships (profile_id, organization_id, role, status)
  values (v_client, v_org, 'client', 'active');

  update public.profiles
  set default_organization_id = v_org
  where id = v_client;

  raise notice 'Seed OK. organization_id = %', v_org;
end $$;

-- FIN seed Bloque 1.
