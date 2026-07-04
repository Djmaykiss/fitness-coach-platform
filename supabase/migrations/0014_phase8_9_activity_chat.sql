-- =============================================================================
-- FASE 8/9 · Actividad del alumno + Chat (modelo completo)
--   progress_photos · client_checklists
--   conversations · conversation_members · messages
-- Fuente de verdad: DATABASE_MASTER_PLAN.md   (requiere Fases 0/1/5 aplicadas)
-- -----------------------------------------------------------------------------
-- ANOTACIÓN DEL SCRIPT
--   1) Naturaleza : SOLO ESTRUCTURA (tablas, índices, triggers, RLS). No inserta datos.
--   2) Riesgo     : BAJO (tablas nuevas; nada existente se altera ni se borra).
--   3) Persistencia: CONSERVAR (esquema permanente).
-- -----------------------------------------------------------------------------
-- DECISIONES REGISTRADAS:
--   (a) FOTOS de progreso: `front`/`side`/`back` como TEXTO (la app embebe la imagen
--       como string dataURL/URL; NO usa el bucket todavía). El bucket privado
--       `progress-photos` (Fase 1) queda para subidas reales FUTURAS. "Storage" NO
--       aplica en este bloque (paridad exacta con el `Local*`).
--   (b) CHECKLISTS: una fila por (client_id, list_key, item_key) con `done` boolean
--       (unique); el repo ensambla el mapa anidado `ChecklistChecks`.
--   (c) CHAT = modelo COMPLETO del master plan (Fase 9): `conversations` +
--       `conversation_members` + `messages` (preparado para coach↔alumno, grupos,
--       staff, adjuntos `attachments jsonb`, lectura por miembro `last_read_at`,
--       futuras notificaciones). El coachingRepository conserva su interfaz
--       (`getChat`/`addChatMessage`/`removeClient`): internamente resuelve/crea la
--       conversación 1:1 `kind='direct'` por `client_id` (unique parcial). El acceso
--       del alumno se deriva de `conversations.client_id = my_client_id(org)`;
--       `conversation_members`/`last_read_at`/`attachments` quedan disponibles para el
--       futuro (aún sin poblar en el flujo 1:1).
--   (d) `removeClient` elimina fotos/checklists/conversaciones del cliente (+ cascade).
--   RLS: staff + alumno dueño (`my_client_id`).
-- Idempotente. Sin DROP/DELETE de datos.
-- =============================================================================

-- 1) progress_photos ----------------------------------------------------------
create table if not exists public.progress_photos (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id       uuid not null references public.clients (id) on delete cascade,
  date            text not null default '',
  front           text not null default '',
  side            text not null default '',
  back            text not null default '',
  note            text not null default '',
  created_at      timestamptz not null default now()
);
create index if not exists progress_photos_client_idx on public.progress_photos (client_id, created_at desc);

-- 2) client_checklists (1 fila por item) -------------------------------------
create table if not exists public.client_checklists (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id       uuid not null references public.clients (id) on delete cascade,
  list_key        text not null,
  item_key        text not null,
  done            boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (client_id, list_key, item_key)
);
create index if not exists client_checklists_client_idx on public.client_checklists (client_id);

-- 3) conversations ------------------------------------------------------------
create table if not exists public.conversations (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  kind            text not null default 'direct' check (kind in ('direct', 'group', 'staff')),
  client_id       uuid references public.clients (id) on delete cascade,
  title           text not null default '',
  created_by      uuid,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);
create index if not exists conversations_org_idx on public.conversations (organization_id);
-- Una única conversación 'direct' viva por cliente (hilo 1:1 coach↔alumno).
create unique index if not exists conversations_direct_client_uidx
  on public.conversations (client_id)
  where kind = 'direct' and deleted_at is null;

-- 4) conversation_members (membresía + lectura por miembro; futuro) ----------
create table if not exists public.conversation_members (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  profile_id      uuid not null references public.profiles (id) on delete cascade,
  role            text not null default 'member',
  last_read_at    timestamptz,
  created_at      timestamptz not null default now(),
  unique (conversation_id, profile_id)
);
create index if not exists conversation_members_conv_idx    on public.conversation_members (conversation_id);
create index if not exists conversation_members_profile_idx on public.conversation_members (profile_id);

-- 5) messages -----------------------------------------------------------------
create table if not exists public.messages (
  id                uuid primary key default gen_random_uuid(),
  organization_id   uuid not null references public.organizations (id) on delete cascade,
  conversation_id   uuid not null references public.conversations (id) on delete cascade,
  sender_profile_id uuid references public.profiles (id) on delete set null,
  sender_role       text not null default 'alumno' check (sender_role in ('coach', 'alumno', 'staff', 'system')),
  body              text not null default '',
  time              text not null default '',
  attachments       jsonb not null default '[]'::jsonb,
  created_at        timestamptz not null default now()
);
create index if not exists messages_conv_idx on public.messages (conversation_id, created_at asc);

