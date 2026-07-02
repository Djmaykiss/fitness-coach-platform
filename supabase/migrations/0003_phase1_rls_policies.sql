-- =============================================================================
-- FASE 1 · Políticas RLS (organizations, profiles, memberships, coaches, audit_logs)
-- Fuente de verdad: DATABASE_MASTER_PLAN.md   (requiere 0000..0002 aplicados)
-- -----------------------------------------------------------------------------
-- ANOTACIÓN DEL SCRIPT
--   1) Naturaleza : SOLO ESTRUCTURA/SEGURIDAD (habilita RLS y crea políticas).
--                   No inserta ni modifica datos.
--   2) Riesgo     : MEDIO (define quién puede leer/escribir; revisar antes de prod).
--   3) Persistencia: CONSERVAR.
-- -----------------------------------------------------------------------------
-- Deny-by-default: sin política, ningún rol anon/authenticated accede. service_role
-- (Supabase) y funciones SECURITY DEFINER (postgres) omiten RLS por BYPASSRLS.
-- Idempotente: DROP POLICY IF EXISTS antes de cada CREATE POLICY.
-- =============================================================================

-- ORGANIZATIONS ---------------------------------------------------------------
alter table public.organizations enable row level security;
alter table public.organizations force  row level security;

drop policy if exists org_select on public.organizations;
create policy org_select on public.organizations
  for select to authenticated
  using (id in (select public.current_org_ids()));

drop policy if exists org_update on public.organizations;
create policy org_update on public.organizations
  for update to authenticated
  using (public.has_org_role(id, array['owner', 'admin']))
  with check (public.has_org_role(id, array['owner', 'admin']));
-- INSERT: solo vía RPC create_organization (SECURITY DEFINER). DELETE: bloqueado
-- (se usa soft delete via deleted_at por owner/admin con la política de UPDATE).

-- PROFILES --------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.profiles force  row level security;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or exists (
      select 1
      from public.memberships m
      where m.profile_id = profiles.id
        and public.is_org_staff(m.organization_id)
    )
  );

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());
-- INSERT: vía trigger handle_new_user (SECURITY DEFINER). Sin DELETE (cascade auth).

-- MEMBERSHIPS -----------------------------------------------------------------
alter table public.memberships enable row level security;
alter table public.memberships force  row level security;

drop policy if exists memberships_select on public.memberships;
create policy memberships_select on public.memberships
  for select to authenticated
  using (profile_id = auth.uid() or public.is_org_staff(organization_id));

drop policy if exists memberships_insert on public.memberships;
create policy memberships_insert on public.memberships
  for insert to authenticated
  with check (public.has_org_role(organization_id, array['owner', 'admin']));

drop policy if exists memberships_update on public.memberships;
create policy memberships_update on public.memberships
  for update to authenticated
  using (public.has_org_role(organization_id, array['owner', 'admin']))
  with check (public.has_org_role(organization_id, array['owner', 'admin']));

drop policy if exists memberships_delete on public.memberships;
create policy memberships_delete on public.memberships
  for delete to authenticated
  using (public.has_org_role(organization_id, array['owner', 'admin']));

-- COACHES ---------------------------------------------------------------------
alter table public.coaches enable row level security;
alter table public.coaches force  row level security;

drop policy if exists coaches_select on public.coaches;
create policy coaches_select on public.coaches
  for select to authenticated
  using (organization_id in (select public.current_org_ids()));

drop policy if exists coaches_insert on public.coaches;
create policy coaches_insert on public.coaches
  for insert to authenticated
  with check (public.has_org_role(organization_id, array['owner', 'admin']));

drop policy if exists coaches_update on public.coaches;
create policy coaches_update on public.coaches
  for update to authenticated
  using (public.has_org_role(organization_id, array['owner', 'admin']) or profile_id = auth.uid())
  with check (public.has_org_role(organization_id, array['owner', 'admin']) or profile_id = auth.uid());
-- DELETE: bloqueado (soft delete via deleted_at).

-- AUDIT_LOGS (solo lectura de owner/admin; escritura por trigger/service-role) -
drop policy if exists audit_select on public.audit_logs;
create policy audit_select on public.audit_logs
  for select to authenticated
  using (
    organization_id is not null
    and public.has_org_role(organization_id, array['owner', 'admin'])
  );
-- Sin políticas INSERT/UPDATE/DELETE: nadie escribe directo (solo el trigger
-- SECURITY DEFINER y service_role).

-- FIN FASE 1 · RLS.
