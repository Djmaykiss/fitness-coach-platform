-- =============================================================================
-- BACKFILL puntual · alumno "Michael Perez" (tuviaje.52@gmail.com)
-- Su registro no persistio membership+clients (bug de register, ya corregido).
-- -----------------------------------------------------------------------------
-- ANOTACIÓN DEL SCRIPT
--   1) Naturaleza : MODIFICA DATOS (1 membership + 1 clients, si faltan). NO es schema.
--   2) Riesgo     : BAJO (idempotente; solo crea lo que falta para este usuario).
--   3) Persistencia: BORRAR despues (backfill puntual, no forma parte del esquema).
-- -----------------------------------------------------------------------------
-- Ejecutar en el SQL Editor (rol postgres: lee auth.users y omite RLS).
-- =============================================================================

do $$
declare
  v_uid    uuid;
  v_org    uuid := '2ad5f8cc-04d2-484c-8b58-4a0cc68ac651';  -- org del coach
  v_client uuid;
begin
  select id into v_uid
  from auth.users
  where lower(email) = lower('tuviaje.52@gmail.com')
  limit 1;

  if v_uid is null then
    raise exception 'No existe auth.users con email tuviaje.52@gmail.com (¿se registró?).';
  end if;

  if not exists (select 1 from public.organizations where id = v_org and deleted_at is null) then
    raise exception 'La org % no existe o está borrada.', v_org;
  end if;

  -- 1) membership client (idempotente; el guard solo restringe el rol owner)
  insert into public.memberships (profile_id, organization_id, role, status)
  values (v_uid, v_org, 'client', 'active')
  on conflict (profile_id, organization_id) do nothing;

  -- 2) profile: default org + nombre si faltan
  update public.profiles
  set default_organization_id = coalesce(default_organization_id, v_org),
      first_name = coalesce(nullif(first_name, ''), 'Michael'),
      last_name  = coalesce(nullif(last_name, ''), 'Perez')
  where id = v_uid;

  -- 3) fila clients (si no hay una activa para este usuario en la org)
  select id into v_client
  from public.clients
  where user_id = v_uid and organization_id = v_org and deleted_at is null
  limit 1;

  if v_client is null then
    insert into public.clients (organization_id, user_id, name, status, access_status)
    values (v_org, v_uid, 'Michael Perez', 'Nuevo', 'Vencido');
  end if;

  raise notice 'Backfill Michael OK. uid=% (membership+clients asegurados en org %).', v_uid, v_org;
end $$;

-- FIN backfill.
