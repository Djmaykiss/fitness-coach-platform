-- =============================================================================
-- FASE 10 · CRM (pipeline del coach)
--   crm_records · crm_history
-- Fuente de verdad: DATABASE_MASTER_PLAN.md   (requiere Fases 0/1 aplicadas)
-- -----------------------------------------------------------------------------
-- ANOTACIÓN DEL SCRIPT
--   1) Naturaleza : SOLO ESTRUCTURA (tablas, índices, triggers, RLS). No inserta datos.
--   2) Riesgo     : BAJO (tablas nuevas; nada existente se altera ni se borra).
--   3) Persistencia: CONSERVAR (esquema permanente).
-- -----------------------------------------------------------------------------
-- DECISIONES REGISTRADAS:
--   (a) CRM es SOLO DEL STAFF (el alumno nunca ve el pipeline): RLS staff-CRUD por org;
--       sin acceso de alumno ni anónimo.
--   (b) `crm_records.entity_id` (uuid) referencia POLIMÓRFICAMENTE un lead o un cliente
--       (sin FK, porque puede ser cualquiera de las dos); unique(org, entity_id).
--   (c) `stage` es un override MANUAL (nullable); si no existe, la app lo DERIVA (no se
--       persiste la etapa derivada). `follow_up_date`/`date` como TEXTO (paridad exacta
--       con el `Local*`, que guarda strings).
--   (d) `crm_history` = un movimiento por fila (stage + date), append-only; el repo
--       ensambla `CrmRecord.history` ordenado por `created_at`.
-- Idempotente. Sin DROP/DELETE de datos.
-- =============================================================================

-- 1) crm_records --------------------------------------------------------------
create table if not exists public.crm_records (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  entity_id       uuid not null,
  stage           text check (stage in (
                    'Lead', 'Nuevo alumno', 'Evaluación pendiente', 'Evaluación completada',
                    'Programa asignado', 'Entrenando', 'Suspendido', 'Finalizado', 'Renovado')),
  notes           text not null default '',
  next_action     text not null default '',
  follow_up_date  text not null default '',
  created_by      uuid,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (organization_id, entity_id)
);
create index if not exists crm_records_org_idx on public.crm_records (organization_id);

-- 2) crm_history (append-only) ------------------------------------------------
create table if not exists public.crm_history (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  record_id       uuid not null references public.crm_records (id) on delete cascade,
  stage           text not null,
  date            text not null default '',
  created_at      timestamptz not null default now()
);
create index if not exists crm_history_record_idx on public.crm_history (record_id, created_at asc);

-- 3) Triggers updated_at + auditoría -----------------------------------------
drop trigger if exists set_updated_at on public.crm_records;
create trigger set_updated_at before update on public.crm_records
  for each row execute function public.set_updated_at();

drop trigger if exists audit on public.crm_records;
create trigger audit after insert or update or delete on public.crm_records
  for each row execute function public.audit_trigger();

-- 4) RLS · staff-only (owner/admin/coach) ------------------------------------
do $$
declare t text;
begin
  foreach t in array array['crm_records', 'crm_history'] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('alter table public.%I force  row level security;', t);

    execute format('drop policy if exists %I on public.%I;', t || '_select', t);
    execute format(
      'create policy %I on public.%I for select to authenticated using (public.is_org_staff(organization_id));',
      t || '_select', t);

    execute format('drop policy if exists %I on public.%I;', t || '_insert', t);
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (public.is_org_staff(organization_id));',
      t || '_insert', t);

    execute format('drop policy if exists %I on public.%I;', t || '_update', t);
    execute format(
      'create policy %I on public.%I for update to authenticated using (public.is_org_staff(organization_id)) with check (public.is_org_staff(organization_id));',
      t || '_update', t);

    execute format('drop policy if exists %I on public.%I;', t || '_delete', t);
    execute format(
      'create policy %I on public.%I for delete to authenticated using (public.is_org_staff(organization_id));',
      t || '_delete', t);
  end loop;
end $$;

-- FIN FASE 10.
