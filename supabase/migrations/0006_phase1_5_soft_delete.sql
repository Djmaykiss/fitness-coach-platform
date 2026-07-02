-- =============================================================================
-- FASE 1.5 · Hardening (5) mejorar soft delete (ocultar filas con deleted_at)
-- Fuente de verdad: DATABASE_MASTER_PLAN.md   (requiere Fase 0 y Fase 1 aplicadas)
-- -----------------------------------------------------------------------------
-- ANOTACIÓN DEL SCRIPT
--   1) Naturaleza : SOLO ESTRUCTURA (reemplaza 1 función helper + 2 políticas SELECT).
--                   No inserta ni modifica datos.
--   2) Riesgo     : BAJO-MEDIO (afecta visibilidad de filas soft-deleted).
--   3) Persistencia: CONSERVAR.
-- -----------------------------------------------------------------------------
-- Nota: has_org_role/is_org_staff se dejan SOLO por membership (sin excluir
-- deleted_at) para que la propia operación de soft delete (UPDATE deleted_at) y un
-- eventual restore sigan permitidos vía la política de UPDATE. La visibilidad
-- (SELECT) se filtra en current_org_ids() y en las políticas de SELECT.
-- No modifica el modelo de datos ni crea tablas.
-- =============================================================================

-- 1) current_org_ids: excluir organizaciones soft-deleted ---------------------
create or replace function public.current_org_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select m.organization_id
  from public.memberships m
  join public.organizations o on o.id = m.organization_id
  where m.profile_id = auth.uid()
    and m.status = 'active'
    and o.deleted_at is null;
$$;

-- 2) organizations SELECT: ocultar soft-deleted ------------------------------
drop policy if exists org_select on public.organizations;
create policy org_select on public.organizations
  for select to authenticated
  using (id in (select public.current_org_ids()) and deleted_at is null);

-- 3) coaches SELECT: ocultar soft-deleted ------------------------------------
drop policy if exists coaches_select on public.coaches;
create policy coaches_select on public.coaches
  for select to authenticated
  using (organization_id in (select public.current_org_ids()) and deleted_at is null);

-- FIN FASE 1.5 · soft delete.
