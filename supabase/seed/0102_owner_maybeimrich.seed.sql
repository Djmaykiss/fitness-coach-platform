-- =============================================================================
-- SEED · Coach/DUEÑO real de la app (owner de "Coach Fitness")
--   email: Maybeimrichyes2024@gmail.com
-- -----------------------------------------------------------------------------
-- ANOTACIÓN DEL SCRIPT
--   1) Naturaleza : MODIFICA DATOS (profile + membership owner + coach record). NO
--                   crea clients. NO borra cuentas demo. NO toca schema.
--   2) Riesgo     : BAJO (idempotente; solo asegura owner para ESTE usuario en la org).
--   3) Persistencia: CONSERVAR (es el dueño real).
-- -----------------------------------------------------------------------------
-- PRERREQUISITO: la cuenta debe existir en auth.users (Dashboard -> Authentication ->
-- Add user, o registro). El trigger handle_new_user ya crea su fila en `profiles`.
-- Ejecutar en el SQL Editor (rol postgres: lee auth.users y omite RLS; el guard de
-- memberships se salta con actor null, por eso puede crear un 2º owner).
-- =============================================================================

do $$
declare
  v_uid uuid;
  v_org uuid;
begin
  -- 1) usuario por email
  select id into v_uid
  from auth.users
  where lower(email) = lower('Maybeimrichyes2024@gmail.com')
  limit 1;
  if v_uid is null then
    raise exception 'No existe auth.users con ese email. Crea la cuenta primero (Add user) y reintenta.';
  end if;

  -- 2) organización "Coach Fitness" existente (por nombre; fallback al id conocido)
  select id into v_org
  from public.organizations
  where deleted_at is null and (name = 'Coach Fitness' or business_name = 'Coach Fitness')
  order by created_at asc
  limit 1;
  if v_org is null then
    v_org := '2ad5f8cc-04d2-484c-8b58-4a0cc68ac651';
  end if;
  if not exists (select 1 from public.organizations where id = v_org and deleted_at is null) then
    raise exception 'No se encontró la organización "Coach Fitness".';
  end if;

  -- 3) profile: asegurar (el trigger normalmente ya lo creó) + default org + nombre
  insert into public.profiles (id, first_name, last_name, default_organization_id)
  values (v_uid, 'Coach', 'Owner', v_org)
  on conflict (id) do update
    set default_organization_id = coalesce(public.profiles.default_organization_id, v_org),
        first_name = coalesce(nullif(public.profiles.first_name, ''), 'Coach'),
        last_name  = coalesce(nullif(public.profiles.last_name, ''), 'Owner');

  -- 4) membership OWNER activo (idempotente; si ya existe, forzar owner/active)
  insert into public.memberships (profile_id, organization_id, role, status)
  values (v_uid, v_org, 'owner', 'active')
  on conflict (profile_id, organization_id)
  do update set role = 'owner', status = 'active';

  -- 5) coach record (si la tabla existe)
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'coaches'
  ) then
    insert into public.coaches (organization_id, profile_id, headline, created_by)
    values (v_org, v_uid, 'Coach', v_uid)
    on conflict (organization_id, profile_id) do nothing;
  end if;

  -- NOTA: NO se crea ni se toca ninguna fila en `clients` para el owner.
  -- NOTA: NO se borra ninguna cuenta demo.

  raise notice 'Owner OK. uid=% org=%', v_uid, v_org;
end $$;

-- FIN seed owner.
