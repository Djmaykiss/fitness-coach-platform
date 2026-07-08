-- =============================================================================
-- SEED (demo) · 3 planes comerciales para la org "Coach Fitness"
-- Requiere 0018_plans.sql aplicada. Idempotente: no duplica si ya hay planes.
-- Naturaleza: MODIFICA DATOS (demo). BORRAR/editar desde el panel cuando quieras.
-- Ejecutar en el SQL Editor.
-- =============================================================================

do $$
declare
  v_org uuid := '2ad5f8cc-04d2-484c-8b58-4a0cc68ac651';
  v_id  uuid;
begin
  if exists (select 1 from public.plans where organization_id = v_org and deleted_at is null) then
    raise notice 'Ya existen planes en la org; no se siembra.';
    return;
  end if;

  -- ENCIENDE
  insert into public.plans (organization_id, name, price_label, modality, ideal_for, button_label, color, recommended, active, position)
  values (v_org, 'ENCIENDE', '$67–97/mes · o Reto 4 semanas por $97', '100% Online',
    'Personas que quieren comenzar a bajar de peso, crear hábitos saludables y desarrollar constancia.',
    'Comenzar Ahora', '#65ff4f', false, true, 0)
  returning id into v_id;
  insert into public.plan_features (organization_id, plan_id, text, position) values
    (v_org, v_id, 'Programa estructurado de 4 semanas (Entrenamiento + Nutrición)', 0),
    (v_org, v_id, 'Check-in grupal semanal', 1),
    (v_org, v_id, 'Guía de mentalidad', 2),
    (v_org, v_id, 'Comunidad privada', 3),
    (v_org, v_id, 'Accountability semanal', 4),
    (v_org, v_id, 'Sin llamadas individuales', 5);

  -- FORJA
  insert into public.plans (organization_id, name, price_label, modality, ideal_for, button_label, color, recommended, active, position)
  values (v_org, 'FORJA', '$180–250/mes', '100% Online',
    'Personas que buscan aumentar fuerza, velocidad o masa muscular mediante programación personalizada.',
    'Quiero este plan', '#1e3a8a', false, true, 1)
  returning id into v_id;
  insert into public.plan_features (organization_id, plan_id, text, position) values
    (v_org, v_id, 'Programa 100% personalizado', 0),
    (v_org, v_id, 'Actualizaciones cada 2-4 semanas', 1),
    (v_org, v_id, 'Check-in 1:1 quincenal', 2),
    (v_org, v_id, 'Mensajería directa', 3),
    (v_org, v_id, 'Corrección técnica mediante video', 4),
    (v_org, v_id, 'Coaching mental mensual', 5),
    (v_org, v_id, 'Ajuste nutricional', 6);

  -- LEYENDA (recomendado)
  insert into public.plans (organization_id, name, price_label, modality, ideal_for, button_label, color, recommended, active, position)
  values (v_org, 'LEYENDA', '$450–650/mes', 'Online + Eventos Presenciales',
    'Atletas y personas que desean el máximo nivel de acompañamiento personalizado.',
    'Ser Leyenda', '#65ff4f', true, true, 2)
  returning id into v_id;
  insert into public.plan_features (organization_id, plan_id, text, position) values
    (v_org, v_id, 'Programación totalmente personalizada', 0),
    (v_org, v_id, 'Llamada semanal 1:1', 1),
    (v_org, v_id, 'Mensajería ilimitada', 2),
    (v_org, v_id, 'Coaching mental cada 2 semanas', 3),
    (v_org, v_id, 'Nutrición personalizada semanal', 4),
    (v_org, v_id, 'Revisión completa de videos', 5),
    (v_org, v_id, 'Acceso prioritario al coach', 6),
    (v_org, v_id, '50% de descuento en eventos', 7);

  raise notice 'Seed de 3 planes OK en org %.', v_org;
end $$;
