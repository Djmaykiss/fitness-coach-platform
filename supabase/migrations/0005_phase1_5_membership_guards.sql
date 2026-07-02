-- =============================================================================
-- FASE 1.5 · Hardening (1) admin no puede volverse owner  (2) no dejar org sin owner
-- Fuente de verdad: DATABASE_MASTER_PLAN.md   (requiere Fase 0 y Fase 1 aplicadas)
-- -----------------------------------------------------------------------------
-- ANOTACIÓN DEL SCRIPT
--   1) Naturaleza : SOLO ESTRUCTURA (1 función + 1 trigger BEFORE en memberships).
--                   No inserta ni modifica datos.
--   2) Riesgo     : MEDIO (cambia reglas de negocio de roles; validar que
--                   create_organization y la gestión de miembros sigan funcionando).
--   3) Persistencia: CONSERVAR.
-- -----------------------------------------------------------------------------
-- No modifica el modelo de datos ni crea tablas. Reversible con DROP TRIGGER/FUNCTION.
-- Idempotente (CREATE OR REPLACE / DROP TRIGGER IF EXISTS).
-- =============================================================================

create or replace function public.enforce_membership_rules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor          uuid := auth.uid();
  v_actor_is_owner boolean;
  v_other_owners   int;
begin
  -- Contextos sin usuario JWT (service_role / SQL editor): no se aplican las
  -- reglas de negocio (esos roles gestionan datos directamente).
  if v_actor is null then
    if tg_op = 'DELETE' then return old; else return new; end if;
  end if;

  v_actor_is_owner := public.has_org_role(
    coalesce(new.organization_id, old.organization_id), array['owner']
  );

  if tg_op = 'INSERT' then
    if new.role = 'owner' then
      select count(*) into v_other_owners
      from public.memberships
      where organization_id = new.organization_id
        and role = 'owner' and status = 'active';
      -- Permitir el PRIMER owner (bootstrap de create_organization) o si el actor
      -- ya es owner. Un admin NO puede crear un owner.
      if v_other_owners > 0 and not v_actor_is_owner then
        raise exception 'Solo un owner puede otorgar el rol owner';
      end if;
    end if;
    return new;

  elsif tg_op = 'UPDATE' then
    -- Tocar una membership de owner requiere ser owner.
    if old.role = 'owner' and not v_actor_is_owner then
      raise exception 'Solo un owner puede modificar una membership de owner';
    end if;
    -- Promover a owner requiere ser owner (bloquea la escalada admin -> owner).
    if new.role = 'owner' and old.role <> 'owner' and not v_actor_is_owner then
      raise exception 'Solo un owner puede promover a owner';
    end if;
    -- No dejar la organización sin owner activo.
    if (old.role = 'owner' and old.status = 'active')
       and (new.role <> 'owner' or new.status <> 'active') then
      select count(*) into v_other_owners
      from public.memberships
      where organization_id = old.organization_id
        and role = 'owner' and status = 'active'
        and id <> old.id;
      if v_other_owners = 0 then
        raise exception 'No se puede dejar la organización sin owner';
      end if;
    end if;
    return new;

  else -- DELETE
    if old.role = 'owner' then
      if not v_actor_is_owner then
        raise exception 'Solo un owner puede eliminar una membership de owner';
      end if;
      if old.status = 'active' then
        select count(*) into v_other_owners
        from public.memberships
        where organization_id = old.organization_id
          and role = 'owner' and status = 'active'
          and id <> old.id;
        if v_other_owners = 0 then
          raise exception 'No se puede eliminar al último owner';
        end if;
      end if;
    end if;
    return old;
  end if;
end;
$$;

drop trigger if exists enforce_membership_rules on public.memberships;
create trigger enforce_membership_rules
  before insert or update or delete on public.memberships
  for each row execute function public.enforce_membership_rules();

-- FIN FASE 1.5 · membership guards.
