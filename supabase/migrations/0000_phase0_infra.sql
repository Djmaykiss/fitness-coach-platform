-- =============================================================================
-- FASE 0 · Infraestructura base (extensiones, updated_at, auditoría genérica)
-- Fuente de verdad: DATABASE_MASTER_PLAN.md
-- -----------------------------------------------------------------------------
-- ANOTACIÓN DEL SCRIPT
--   1) Naturaleza : SOLO ESTRUCTURA (no inserta datos de negocio).
--   2) Riesgo     : BAJO (solo crea extensión, funciones, 1 tabla de auditoría).
--   3) Persistencia: CONSERVAR (infraestructura permanente).
-- -----------------------------------------------------------------------------
-- Idempotente: re-ejecutable sin error (IF NOT EXISTS / CREATE OR REPLACE).
-- No contiene ningún DROP/DELETE de datos.
-- =============================================================================

-- 1) Extensiones -------------------------------------------------------------
create extension if not exists pgcrypto;   -- gen_random_uuid()

-- 2) Trigger genérico updated_at ---------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- 3) Tabla de auditoría ------------------------------------------------------
create table if not exists public.audit_logs (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid,
  actor_profile_id uuid,
  table_name       text not null,
  record_id        uuid,
  action           text not null check (action in ('insert', 'update', 'delete')),
  before           jsonb,
  after            jsonb,
  ip               inet,
  user_agent       text,
  created_at       timestamptz not null default now()
);

create index if not exists audit_logs_org_idx     on public.audit_logs (organization_id);
create index if not exists audit_logs_table_idx   on public.audit_logs (table_name, record_id);
create index if not exists audit_logs_created_idx on public.audit_logs (created_at desc);

-- RLS bloqueada por defecto (la política de LECTURA se agrega en Fase 1, cuando
-- existen los helpers). El trigger escribe como SECURITY DEFINER, así que no
-- necesita política de INSERT.
alter table public.audit_logs enable row level security;
alter table public.audit_logs force  row level security;

-- 4) Función de auditoría genérica -------------------------------------------
-- Registra INSERT/UPDATE/DELETE de la tabla a la que se asocie. Lee
-- organization_id / id de la fila (si existen) y el actor (auth.uid()).
-- IP y user-agent se intentan leer de las cabeceras de la request (best-effort);
-- si no están disponibles quedan en NULL sin romper la operación.
create or replace function public.audit_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor   uuid := auth.uid();
  v_before  jsonb;
  v_after   jsonb;
  v_org     uuid;
  v_record  uuid;
  v_ip      inet;
  v_ua      text;
  v_headers json;
begin
  if (tg_op = 'DELETE') then
    v_before := to_jsonb(old);
    v_after  := null;
  elsif (tg_op = 'UPDATE') then
    v_before := to_jsonb(old);
    v_after  := to_jsonb(new);
  else
    v_before := null;
    v_after  := to_jsonb(new);
  end if;

  v_record := nullif(coalesce(v_after, v_before) ->> 'id', '')::uuid;
  -- organization_id de la fila; si la tabla auditada ES organizations, se usa su id.
  v_org := coalesce(
    nullif(coalesce(v_after, v_before) ->> 'organization_id', '')::uuid,
    case when tg_table_name = 'organizations' then v_record end
  );

  -- IP / user-agent best-effort (nunca deben romper la escritura).
  begin
    v_headers := nullif(current_setting('request.headers', true), '')::json;
    v_ua := v_headers ->> 'user-agent';
    v_ip := nullif(split_part(coalesce(v_headers ->> 'x-forwarded-for', ''), ',', 1), '')::inet;
  exception when others then
    v_ip := null;
    v_ua := null;
  end;

  insert into public.audit_logs (
    organization_id, actor_profile_id, table_name, record_id, action, before, after, ip, user_agent
  ) values (
    v_org, v_actor, tg_table_name, v_record, lower(tg_op), v_before, v_after, v_ip, v_ua
  );

  if (tg_op = 'DELETE') then
    return old;
  else
    return new;
  end if;
end;
$$;

-- FIN FASE 0.
