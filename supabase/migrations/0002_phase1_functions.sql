-- =============================================================================
-- FASE 1 · Funciones (helpers RLS, alta de usuario, creación de organización)
-- Fuente de verdad: DATABASE_MASTER_PLAN.md   (requiere 0000 y 0001 aplicados)
-- -----------------------------------------------------------------------------
-- ANOTACIÓN DEL SCRIPT
--   1) Naturaleza : SOLO ESTRUCTURA (funciones + 1 trigger sobre auth.users).
--                   NO inserta datos de negocio (create_organization solo se
--                   ejecuta cuando el owner la invoca desde la app).
--   2) Riesgo     : BAJO-MEDIO (crea trigger en auth.users; patrón estándar de
--                   Supabase). Reversible con DROP FUNCTION/TRIGGER.
--   3) Persistencia: CONSERVAR.
-- -----------------------------------------------------------------------------
-- Nota de diseño: los helpers dependen de public.memberships, por eso viven en
-- Fase 1 (no en Fase 0). my_client_id() se creará en la Fase 5 (necesita clients).
-- =============================================================================

-- 1) Helpers RLS (SECURITY DEFINER STABLE) -----------------------------------
-- Orgs activas del usuario autenticado.
create or replace function public.current_org_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select m.organization_id
  from public.memberships m
  where m.profile_id = auth.uid()
    and m.status = 'active';
$$;

-- ¿El usuario tiene alguno de esos roles en la org dada?
create or replace function public.has_org_role(p_org uuid, p_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships m
    where m.profile_id = auth.uid()
      and m.organization_id = p_org
      and m.status = 'active'
      and m.role = any (p_roles)
  );
$$;

-- Staff = owner | admin | coach.
create or replace function public.is_org_staff(p_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_org_role(p_org, array['owner', 'admin', 'coach']);
$$;

-- 2) Alta de usuario: crea el profile al registrarse en Supabase Auth --------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3) RPC create_organization: crea la org y el membership owner atómicamente --
-- El owner autenticado la invoca para dar de alta su negocio.
create or replace function public.create_organization(
  p_name text,
  p_business_name text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org uuid;
begin
  if auth.uid() is null then
    raise exception 'auth requerido';
  end if;

  insert into public.organizations (name, business_name, created_by)
  values (p_name, coalesce(p_business_name, p_name), auth.uid())
  returning id into v_org;

  insert into public.memberships (profile_id, organization_id, role, status)
  values (auth.uid(), v_org, 'owner', 'active');

  update public.profiles
  set default_organization_id = v_org
  where id = auth.uid()
    and default_organization_id is null;

  return v_org;
end;
$$;

-- Solo usuarios autenticados pueden crear su organización.
-- (revoke desde PUBLIC porque las funciones se otorgan a PUBLIC por defecto).
revoke execute on function public.create_organization(text, text) from public;
grant  execute on function public.create_organization(text, text) to authenticated;

-- FIN FASE 1 · funciones.