-- 6) Triggers updated_at ------------------------------------------------------
drop trigger if exists set_updated_at on public.client_checklists;
create trigger set_updated_at before update on public.client_checklists
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.conversations;
create trigger set_updated_at before update on public.conversations
  for each row execute function public.set_updated_at();

-- 7) RLS · progress_photos + client_checklists (staff + alumno dueño) --------
do $$
declare t text;
begin
  foreach t in array array['progress_photos', 'client_checklists'] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('alter table public.%I force  row level security;', t);

    execute format('drop policy if exists %I on public.%I;', t || '_select', t);
    execute format(
      'create policy %I on public.%I for select to authenticated using (public.is_org_staff(organization_id) or client_id = public.my_client_id(organization_id));',
      t || '_select', t);

    execute format('drop policy if exists %I on public.%I;', t || '_insert', t);
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (public.is_org_staff(organization_id) or client_id = public.my_client_id(organization_id));',
      t || '_insert', t);

    execute format('drop policy if exists %I on public.%I;', t || '_update', t);
    execute format(
      'create policy %I on public.%I for update to authenticated using (public.is_org_staff(organization_id) or client_id = public.my_client_id(organization_id)) with check (public.is_org_staff(organization_id) or client_id = public.my_client_id(organization_id));',
      t || '_update', t);

    execute format('drop policy if exists %I on public.%I;', t || '_delete', t);
    execute format(
      'create policy %I on public.%I for delete to authenticated using (public.is_org_staff(organization_id) or client_id = public.my_client_id(organization_id));',
      t || '_delete', t);
  end loop;
end $$;

-- 8) RLS · conversations (staff + alumno dueño del cliente) ------------------
alter table public.conversations enable row level security;
alter table public.conversations force  row level security;

drop policy if exists conversations_select on public.conversations;
create policy conversations_select on public.conversations
  for select to authenticated
  using (public.is_org_staff(organization_id) or client_id = public.my_client_id(organization_id));

drop policy if exists conversations_insert on public.conversations;
create policy conversations_insert on public.conversations
  for insert to authenticated
  with check (public.is_org_staff(organization_id) or client_id = public.my_client_id(organization_id));

drop policy if exists conversations_update on public.conversations;
create policy conversations_update on public.conversations
  for update to authenticated
  using (public.is_org_staff(organization_id) or client_id = public.my_client_id(organization_id))
  with check (public.is_org_staff(organization_id) or client_id = public.my_client_id(organization_id));

drop policy if exists conversations_delete on public.conversations;
create policy conversations_delete on public.conversations
  for delete to authenticated
  using (public.is_org_staff(organization_id) or client_id = public.my_client_id(organization_id));

-- 9) RLS · conversation_members (staff + el propio miembro) ------------------
alter table public.conversation_members enable row level security;
alter table public.conversation_members force  row level security;

drop policy if exists conversation_members_select on public.conversation_members;
create policy conversation_members_select on public.conversation_members
  for select to authenticated
  using (public.is_org_staff(organization_id) or profile_id = auth.uid());

drop policy if exists conversation_members_insert on public.conversation_members;
create policy conversation_members_insert on public.conversation_members
  for insert to authenticated
  with check (public.is_org_staff(organization_id) or profile_id = auth.uid());

drop policy if exists conversation_members_update on public.conversation_members;
create policy conversation_members_update on public.conversation_members
  for update to authenticated
  using (public.is_org_staff(organization_id) or profile_id = auth.uid())
  with check (public.is_org_staff(organization_id) or profile_id = auth.uid());

drop policy if exists conversation_members_delete on public.conversation_members;
create policy conversation_members_delete on public.conversation_members
  for delete to authenticated using (public.is_org_staff(organization_id));

-- 10) RLS · messages (staff org; alumno dueño vía la conversación) -----------
alter table public.messages enable row level security;
alter table public.messages force  row level security;

drop policy if exists messages_select on public.messages;
create policy messages_select on public.messages
  for select to authenticated
  using (
    public.is_org_staff(organization_id)
    or exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and c.client_id = public.my_client_id(c.organization_id)
    )
  );

drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages
  for insert to authenticated
  with check (
    public.is_org_staff(organization_id)
    or exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and c.client_id = public.my_client_id(c.organization_id)
    )
  );

drop policy if exists messages_update on public.messages;
create policy messages_update on public.messages
  for update to authenticated
  using (public.is_org_staff(organization_id))
  with check (public.is_org_staff(organization_id));

drop policy if exists messages_delete on public.messages;
create policy messages_delete on public.messages
  for delete to authenticated
  using (
    public.is_org_staff(organization_id)
    or exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and c.client_id = public.my_client_id(c.organization_id)
    )
  );

-- FIN FASE 8/9.
