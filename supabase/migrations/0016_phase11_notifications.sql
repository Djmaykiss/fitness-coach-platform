-- =============================================================================
-- FASE 11 · Notificaciones
--   notifications (modelo completo del master plan; leído = read_at)
-- Fuente de verdad: DATABASE_MASTER_PLAN.md   (requiere Fases 0/1 aplicadas)
-- -----------------------------------------------------------------------------
-- ANOTACIÓN DEL SCRIPT
--   1) Naturaleza : SOLO ESTRUCTURA (tabla, índices, trigger, RLS). No inserta datos.
--   2) Riesgo     : BAJO (tabla nueva; nada existente se altera ni se borra).
--   3) Persistencia: CONSERVAR (esquema permanente).
-- -----------------------------------------------------------------------------
-- DECISIONES REGISTRADAS:
--   (a) Las notificaciones se DERIVAN de datos reales en el servicio (client-side); la
--       app solo persiste el ESTADO LEÍDO. Se usa el MODELO COMPLETO `notifications`
--       (recipient, type, priority, entity, title, body, dedupe_key, read_at) del master
--       plan: `notificationsRepository` (getReadIds/markRead/markAllRead) escribe una
--       fila por (org, recipient, dedupe_key = id de notificación derivada) con
--       `read_at`. Las columnas de contenido quedan LISTAS para notificaciones
--       generadas en el servidor a futuro (aún sin poblar por la derivación actual).
--   (b) `dedupe_key` = id determinista de la notificación derivada; unique
--       (org, recipient, dedupe_key) -> el upsert de "leído" es idempotente.
--   (c) Cada usuario gestiona SUS notificaciones (`recipient_profile_id = auth.uid()`);
--       en la práctica solo el coach usa el centro de notificaciones.
-- Idempotente. Sin DROP/DELETE de datos.
-- =============================================================================

-- 1) notifications ------------------------------------------------------------
create table if not exists public.notifications (
  id                   uuid primary key default gen_random_uuid(),
  organization_id      uuid not null references public.organizations (id) on delete cascade,
  recipient_profile_id uuid not null references public.profiles (id) on delete cascade,
  type                 text not null default '',
  priority             text not null default '',
  entity_type          text not null default '',
  entity_id            uuid,
  title                text not null default '',
  body                 text not null default '',
  dedupe_key           text not null,
  read_at              timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (organization_id, recipient_profile_id, dedupe_key)
);
create index if not exists notifications_recipient_idx on public.notifications (recipient_profile_id);

-- 2) Trigger updated_at -------------------------------------------------------
drop trigger if exists set_updated_at on public.notifications;
create trigger set_updated_at before update on public.notifications
  for each row execute function public.set_updated_at();

-- 3) RLS · cada usuario gestiona SUS notificaciones --------------------------
alter table public.notifications enable row level security;
alter table public.notifications force  row level security;

drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications
  for select to authenticated
  using (recipient_profile_id = auth.uid() and organization_id in (select public.current_org_ids()));

drop policy if exists notifications_insert on public.notifications;
create policy notifications_insert on public.notifications
  for insert to authenticated
  with check (recipient_profile_id = auth.uid() and organization_id in (select public.current_org_ids()));

drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications
  for update to authenticated
  using (recipient_profile_id = auth.uid() and organization_id in (select public.current_org_ids()))
  with check (recipient_profile_id = auth.uid() and organization_id in (select public.current_org_ids()));

drop policy if exists notifications_delete on public.notifications;
create policy notifications_delete on public.notifications
  for delete to authenticated
  using (recipient_profile_id = auth.uid() and organization_id in (select public.current_org_ids()));

-- FIN FASE 11.
