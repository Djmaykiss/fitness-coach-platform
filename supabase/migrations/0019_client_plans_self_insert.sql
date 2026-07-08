-- =============================================================================
-- PLANES · RLS: el ALUMNO puede crear/actualizar SU propio client_plans
-- Fuente: DATABASE_MASTER_PLAN.md   (requiere 0018_plans.sql aplicada)
-- -----------------------------------------------------------------------------
-- ANOTACIÓN DEL SCRIPT
--   1) Naturaleza : SOLO SEGURIDAD (reemplaza 2 politicas RLS de client_plans). No
--                   modifica tablas ni migraciones anteriores.
--   2) Riesgo     : BAJO (amplia el INSERT/UPDATE al dueño; el staff ya podia).
--   3) Persistencia: CONSERVAR.
-- -----------------------------------------------------------------------------
-- MOTIVO: al registrarse eligiendo un plan en la landing, el alumno recién creado
-- (autenticado, aún NO staff) inserta su fila en `client_plans`. Antes solo el staff
-- podia insertar/actualizar -> se amplia a `client_id = my_client_id(org)` (el dueño).
-- Idempotente (DROP POLICY IF EXISTS + CREATE). Sin DROP/DELETE de datos.
-- =============================================================================

drop policy if exists client_plans_insert on public.client_plans;
create policy client_plans_insert on public.client_plans
  for insert to authenticated
  with check (
    public.is_org_staff(organization_id)
    or client_id = public.my_client_id(organization_id)
  );

drop policy if exists client_plans_update on public.client_plans;
create policy client_plans_update on public.client_plans
  for update to authenticated
  using (public.is_org_staff(organization_id) or client_id = public.my_client_id(organization_id))
  with check (public.is_org_staff(organization_id) or client_id = public.my_client_id(organization_id));

drop policy if exists client_plans_delete on public.client_plans;
create policy client_plans_delete on public.client_plans
  for delete to authenticated
  using (public.is_org_staff(organization_id) or client_id = public.my_client_id(organization_id));

-- FIN.
