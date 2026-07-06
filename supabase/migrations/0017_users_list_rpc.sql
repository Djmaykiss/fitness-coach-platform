-- =============================================================================
-- BLOQUE 12.5 · RPC de apoyo para `userRepository` (listado de usuarios de la org)
--   list_org_users()
-- Fuente de verdad: APP_MIGRATION_PLAN.md   (requiere Fases 0/1/5 aplicadas)
-- -----------------------------------------------------------------------------
-- ANOTACIÓN DEL SCRIPT
--   1) Naturaleza : 1 FUNCIÓN (SECURITY DEFINER). No crea tablas ni inserta datos.
--   2) Riesgo     : MEDIO (lee `auth.users.email`; por eso es SECURITY DEFINER y
--                   staff-only, scopeada a la org del que llama).
--   3) Persistencia: CONSERVAR.
-- -----------------------------------------------------------------------------
-- MOTIVO: el email del alumno vive en `auth.users` (no en `profiles`) y NO es legible
-- por anon/authenticated vía REST. `userRepository.getUsers()` (tabla Alumnos del admin
-- + CRM) necesita resolver `userId -> email`. Esta RPC devuelve los miembros de la(s)
-- org(s) del que llama, SOLO si es STAFF de esa org, uniendo memberships + profiles +
-- auth.users. No filtra passwords ni expone otras orgs (aislamiento intacto).
-- Idempotente (CREATE OR REPLACE). Sin DROP/DELETE de datos.
-- =============================================================================

create or replace function public.list_org_users()
returns table (id uuid, email text, first_name text, last_name text, role text)
language sql
stable
security definer
set search_path = public
as $$
  select distinct on (p.id)
    p.id,
    u.email::text,
    p.first_name,
    p.last_name,
    m.role
  from public.memberships m
  join public.profiles p on p.id = m.profile_id
  join auth.users u on u.id = p.id
  where m.organization_id in (select public.current_org_ids())
    and public.is_org_staff(m.organization_id)
  order by p.id;
$$;

revoke execute on function public.list_org_users() from public;
grant  execute on function public.list_org_users() to authenticated;

-- FIN Bloque 12.5.
