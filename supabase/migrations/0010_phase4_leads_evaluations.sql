-- =============================================================================
-- FASE 4 · Leads + Evaluaciones (captura anónima vía RPC)
--   leads · evaluations · create_lead_public()
-- Fuente de verdad: DATABASE_MASTER_PLAN.md   (requiere Fases 0/1 aplicadas)
-- -----------------------------------------------------------------------------
-- ANOTACIÓN DEL SCRIPT
--   1) Naturaleza : ESTRUCTURA + 1 FUNCIÓN (tablas, índices, triggers, RLS, RPC).
--                   No inserta datos.
--   2) Riesgo     : MEDIO (la RPC es SECURITY DEFINER y ejecutable por anon; inserta
--                   leads sin sesión, como el formulario público actual).
--   3) Persistencia: CONSERVAR (esquema permanente).
-- -----------------------------------------------------------------------------
-- DECISIONES REGISTRADAS:
--   (a) `createLead` (formulario /agendar) y `createEvaluationLead` (onboarding) son
--       ANÓNIMOS -> ambos pasan por `create_lead_public` (SECURITY DEFINER), sin
--       política de INSERT abierta sobre `leads`. El resto (getLeads/updateStatus/
--       updateLead/deleteLead) es del STAFF, bajo RLS por org.
--   (b) La evaluación del lead se guarda como `data jsonb` en `evaluations` (campos
--       flexibles, no se filtran/ordenan). `client_id` queda nullable SIN FK (la FK a
--       `clients` se añade en la Fase 5).
--   (c) `deleteLead` es HARD DELETE (paridad: el Local elimina de la colección); la FK
--       `evaluations.lead_id ON DELETE CASCADE` limpia su evaluación.
--   (d) La RPC resuelve la org destino: `p_org` explícito o, si es null, la ÚNICA/primera
--       organización activa (landing single-tenant). El ruteo por-org de la landing
--       (dominio/slug) queda como futuro.
-- Idempotente. Sin DROP/DELETE de datos.
-- =============================================================================

-- 1) leads --------------------------------------------------------------------
create table if not exists public.leads (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name            text not null default '',
  email           text not null default '',
  phone           text not null default '',
  objective       text not null default '',
  message         text not null default '',
  source          text not null default 'Landing',
  status          text not null default 'Nuevo'
                    check (status in ('Nuevo', 'Contactado', 'Convertido', 'Descartado')),
  created_by      uuid,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists leads_org_idx on public.leads (organization_id);

-- 2) evaluations (1:1 con lead por ahora; client_id se enlaza en Fase 5) ------
create table if not exists public.evaluations (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  lead_id         uuid references public.leads (id) on delete cascade,
  client_id       uuid,
  data            jsonb not null default '{}'::jsonb,
  created_by      uuid,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists evaluations_org_idx  on public.evaluations (organization_id);
create index if not exists evaluations_lead_idx on public.evaluations (lead_id);

-- 3) Triggers updated_at + auditoría -----------------------------------------
drop trigger if exists set_updated_at on public.leads;
create trigger set_updated_at before update on public.leads
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.evaluations;
create trigger set_updated_at before update on public.evaluations
  for each row execute function public.set_updated_at();

drop trigger if exists audit on public.leads;
create trigger audit after insert or update or delete on public.leads
  for each row execute function public.audit_trigger();

drop trigger if exists audit on public.evaluations;
create trigger audit after insert or update or delete on public.evaluations
  for each row execute function public.audit_trigger();

-- 4) RLS · leads (STAFF: SELECT/UPDATE/DELETE; INSERT solo por RPC) -----------
alter table public.leads enable row level security;
alter table public.leads force  row level security;

drop policy if exists leads_select on public.leads;
create policy leads_select on public.leads
  for select to authenticated using (public.is_org_staff(organization_id));

drop policy if exists leads_update on public.leads;
create policy leads_update on public.leads
  for update to authenticated
  using (public.is_org_staff(organization_id))
  with check (public.is_org_staff(organization_id));

drop policy if exists leads_delete on public.leads;
create policy leads_delete on public.leads
  for delete to authenticated using (public.is_org_staff(organization_id));
-- Sin política INSERT: los leads entran SOLO por create_lead_public (SECURITY DEFINER).

-- 5) RLS · evaluations (STAFF CRUD; la RPC inserta por SECURITY DEFINER) ------
alter table public.evaluations enable row level security;
alter table public.evaluations force  row level security;

drop policy if exists evaluations_select on public.evaluations;
create policy evaluations_select on public.evaluations
  for select to authenticated using (public.is_org_staff(organization_id));

drop policy if exists evaluations_insert on public.evaluations;
create policy evaluations_insert on public.evaluations
  for insert to authenticated with check (public.is_org_staff(organization_id));

drop policy if exists evaluations_update on public.evaluations;
create policy evaluations_update on public.evaluations
  for update to authenticated
  using (public.is_org_staff(organization_id))
  with check (public.is_org_staff(organization_id));

drop policy if exists evaluations_delete on public.evaluations;
create policy evaluations_delete on public.evaluations
  for delete to authenticated using (public.is_org_staff(organization_id));

-- 6) RPC create_lead_public (captura anónima de lead + evaluación) -----------
create or replace function public.create_lead_public(
  p_name       text,
  p_email      text,
  p_phone      text,
  p_objective  text,
  p_message    text default '',
  p_source     text default 'Landing',
  p_evaluation jsonb default null,
  p_org        uuid default null
) returns public.leads
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org  uuid;
  v_lead public.leads;
begin
  v_org := coalesce(
    p_org,
    (select id from public.organizations
       where deleted_at is null and status = 'active'
       order by created_at asc
       limit 1)
  );
  if v_org is null then
    raise exception 'No hay organización disponible para captar el lead.';
  end if;

  insert into public.leads
    (organization_id, name, email, phone, objective, message, source, status)
  values
    (v_org, btrim(coalesce(p_name, '')), btrim(coalesce(p_email, '')),
     btrim(coalesce(p_phone, '')), coalesce(p_objective, ''),
     btrim(coalesce(p_message, '')), coalesce(nullif(p_source, ''), 'Landing'), 'Nuevo')
  returning * into v_lead;

  if p_evaluation is not null then
    insert into public.evaluations (organization_id, lead_id, data)
    values (v_org, v_lead.id, p_evaluation);
  end if;

  return v_lead;
end;
$$;

revoke execute on function public.create_lead_public(text, text, text, text, text, text, jsonb, uuid) from public;
grant  execute on function public.create_lead_public(text, text, text, text, text, text, jsonb, uuid) to anon, authenticated;

-- FIN FASE 4.
