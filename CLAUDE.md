# Coach Fitness MVP

# Version 1.5 (Estable - main)
Version estable actual en `main` (tag `v1.5`). Convierte la plataforma en un SaaS
profesional para entrenadores, TODO ADITIVO sobre v1.4 (nada eliminado). Incluye:
experiencia premium del alumno (modo entrenamiento en `/entrenar`, historial, "Mi
perfil", "Descubre", "Obtener mi plan" y onboarding de 12 pasos con pantalla de
prediccion); el COACH administra TODO el contenido desde `/admin` (CMS de "Descubre"
y de Onboarding, biblioteca de ejercicios con video de YouTube embebido, programas
con duplicar dia / mover-duplicar-eliminar ejercicio, planes de nutricion); dashboard
del coach con metricas reales derivadas; configuracion del negocio administrable
(white-label: marca, contacto, redes, legales, colores, precio) que se refleja en
vivo; CRM tipo pipeline de 9 etapas; centro de notificaciones derivadas; y
exportaciones imprimibles (perfil, programa, nutricion) via `window.print`. Ademas:
sistema global de toasts, validaciones de formularios y responsive verificado
320-1440. Sin backend ni Supabase; arquitectura UI -> services -> repositories ->
localStorage intacta y lista para migrar cambiando solo los repositorios. Ver
`CHANGELOG.md` (incrementos 1-10) y las "Decisiones tecnicas" de esta seccion.

# Version 1.4 (Congelada)
Version estable actual en `main`. Incluye todo lo de v1.3 mas el panel del coach
profesional y el contacto centralizado: configuracion global del coach en
`src/config/coachConfig.ts` (nombre "Cristian Valdez", telefono, WhatsApp, precio
mensual); panel ejecutivo en `/admin` con 10 metricas; buscador de alumnos y
filtros; acciones rapidas por alumno (Perfil, Editar, Entrenamiento, Nutricion,
WhatsApp, Renovar, Pausar, Eliminar); leads con buscar/editar/eliminar/convertir/
WhatsApp; todos los botones de contactar/renovar/ayuda abren `wa.me/17868704262`
(coach), EXCEPTO el WhatsApp de un lead que abre el telefono del propio lead.
Header del alumno con logo + nombre real + "Salir". Sin Supabase, sin backend;
arquitectura UI -> services -> repositories -> localStorage intacta; no se toco
landing ni onboarding. Ver `CHANGELOG.md`.

# Version 1.3 (Congelada)
Incluye todo lo de v1.2 mas el dashboard del
alumno TOTALMENTE INTERACTIVO: header minimo (logo + nombre real + "Salir", sin
Cliente/Admin); objetivos, recordatorios y plan alimenticio (demo) marcables;
calendario de entrenamiento marcable por fecha (entrenado/100%); rutina del dia
con estados (iniciar/en progreso/completado); galeria con alta de registros; chat
con el coach persistido; recursos con panel de detalle; comparador antes/despues
que usa las fotos del alumno; y logros e historial DERIVADOS de acciones reales.
Todo en `localStorage`; arquitectura UI -> services -> repositories intacta; no se
toco landing ni onboarding. Ver `CHANGELOG.md`.

# Version 1.2 (Congelada)
Incluye todo lo de v1.1 mas el modulo real de
nutricion: en `/admin` el coach crea, edita y elimina planes nutricionales con
macros objetivo diario (calorias, proteinas, carbohidratos, grasas), agua
recomendada, notas y dias con comidas, y los asigna a un alumno; en `/dashboard`
el alumno ve su plan asignado (macros diarios, agua, comidas del dia y todos los
dias) y marca comidas completadas (progreso persistido en `localStorage`). Sin
backend, sin Supabase, sin pagos; arquitectura UI -> services -> repositories ->
localStorage intacta; no se toco landing ni onboarding. Ver `CHANGELOG.md`.

# Version 1.1 (Congelada)
Incluye todo lo de v1.0 mas la biblioteca
profesional de ejercicios: en `/admin` el coach gestiona un catalogo de ejercicios
con ficha completa (CRUD) y, al armar un programa, ELIGE ejercicios de la
biblioteca en vez de escribirlos; en `/dashboard` el alumno abre cada ejercicio y
ve su ficha completa (imagen/gif, "Ver demostracion" si hay video, tecnica,
errores comunes, consejos, equipo y musculos) con un checklist por series que
marca "Ejercicio completado" y persiste en `localStorage`. Sin backend, sin
Supabase, sin pagos; arquitectura UI -> services -> repositories -> localStorage
intacta; no se toco landing ni onboarding. Ver `CHANGELOG.md`.

# Version 1.0 (Congelada)
Incluye todo lo de v0.9 mas el primer modulo
funcional completo de programas de entrenamiento: en `/admin` el coach crea, edita
y elimina programas con dias y ejercicios (series, repeticiones, descanso, notas,
nivel, duracion, objetivo) y los asigna a un alumno; en `/dashboard` el alumno ve
su programa asignado con la "rutina de hoy", sus dias, ejercicios y notas del coach,
y puede "marcar entrenamiento completado" (progreso persistido en `localStorage`).
Sin backend, sin Supabase, sin pagos; arquitectura UI -> services -> repositories ->
localStorage intacta; no se toco landing ni onboarding. Ver `CHANGELOG.md`.

# Version 0.9 (Congelada)
Incluye todo lo de v0.8 mas dos mejoras (sin
funciones nuevas de negocio): (1) infraestructura de desarrollo robusta — `predev`
ejecuta `scripts/free-port.mjs` que libera el puerto 3000 y mata procesos
`next dev`/`next-server` huerfanos antes de arrancar (un unico servidor Next;
`clean:port` para limpiar a mano); (2) rediseño de la pantalla de acceso bloqueado
del alumno — header solo con logo + "Salir" (`minimalNav`), saludo con el nombre
real ("Hola, {nombre}" o solo "Hola"; nunca "Hola, Cliente"), tarjeta con tres
variantes (Activo verde / Pausado amarillo / Vencido rojo), textos nuevos y botones
"RENOVAR ACCESO" + "CONTACTAR COACH" (aun sin funcion), ocultando todos los modulos
premium cuando el acceso no es `Activo`. No se toco onboarding, landing, admin,
repositorios ni servicios. Ver `CHANGELOG.md`.

# Version 0.8 (Congelada)
Incluye todo lo de v0.7 mas el bloqueo del
dashboard del alumno por mensualidad (si `accessStatus` es `Vencido` o `Pausado`,
`/dashboard` oculta las funciones premium y muestra solo `LockedDashboard`; con
`Activo` se ve el dashboard completo; solo se condiciona el renderizado) y el CRUD
completo de alumnos en `/admin` (crear, editar y ELIMINAR con confirmacion; el
borrado limpia en cascada cliente + progreso + fotos + checklists sin tocar las
cuentas de usuario). Sin Supabase, sin backend, sin cambios de diseño general; no
se toco landing ni onboarding. Ver `CHANGELOG.md`.

# Version 0.7 (Congelada)
Incluye todo lo de v0.6 mas el rediseño visual
y de contenido del onboarding (solo onboarding): ilustraciones vectoriales propias
(SVG, estilo neon) para tipos de cuerpo, objetivos, nivel y lugar en
`public/images/onboarding/` (con fallback `onError` y `dangerouslyAllowSVG` en
`next.config.ts`); copys con voz de coach (titulo + subtitulo por paso); resumen
final rediseñado como diagnostico profesional con tarjeta premium del plan
recomendado; y microanimaciones suaves (hover/seleccion de tarjetas, transicion de
pasos, barra de progreso). Sin funciones nuevas, sin cambios de flujo, servicios,
repositorios, tipos, `localStorage` ni dashboard. Ver `CHANGELOG.md`.

# Version 0.6 (Congelada)
Incluye todo lo de v0.5 mas un pulido visual
premium (SOLO diseño): `globals.css` con `.premium-card` mejorada, utilidades
`.card-hover` y `.reveal-up`, halo de fondo, `:focus-visible` neon, scrollbar a
tono y `prefers-reduced-motion`; botones primarios con gradiente neon + lift;
inputs con foco neon; landing con animacion de entrada y hover premium; nav del
dashboard fija; tablas del admin con hover. Sin funciones nuevas, sin cambios de
arquitectura y sin tocar la logica de `localStorage`. Paleta intacta
(negro/blanco/gris/verde neon). Ver `CHANGELOG.md`.

# Version 0.5 (Congelada)
Incluye todo lo de v0.4 mas el formulario de
salud y alimentacion del cliente integrado en el onboarding inteligente: el wizard
pasa de 8 a 11 pasos (paso 8 datos + antecedentes; pasos 9-10 alimentacion), las
nuevas respuestas se guardan dentro de la misma evaluacion del lead y del alumno,
y `evaluation-details` muestra la evaluacion agrupada en bloques (Datos personales,
Antecedentes, Alimentacion) en el dashboard del alumno y en las fichas del admin.
Sin backend, sin Supabase, sin pagos reales: todo en `localStorage`. Ver
`CHANGELOG.md`.

# Version 0.4 (Congelada)
Incluye todo lo de v0.3 mas el onboarding
inteligente del alumno (wizard de evaluacion de 8 pasos en la landing -> guarda
lead + evaluacion -> redirige a `/register` -> la evaluacion queda en el perfil
del alumno y se ve en `/dashboard` y en la ficha del admin) y el dashboard
premium del alumno (18 secciones tipo Trainerize/TrueCoach: galería de progreso,
gráficas, objetivos, calendario, medidas, cumplimiento, logros, historial,
nutrición, chat demo, recursos, recordatorios, métricas corporales, etc.). Sin
backend, sin Supabase, sin pagos reales: todo en `localStorage`. Ver
`CHANGELOG.md`.

# Version 0.3 (Congelada)
Incluye todo lo de v0.2 mas la gestion de leads: el boton "Agendar llamada" de la
landing lleva a `/agendar` (formulario de lead), y en `/admin` el dueno ve los
leads, cambia su estado (Nuevo/Contactado/Convertido/Descartado) y convierte un
lead en alumno. Sin backend, sin Supabase, sin pagos reales: todo en
`localStorage`. Ver `CHANGELOG.md`.

# Version 0.2 (Congelada)
Incluye todo lo de v0.1 mas el control de acceso mensual manual de alumnos
(estado de acceso Activo/Vencido/Pausado, renovacion por 30 dias con metodo de
pago, pausar y marcar vencido desde `/admin`, y aviso de acceso para el alumno
en `/dashboard`). Sin backend, sin Supabase, sin pagos reales: todo en
`localStorage`. Ver `CHANGELOG.md`.

# Version 0.1 (Congelada)
Primer punto estable del proyecto. Esta version incluye:

- Landing Page
- Login
- Registro
- Dashboard Cliente
- Dashboard Administrador
- Persistencia completa mediante `localStorage`
- CRUD basico de clientes
- CRUD basico de programas
- Asignacion de programas
- Gestion del progreso
- Guards por rol
- Responsive
- Footer con informacion del desarrollador

Base oficial congelada para iniciar la Fase 2. Ver `CHANGELOG.md`.

## FILOSOFIA DEL PRODUCTO — el coach administra TODO el contenido (REGLA PERMANENTE)
Esta es la direccion definitiva del proyecto y aplica a TODA nueva funcionalidad,
version y decision, sin que el usuario tenga que recordarla. El objetivo es una
plataforma SaaS profesional para entrenadores personales: NOSOTROS desarrollamos la
plataforma (arquitectura, CRUD, paneles, permisos, UX, almacenamiento, servicios,
repositorios, estadisticas); el COACH administra ABSOLUTAMENTE todo el contenido
desde `/admin`; el ALUMNO solo CONSUME contenido y no administra nada.

- REGLA DE ORO: antes de crear cualquier pantalla, modulo o funcionalidad, preguntar
  primero "¿Este contenido deberia poder modificarlo el coach?" y "¿Como lo
  administrara el coach?". Si el alumno lo ve, el coach debe poder gestionarlo.
- Si la respuesta es SI, debe existir arquitectura para que el coach pueda: CREAR,
  EDITAR, ELIMINAR, PUBLICAR, DESPUBLICAR (cuando aplique) y ASIGNAR a alumnos. Se
  disena PRIMERO el panel del coach y despues la vista del alumno.
- PROHIBIDO el contenido fijo/hardcodeado dentro de la app. Nada de textos, listas
  ni catalogos definitivos incrustados en componentes.
- Los SEEDS (`src/data/*`) solo sirven para DEMOSTRAR el funcionamiento (contenido
  temporal). Todo seed debe poder reemplazarse/editarse desde el panel del coach.
  Nunca son contenido definitivo.
- ARQUITECTURA obligatoria de toda entidad de contenido: UI -> Service -> Repository
  -> Storage (`localStorage` hoy), preparada para migrar a Supabase implementando
  nuevos repositorios SIN reescribir la UI ni los servicios.
- Contenido que el coach administrara (lista viva, no exhaustiva): ejercicios y
  biblioteca de ejercicios; programas, rutinas, dias, series, repeticiones,
  descansos; videos, gif, imagenes; cursos, modulos, lecciones, recursos
  descargables; articulos, noticias, consejos, mensajes motivacionales, retos;
  planes nutricionales, recetas; categorias, etiquetas, promociones; y CUALQUIER
  contenido que vea el alumno.
- Estado actual vs. regla (deuda a saldar en proximos incrementos, ya que la regla
  aplica de aqui en adelante): YA cumplen (CRUD del coach): biblioteca de ejercicios,
  programas de entrenamiento, planes de nutricion, alumnos, leads. AUN son seeds sin
  panel del coach y deben migrarse a CRUD administrable: contenido de "Descubre"
  (rutinas destacadas, categorias, articulos — `src/data/discover.ts`), secciones
  demo del dashboard premium (logros/recursos/medidas/graficas base), recompensas/
  mensajes del onboarding, y el contenido de marketing de la landing. Al tocar
  cualquiera de estos, convertirlo en administrable en vez de dejar el seed fijo.
- Al planificar cada version/incremento nuevo: pensar primero "¿como lo administra el
  coach?" antes de construir la experiencia del alumno.

## Decision de alcance (etapa actual)
Primera etapa sera local y basica, sin backend ni Supabase. Solo landing, login,
dashboard cliente y dashboard admin. La persistencia es real pero local
(`localStorage`): los datos sobreviven a recargas. Funciones avanzadas se
agregan despues.

## Stack
- Next.js App Router con TypeScript.
- React y Tailwind CSS.
- Iconos con `lucide-react`.
- Persistencia local con `localStorage` (sin backend, sin Supabase). Las
  colecciones se siembran con `src/data` en la primera ejecucion.

## Arquitectura
Flujo de datos por capas (la UI nunca toca los datos directamente):

`UI (components / sections / pages) -> services -> repositories -> data (seed) / localStorage`

- `src/app`: rutas principales (`/`, `/login`, `/register`, `/agendar`, `/dashboard`, `/admin`).
- `src/components`: componentes reutilizables de UI y composicion.
- `src/sections`: secciones grandes de la landing page.
- `src/layouts`: layouts reutilizables para vistas tipo dashboard.
- `src/context`: providers de React (auth mock con Context API).
- `src/data`: semillas (seed) iniciales de cada coleccion.
- `src/lib/local-store.ts`: capa de persistencia sobre `localStorage` (lectura/escritura + siembra; segura en SSR).
- `src/repositories`: interfaces + implementaciones. `Mock*` sirve contenido de marketing estatico (lo lee la landing en el servidor); `Local*` persiste datos operativos en `localStorage`. Unico punto a cambiar al migrar a una base de datos (`src/repositories/index.ts`).
- `src/services`: capa que consumen los componentes. Metodos `async` (lectura y escritura) listos para un backend real.
- `src/components/admin/admin-panel.tsx`: UI de gestion del panel admin (crear/editar cliente, crear programa, asignar programa, editar progreso, ficha de lead).
- `src/components/dashboard/`: dashboard premium del alumno. `premium-dashboard.tsx` (orquestador + 18 secciones) y `charts.tsx` (gráficas SVG sin dependencias). Consume `coachingService` + `metricsService`.
- `src/components/onboarding-wizard.tsx`: wizard de evaluacion inicial (12 pasos) embebido en la seccion `#agenda` de la landing. Consume `onboardingService` + `onboardingContentService` (mensajes/recompensas/prediccion PUBLICADOS por el coach). El paso 12 es la pantalla de PREDICCION (peso actual/objetivo, fecha estimada informativa, mensaje motivacional y texto de prediccion segun objetivo, recompensas publicadas, sin garantizar resultados). Termina en `/register` -> dashboard como antes.
- `src/services/onboarding.service.ts` + `src/data/onboarding.ts`: recomendacion de plan (reglas simples) y opciones de cada paso.
- `src/components/admin/exercise-library.tsx`: CRUD de la biblioteca de ejercicios en `/admin` (catalogo con ficha completa). Consume `exerciseLibraryService`.
- `src/components/admin/training-programs.tsx`: builder real de programas en `/admin` (CRUD de programa + dias + asignar a alumno; los ejercicios se ELIGEN de la biblioteca, no se escriben). Consume `trainingService` + `exerciseLibraryService`.
- `src/components/dashboard/training-program-view.tsx`: programa asignado del alumno (rutina de hoy, dias, ficha completa por ejercicio resuelta desde la biblioteca y checklist por series). Consume `trainingService` + `exerciseLibraryService`.
- `src/services/training.service.ts` + `src/repositories/local/training-program.repository.ts` + `src/data/training.ts`: modulo de programas de entrenamiento (datos, persistencia y logica).
- `src/services/exercise-library.service.ts` + `src/repositories/local/exercise-library.repository.ts` + `src/data/exercise-library.ts`: biblioteca de ejercicios (catalogo reutilizable).
- `src/components/admin/nutrition-plans.tsx`: builder de planes de nutricion en `/admin` (CRUD de plan + dias + comidas + asignar a alumno). Consume `nutritionService`.
- `src/components/dashboard/nutrition-plan-view.tsx`: plan nutricional asignado del alumno (macros diarios, agua, comidas del dia y checklist de comidas). Consume `nutritionService`.
- `src/services/nutrition.service.ts` + `src/repositories/local/nutrition-plan.repository.ts` + `src/data/nutrition.ts`: modulo de nutricion (datos, persistencia y logica).
- `src/config/coachConfig.ts`: configuracion global del coach (nombre, telefono, WhatsApp, precio mensual). Fuente UNICA del contacto + helper `whatsappUrl(mensaje)` para los enlaces wa.me.
- `src/app/entrenar/page.tsx`: modo entrenamiento real del alumno (preparacion, contador, temporizador por ejercicio, pausa/reanudar, anterior/siguiente, pantalla de descanso con +20s/omitir, resumen con duracion/calorias/sensacion). Consume `trainingService` + `exerciseLibraryService`; helpers en `src/lib/workout.ts`.
- `src/app/perfil/page.tsx`: "Mi perfil" del alumno (nombre, peso actual/objetivo, IMC, grafica de peso, totales de entrenamientos/minutos/calorias, contacto WhatsApp del coach). Consume `clientDashboardService` + `trainingService` + `metricsService`.
- `src/components/dashboard/workout-history.tsx`: historial de entrenamientos DERIVADO de sesiones reales (racha, calendario mensual, min/kcal por dia, lista). Consume `trainingService.getResultsForUser`.
- `src/lib/workout.ts`: utilidades del modo entrenamiento (parseo de segundos, estimacion informativa de calorias, formato de reloj/minutos).
- `src/lib/youtube.ts`: normaliza enlaces de YouTube (`youtubeId`/`youtubeEmbedUrl`) desde cualquier formato (watch, youtu.be, shorts, embed, live) a la URL de insercion `/embed/ID`. Soporta enlaces NO LISTADOS.
- `src/lib/validation.ts`: validaciones puras de formularios (`isValidEmail`, `isBlank`, `isNonNegativeNumber`, `isPositiveNumber`, `isPositiveInt`, `isValidUrlOrEmpty`, `isValidVideoOrEmpty`). Las usan los formularios del coach y del alumno antes de llamar a los servicios.
- Migracion a Supabase — Bloque 0 (fundaciones, ver `APP_MIGRATION_PLAN.md`): `src/lib/supabase.ts` (cliente Supabase del navegador, LAZY: no rompe si faltan credenciales); `src/repositories/backend.ts` (feature flag `NEXT_PUBLIC_DATA_BACKEND=local|supabase` + override por-repo `NEXT_PUBLIC_SUPABASE_REPOS` + `pickRepository(key, local, () => supabase)`); `src/repositories/supabase/` (`mappers.ts` camel↔snake, `query.ts` unwrap/assertOk, `README.md` con el patron). `src/repositories/index.ts` cablea los 13 repos migrables con `pickRepository` pero SIN factoria Supabase todavia -> siempre devuelve `Local` (comportamiento identico; la app sigue en localStorage). Ningun repo migrado aun; no se toco UI/services/auth. `@supabase/supabase-js` instalado.
- Migracion a Supabase — Bloque 1 HECHO (Auth + Organizacion/Settings, ver `APP_MIGRATION_PLAN.md`): primer bloque REAL migrado, gateado por flag (default sigue `local` -> cero regresion). (1) `src/services/supabase-auth.service.ts`: Supabase Auth (login/register/logout/sesion/`onAuthChange`) que arma `AuthUser` desde `profiles` + `memberships` (rol owner/admin/coach -> `admin`; client -> `client`); mismo contrato `AuthResult`/`AuthUser`. En `register` solo hace `signUp` (la fila `clients` + membership client se difieren al Bloque 4). (2) `src/context/auth-context.tsx`: SOLO su interior cambia, gateado por `backendFor("auth")` -> con `local` el camino mock queda byte-identico; con `supabase` usa el SDK (persiste sesion, sin escribir la clave `coach-fitness:auth-user`). `useAuth()` NO cambia. (3) `src/repositories/supabase/org-context.ts`: resolver de la org activa (`getCurrentOrgId()` via `profiles.default_organization_id` -> primera membership `active`; cacheado; `clearOrgCache()` en cada cambio de sesion). (4) `src/repositories/supabase/settings.repository.ts`: `SupabaseSettingsRepository` (get/save -> tabla `organizations`, cumple la interfaz `SettingsRepository`); cableado en `index.ts` con factoria lazy. Credenciales en `.env.local` (NO commiteado; `.env*` gitignoreado). Seed del negocio demo: `supabase/seed/0100_block1_demo_org.seed.sql` (1 org "Coach Fitness" + membership owner del coach + coach + membership client del alumno). Verificado en vivo contra Supabase (16/16 OK): login coach/alumno, `profiles` auto-creados por trigger, `organizations`/`memberships` correctos, resolver de org, settings save+get persistido, RLS (alumno NO edita la org; anonimo ve 0 filas de organizations/profiles/memberships). Para probar en la app: en `.env.local` descomentar `NEXT_PUBLIC_SUPABASE_REPOS=auth,settings`. Sin merge/push; rama `feature/supabase-migration`.
- Migracion a Supabase — Bloque 2 HECHO (Catalogo del coach, ver `APP_MIGRATION_PLAN.md`): migrados 3 repos del catalogo, gateados por flag (default sigue `local`). BD: `supabase/migrations/0008_phase2_taxonomy_media.sql` (Fase 2: `exercise_categories`/`nutrition_categories`/`program_categories`/`tags`/`media_assets` + RLS staff-CRUD/miembros-SELECT) y `0009_phase3_catalog.sql` (Fase 3: `library_exercises` + puente `exercise_media`, `discover_routines/categories/articles`, `onboarding_messages/rewards/predictions` + triggers updated_at/audit + RLS). Repos: `src/repositories/supabase/discover.repository.ts`, `onboarding-content.repository.ts` (ambos sobre el helper DRY `content-crud.ts` -> `publishableEntity`: CRUD + publicar/despublicar, `create` con `published:true` para PARIDAD con los `Local*`, `remove` = SOFT DELETE via `deleted_at`, `list` mas-nuevo-primero) y `exercise-library.repository.ts` (multimedia NORMALIZADA: image/gif/video son "slots" role en `exercise_media` -> `media_assets`; ensambla al leer y reconcilia al crear/actualizar/limpiar; expone el tipo `LibraryExercise` intacto). Cableados en `index.ts` con factoria lazy (`pickRepository<Interface>(...)` para que el tipo sea la interfaz, no la clase Local). DECISIONES: (a) media de ejercicios normalizada (sin columnas image/gif/video en `library_exercises`, kind del video = `link`); (b) `published` por defecto `true` (paridad); (c) lectura PUBLICA (anon) de contenido `published` en discover/onboarding (landing/wizard/descubre), `library_exercises` solo lo leen miembros de la org; (d) `exercise_tags` y `library_exercises.category_id` DIFERIDOS (el tipo aun no los usa; `category_id` existe nullable por diseno). Verificado en vivo contra Supabase (23/23 OK): CRUD completo de los 3 repos, ensamblado + reconciliacion de media (crear/editar video, borrar gif), orden newest-first, `published` default true, soft delete oculta, RLS (alumno no INSERT/UPDATE, solo ve publicado; anon lee publicado y NO ve no-publicado ni `library_exercises` ni puede INSERT), array `muscle_groups` round-trip. Lint + build limpios. Fases BD 2 y 3 quedan `Implementada` en `DATABASE_MASTER_PLAN.md`. Para probar en la app: `NEXT_PUBLIC_SUPABASE_REPOS=auth,settings,discover,onboardingContent,exerciseLibrary`. Sin merge/push.
- Migracion a Supabase — Bloque 3 HECHO (Leads + Evaluaciones, ver `APP_MIGRATION_PLAN.md`): migrado `leadRepository`, gateado por flag (default sigue `local`). BD: `supabase/migrations/0010_phase4_leads_evaluations.sql` (Fase 4: tablas `leads` y `evaluations` + triggers updated_at/audit + RLS + RPC `create_lead_public`). CLAVE: `createLead` (formulario `/agendar`) y `createEvaluationLead` (onboarding) son ANONIMOS -> ambos pasan por la RPC `create_lead_public` (SECURITY DEFINER, `revoke ... from public` + `grant ... to anon, authenticated`), que inserta el lead (+ evaluacion) SIN politica de INSERT abierta sobre `leads`; el resto (`getLeads`/`updateStatus`/`updateLead`/`deleteLead`) es del STAFF bajo RLS por org (`is_org_staff`). Repo: `src/repositories/supabase/lead.repository.ts` (misma interfaz; la evaluacion se guarda como `jsonb` en `evaluations.data` y se ensambla al leer; `deleteLead` = HARD DELETE con cascade a la evaluacion). Cableado en `index.ts` con factoria lazy. DECISIONES: (a) captura anonima solo por RPC; (b) evaluacion en `jsonb` (campos flexibles, no se filtran); (c) la RPC resuelve la org destino (`p_org` explicito o la unica/primera org activa; ruteo por-dominio de la landing = futuro); (d) `evaluations.client_id` nullable SIN FK todavia (la FK a `clients` se agrega en Fase 5); (e) `deleteLead` hard delete para paridad con el `Local*`. Verificado en vivo (24/24 OK): createLead/createEvaluationLead por RPC (paridad source `Landing`/`Evaluación`, status `Nuevo`, trim, message vacio, objective de la eval), evaluacion `jsonb` persistida y legible por staff, integracion (staff ve leads creados por anon), orden newest-first, updateStatus (+null si no existe), updateLead escalares, deleteLead (true + desaparece + cascade borra evaluacion + repetido=false), RLS anon (no lee leads/evaluations ni su propio lead, no INSERT/UPDATE directo), RLS alumno (no lee/UPDATE/DELETE), y SEGURIDAD de la RPC SECURITY DEFINER sin escalacion (org inexistente rechazada por FK; la RPC no expone lectura ni otras operaciones privilegiadas). Lint + build limpios. Fase BD 4 queda `Implementada` en `DATABASE_MASTER_PLAN.md`. Para probar en la app: agregar `lead` a `NEXT_PUBLIC_SUPABASE_REPOS`. Sin merge/push.
- Migracion a Supabase — Bloque 4 HECHO (Alumnos + Progreso + Asignaciones, ver `APP_MIGRATION_PLAN.md`): migrados `clientRepository` y `progressRepository` + CIERRE de `register→clients`, gateado por flag (default sigue `local`). BD: `supabase/migrations/0011_phase5_clients_progress_assignments.sql` (Fase 5: `clients`, `client_progress`, `student_assignments` [tabla GENERICA de asignaciones, para Bloques 5/6] + FK `evaluations.client_id -> clients` [cierre Fase 4] + helper `my_client_id(org)` SECURITY DEFINER + triggers + RLS + RPC `register_client`). Repos: `src/repositories/supabase/client.repository.ts` (`clients`; evaluacion en `evaluations` por `client_id`; `getClients` orden asc [paridad con `push`]; `deleteClient` = SOFT DELETE) y `progress.repository.ts` (`client_progress`, 1 fila/cliente por `unique(client_id)`; `getForClient` siembra el `starterClientProgress` como el Local; `saveForClient` = upsert `onConflict client_id`). CIERRE register→clients: `supabaseAuthService.register`, con sesion activa, llama la RPC `register_client` (SECURITY DEFINER; crea membership `client` + fila `clients` para `auth.uid()` + adjunta la evaluacion PENDIENTE de `pendingEvaluationRepository` [localStorage, NO migrado] y la limpia). Cableados en `index.ts` con factoria lazy. DECISIONES: (a) `createClient` del repo es del STAFF (admin crea alumno / convierte lead) con INSERT bajo RLS staff; el auto-registro va por la RPC (solo para el propio usuario, sin escalacion); (b) evaluacion del alumno en `evaluations.client_id` (misma tabla que leads); (c) `deleteClient` soft delete (el progreso/fotos los limpian las llamadas separadas del `adminDashboardService`); (d) `my_client_id(org)` habilita las politicas del alumno (lee/gestiona SOLO lo suyo); la politica `evaluations_select` se AMPLIO para que el alumno lea su propia evaluacion; (e) `student_assignments` creada pero aun SIN repos que la consuman (la usan Bloques 5/6). Verificado en vivo (29/29 OK): CRUD de clients (alta staff, access Vencido por defecto, orden asc, updateClient +null, soft delete +repetido), CRUD de progress (siembra inicial sin duplicar, upsert, remove), `register_client` (crea el cliente del propio usuario, idempotente), register→clients (evaluacion vinculada y legible por el alumno), evaluacion vinculada al alumno, `student_assignments` (staff crea, alumno lee la suya, alumno no crea), `findByUserId` por user_id, RLS alumno (solo su cliente/progreso; no INSERT/UPDATE ajeno), RLS anonimo (0 filas de clients/progress/assignments; no INSERT), aislamiento. Lint + build limpios. Fase BD 5 queda `Implementada` en `DATABASE_MASTER_PLAN.md`. Bloque 4 es prerequisito de 5-8. Para probar en la app: agregar `client,progress` a `NEXT_PUBLIC_SUPABASE_REPOS`. Sin merge/push.
- Migracion a Supabase — Bloque 5 HECHO (Entrenamiento, ver `APP_MIGRATION_PLAN.md`): migrado `trainingProgramRepository` (20/20 metodos), gateado por flag (default sigue `local`). BD: `supabase/migrations/0012_phase6_training.sql` (Fase 6: `training_programs`->`training_days`->`training_exercises`, `workout_day_progress`, `exercise_series_progress`, `workout_results` + triggers + RLS). Repo: `src/repositories/supabase/training-program.repository.ts` con ENSAMBLADO ANIDADO (`TrainingProgram.days[].exercises[]` ordenado por `position`); cada mutacion (add/delete/duplicate day, add/delete/duplicate/move exercise) devuelve el programa RE-ENSAMBLADO (getProgram). DECISIONES: (a) `deleteProgram` = SOFT DELETE (`deleted_at`); (b) ASIGNACION via `student_assignments` (Fase 5, `resource_type='training_program'`; `assignToClient` borra las previas e inserta UNA activa; `getAssignment` = la activa mas reciente); (c) progreso del alumno: `workout_day_progress` (dia completado = existe fila; unique client_id+day_id), `exercise_series_progress` (indices `int[]` por instancia; unique client_id+exercise_instance_id; toggle lee-modifica-upsert), `workout_results` (sesiones del modo entrenamiento, newest-first por `created_at`; `date`/`day_id` como TEXTO historico); (d) `training_exercises.exercise_id`->`library_exercises` ON DELETE SET NULL; (e) RENUMERACION de `position` para duplicar/mover (supabase-js no permite `position = position + 1`, se reordena 0..n-1); (f) RLS: catalogo (programas/dias/ejercicios) staff-CRUD + SELECT miembros de la org (el alumno lee su programa asignado); progreso staff + alumno dueño (`my_client_id`). Cableado en `index.ts` con factoria lazy. Verificado en vivo (29/29 OK): crear/editar/eliminar programa, crear/duplicar/eliminar dia, agregar/mover/duplicar/eliminar ejercicio (orden correcto + ids nuevos + '(copia)'), exerciseId de biblioteca round-trip, ensamblado anidado, asignar/reasignar (una activa), workout_day_progress (marcar/desmarcar), exercise_series_progress (indices [0,2]->[2]), workout_results (guardar + newest-first), RLS alumno (lee programas/su asignacion, escribe SU progreso, NO INSERT/UPDATE programa ni progreso ajeno), RLS anon (0 filas + sin INSERT). Lint + build limpios. Fase BD 6 queda `Implementada` en `DATABASE_MASTER_PLAN.md`. Para probar en la app: agregar `trainingProgram` a `NEXT_PUBLIC_SUPABASE_REPOS`. Sin merge/push.
- `src/context/toast-context.tsx`: sistema global de notificaciones toast (`useToast().success/error/info`), montado en `layout.tsx` dentro de `AuthProvider`. Sin dependencias; animacion `.toast-in` en `globals.css`; respeta `prefers-reduced-motion`; autocierre 3.5s. Lo consumen los managers del admin, el panel, el onboarding y el registro/login.
- `src/context/settings-context.tsx`: `SettingsProvider` + `useSettings()` (white-label). Carga la configuracion del negocio en el cliente, la expone (`settings`, `refresh`, `whatsappUrl`) y aplica los colores de marca como variables CSS `--brand`/`--brand-2`. Montado en `layout.tsx`.
- `src/services/settings.service.ts` + `src/repositories/local/settings.repository.ts` + `src/data/settings.ts`: configuracion del negocio (marca, contacto, redes, legales, colores, precio) persistida como registro unico en `localStorage` (clave `settings`); el default sale de `coachConfig` (que queda solo como fallback). El repo hace merge con el default para no romper configs antiguas.
- `src/components/admin/business-settings.tsx`: editor de "Configuracion del negocio" en `/admin` (marca, contacto, redes, legales, colores, precio) con validacion (email/URLs) y toast. Consume `settingsService` + `useSettings().refresh`.
- `src/components/admin/coach-overview.tsx`: dashboard principal del coach (metricas reales derivadas, grafica de entrenamientos 14 dias, proximas renovaciones, ultimos alumnos, actividad reciente, accesos rapidos que hacen scroll a cada seccion). Consume `adminDashboardService.getCoachOverview()` + `useSettings()`.
- `src/components/brand-link.tsx`: marca del header (white-label) que lee el nombre del negocio de `useSettings()`. Usado por `DashboardShell`.
- `src/services/crm.service.ts` + `src/repositories/local/crm.repository.ts`: CRM pipeline. Compone leads (Nuevo/Contactado) + alumnos con su etapa (derivada de datos reales via `deriveClientStage` o el override manual del coach) y metadatos CRM (notas, proxima accion, seguimiento, historial). Exporta `CRM_STAGES` (orden de columnas) y `CRM_STAGE_STYLE`. `LocalCrmRepository` persiste `CrmRecord` por `entityId` (clave `crm`), sin seed. `setStage` agrega al historial; `convertLead` reusa `leadService.convertToClient` y transfiere las notas al nuevo alumno.
- `src/components/admin/crm-pipeline.tsx`: pipeline tipo kanban en `/admin` (columnas por etapa con contador, buscador, filtros por etapa, cambiar etapa, notas/proxima accion/seguimiento, WhatsApp, convertir lead, historial). Consume `crmService`.
- `src/services/notifications.service.ts` + `src/repositories/local/notifications.repository.ts`: centro de notificaciones. Las notificaciones se DERIVAN de datos reales (leads, alumnos, accesos, entrenamientos) con ids deterministas; el repo guarda solo los ids "leidos" (clave `notifications-read`). Metodos: `getAll` (merge con leido, ordenadas por fecha), `getUnreadCount`, `markRead`, `markAllRead`.
- `src/components/admin/notifications-center.tsx`: centro de notificaciones en `/admin` (ver todas, marcar leida / todas leidas, filtros por tipo y prioridad, badge de no leidas). Consume `notificationsService`. El overview del coach muestra el contador + las ultimas y un acceso rapido.
- `src/lib/print.ts`: exportaciones imprimibles (sin PDF real). `printClientProfile`, `printProgram`, `printNutrition` abren una ventana nueva con un documento HTML autocontenido (estilos inline, claro para imprimir/guardar como PDF via `window.print`) e incluyen el nombre del negocio (white-label). No tocan el diseño de la app. Botones "Imprimir" en las cards de programas/nutricion y en la ficha del alumno (`admin-panel.tsx`).
- `src/components/exercise-video.tsx`: boton reutilizable "Ver demostracion" del video del ejercicio. Si es YouTube, lo reproduce EMBEBIDO (iframe 16:9, toggle) con enlace "Abrir en YouTube"; si no, abre el enlace en pestaña nueva. `variant="button"` (ficha) o `variant="link"` (modo entrenamiento). Usado por `training-program-view.tsx` y `/entrenar`.
- `src/app/descubre/page.tsx`: seccion "Descubre" del alumno (rutinas destacadas, categorias por zona cruzadas con la biblioteca de ejercicios, articulos). Consume `discoverService.getPublished*` (SOLO contenido publicado por el coach) + `exerciseLibraryService`.
- `src/components/admin/discover-manager.tsx`: CMS de "Descubre" en `/admin` (pestañas Rutinas/Categorias/Articulos; CRUD + publicar/despublicar por item). Consume `discoverService`.
- `src/components/admin/onboarding-content-manager.tsx`: CMS del contenido del onboarding en `/admin` (pestañas Mensajes/Recompensas/Prediccion; CRUD + publicar/despublicar por item). Consume `onboardingContentService`.
- `src/services/onboarding-content.service.ts` + `src/repositories/local/onboarding-content.repository.ts` + `src/data/onboarding-content.ts`: CMS del contenido del onboarding persistido en `localStorage` (patron `Local*`). El servicio expone getters de solo-publicados para el onboarding/prediccion (`getPublishedMessages/Rewards/Predictions`) y CRUD + publicar/despublicar para el coach. Los seeds solo siembran la primera vez (demo).
- `src/app/plan/page.tsx`: pantalla "Obtener mi plan" (resumen del plan, zona, nivel, duracion, calorias estimadas, vista previa de semanas/ejercicios, "Entrar a mi plan"). Consume `planService`.
- `src/services/discover.service.ts` + `src/repositories/local/discover.repository.ts` + `src/data/discover.ts`: CMS de "Descubre" persistido en `localStorage` (patron `Local*`). El servicio expone getters de solo-publicados para el alumno (`getPublishedRoutines/Categories/Articles`) y CRUD + publicar/despublicar para el coach. Los seeds solo siembran la primera vez (demo).
- `src/services/plan.service.ts`: compone el resumen del plan del alumno (programa asignado + evaluacion + calorias via `metricsService`).
- `src/types`: tipos compartidos del proyecto.

Importante: `localStorage` solo existe en el navegador. Por eso las paginas que
muestran datos persistidos (`/admin`, `/dashboard`) son componentes cliente que
cargan via servicios en `useEffect`. La landing sigue siendo servidor (su
contenido es estatico y no requiere persistencia).

## Decisiones tecnicas
- Cierre v1.5 — Builder de programas (duplicar/mover/duplicar/eliminar) + exportaciones imprimibles (rama `feature/student-mobile-premium-experience`, decimo incremento de v1.5, TODO ADITIVO, sin cambiar el diseño general): bloques finales antes de entregar. (1) PROGRAMAS: el builder (`training-programs.tsx` / `DayCard`) ahora permite **duplicar dia** (copia con ids nuevos justo despues, nombre "(copia)"), **mover ejercicio arriba/abajo**, **duplicar ejercicio** (copia adyacente con id nuevo) y **eliminar ejercicio** (ya existia), con feedback via toast. Nuevos metodos en la capa: `trainingProgramRepository.duplicateDay/duplicateExercise/moveExercise` (+ `trainingService`), sobre el helper `mutate` inmutable; todo en `localStorage`. Las acciones por fila usan el helper `IconAction` (subir deshabilitado en el primero, bajar en el ultimo). (2) EXPORTACIONES: `src/lib/print.ts` con `printClientProfile`/`printProgram`/`printNutrition` que abren una ventana con un documento HTML imprimible (window.print; sin PDF real ni backend), con el nombre del negocio (white-label) y datos escapados. Botones "Imprimir" en las cards de programas y nutricion y en la ficha del alumno. Verificado end-to-end (mover Press banca abajo; duplicar ejercicio 4->5 con id unico; eliminar 5->4; duplicar dia 3->4 con ids nuevos y mismos nombres; imprimir programa/nutricion/perfil captura el HTML correcto, incluida la evaluacion cuando existe y "Sin evaluacion" cuando no), lint, build, responsive 320 sin overflow (tabla con scroll-x, header con wrap) y consola limpia. Sin Supabase ni backend. Con esto v1.5 queda lista para auditoria final y evaluar merge; pendientes de "SaaS completo" no bloqueantes: biblioteca multi-media, constructor por semanas/drag&drop, nutricion avanzada, reportes PDF reales.
- SaaS profesional v1.5 — CRM pipeline + Centro de notificaciones (rama `feature/student-mobile-premium-experience`, noveno incremento de v1.5, TODO ADITIVO, nada eliminado): segundo bloque del pase "producto vendible". (FASE 5) CRM PIPELINE: nueva seccion en `/admin` (`crm-pipeline.tsx`) tipo kanban con 9 etapas (Lead, Nuevo alumno, Evaluacion pendiente, Evaluacion completada, Programa asignado, Entrenando, Suspendido, Finalizado, Renovado). La etapa de cada item se DERIVA de datos reales (`crmService.deriveClientStage`: Pausado->Suspendido, Vencido+pago->Finalizado, renovacion reciente->Renovado, sin evaluacion->Evaluacion pendiente/Nuevo alumno, con evaluacion sin programa->Evaluacion completada, con programa sin entrenos->Programa asignado, con entrenos->Entrenando; leads Nuevo/Contactado->Lead) o se fija manualmente (override que se guarda con historial). Cada tarjeta: badge por etapa, contador por columna, buscador (nombre/email/objetivo), filtros por etapa, cambiar etapa, notas internas, proxima accion, fecha de seguimiento, WhatsApp rapido (leads con telefono), convertir lead (transfiere las notas al alumno) e historial de movimientos. Capas: tipos `CrmStage`/`CrmRecord`/`CrmItem`/`CrmHistoryEntry`; `crmService` -> `LocalCrmRepository` (clave `crm`, sin seed) -> `localStorage`. (FASE 7) CENTRO DE NOTIFICACIONES: nueva seccion (`notifications-center.tsx`) con notificaciones DERIVADAS de datos reales (nuevo lead, alumno registrado, entreno completado, dias sin entrenar, programa asignado/finalizado, acceso por vencer/vencido, evaluacion completada, sin programa, sin nutricion) con ids DETERMINISTAS; el estado "leido" se persiste por id (`LocalNotificationsRepository`, clave `notifications-read`). Permite ver todas, marcar leida / todas leidas, filtrar por tipo y por prioridad (alta/media/baja) y muestra badge de no leidas. El overview del coach (`coach-overview.tsx`) muestra el contador de no leidas (campana con badge), las ultimas 3 notificaciones y accesos rapidos a Notificaciones y CRM. Verificado end-to-end (13 notificaciones derivadas; marcar una baja el badge 13->12; marcar todas -> 0 + toast; pipeline con 9 columnas y contadores; guardar notas/proxima accion/seguimiento; cambiar etapa -> mueve de columna + historial; convertir lead -> alumno creado + lead Convertido), responsive 320 (kanban con scroll horizontal, sin overflow de pagina), lint, build y consola limpios. Sin Supabase ni backend. Pendientes del pedido global: fases 2 (biblioteca multi-media), 3 (constructor semana/drag&drop), 4 (nutricion avanzada), 8 (reportes PDF), 9 (exportaciones).
- SaaS profesional v1.5 — Dashboard del coach + Configuracion del negocio (white-label) (rama `feature/student-mobile-premium-experience`, octavo incremento de v1.5, TODO ADITIVO, nada eliminado): primer bloque del pase "producto vendible". (FASE 1) Nuevo dashboard del coach (`coach-overview.tsx`) al tope de `/admin` con metricas REALES derivadas via `adminDashboardService.getCoachOverview()`: alumnos activos/suspendidos/vencidos/total, programas, rutinas publicadas, articulos, ejercicios, ejercicios con video, entrenamientos hoy/semana/mes (agregados de `WorkoutResult` de todos los alumnos), progreso promedio, meta de peso promedio e IMC promedio (de evaluaciones), ingresos estimados, proximas renovaciones, ultimos alumnos, actividad reciente (entrenamientos + leads) y grafica de barras de entrenamientos (14 dias). Ademas: accesos rapidos que hacen scroll a cada seccion del panel. El panel ejecutivo de 10 StatCards se mantiene debajo (brechas operativas). (FASE 6) Configuracion del negocio administrable (white-label): entidad `BusinessSettings` (nombre, eslogan, descripcion, logo, telefono, whatsapp, email, direccion, horario, Instagram/Facebook/TikTok/YouTube, politicas, terminos, color principal/secundario, precio mensual, moneda) via `settingsService` -> `LocalSettingsRepository` (registro unico, clave `settings`, merge con default) -> `localStorage`. El default sale de `coachConfig` (que queda SOLO como fallback; no se elimino). `SettingsProvider`/`useSettings()` la exponen a toda la app y `BrandLink` muestra el nombre del negocio en el header (white-label en vivo tras guardar). Editor `business-settings.tsx` con validacion (email + URLs de redes/logo) y toast. NOTA/CONTRADICCION con la regla "mantener SIEMPRE la paleta neon": los colores de marca se GUARDAN y se exponen como variables CSS `--brand`/`--brand-2`, pero la interfaz conserva la paleta neon actual; el theming global completo queda como follow-up (no se rompio la paleta). Verificado end-to-end (overview con datos reales; guardar configuracion -> toast + nombre actualizado en vivo en header y overview; URL invalida bloqueada), responsive 320-1440 (se corrigio el nav del header para truncar la marca larga), lint y build limpios. Fases pendientes del pedido (2 biblioteca multi-media, 3 constructor semana/drag&drop, 4 gestor nutricional avanzado, 5 CRM pipeline, 7 notificaciones, 8 reportes PDF, 9 exportaciones) quedan como proximos bloques.
- Auditoria final v1.5 RC — profesionalizacion + validaciones + responsive (rama `feature/student-mobile-premium-experience`, septimo incremento de v1.5, TODO ADITIVO / mejoras seguras, nada eliminado): pase de "release candidate" que endurece la plataforma para entregar a un coach real. (1) TOASTS: nuevo `ToastProvider` global (`src/context/toast-context.tsx`) montado en `layout.tsx`; feedback de exito/error en todas las acciones CRUD del coach (biblioteca de ejercicios, programas, nutricion, Descubre, Onboarding) y en el panel (`admin-panel.tsx`: crear/eliminar alumno, renovar/pausar acceso, convertir/editar/eliminar lead) y en registro/login. (2) VALIDACIONES (`src/lib/validation.ts`, puras): email valido en onboarding/registro/login y edicion de lead; enlace de video valido (YouTube o URL) con error inline en la biblioteca; series entero positivo y reps numero/rango (ej. 8-12) en el builder de programas con error inline; inputs numericos del onboarding con `min=0`/`inputMode=numeric` (sin pesos/edades negativos); el paso 2 exige peso y estatura > 0. (3) RESPONSIVE 320px: se corrigio el overflow del wizard (padding del card `p-4 sm:p-8` + botones de navegacion mas compactos en movil) y del dashboard (grids con `[&>*]:min-w-0` para que las tarjetas encojan) + `overflow-x-clip` en el contenedor de contenido de `DashboardShell` como red de seguridad; verificado sin overflow horizontal en 320/360/375/390/414/768/1024/1280/1440 en landing, admin, dashboard, descubre, perfil, plan y entrenar. Sin Supabase ni backend; no se elimino ninguna funcionalidad. Verificado end-to-end (toast al crear ejercicio, video invalido bloqueado con error inline, email invalido deshabilita continuar, coach despublica y el alumno no lo ve), lint y build limpios.
- Onboarding premium conectado al CMS + pantalla de prediccion (rama `feature/student-mobile-premium-experience`, sexto incremento de v1.5, SEGUNDA MITAD del incremento de onboarding — parte 1 fue el panel del coach; TODO ADITIVO, nada eliminado): el wizard de la landing (`onboarding-wizard.tsx`) ahora CONSUME el contenido publicado por el coach via `onboardingContentService.getPublished{Messages,Rewards,Predictions}` (solo lo publicado). Cambios: (1) `TOTAL_STEPS` 11 -> 12, se agrego un campo OPCIONAL "Peso objetivo (kg)" en el paso 2 (guardado en `evaluation.targetWeight`, que ya existia como opcional en `LeadEvaluation`); (2) en el diagnostico (paso 11) se muestra un mensaje motivacional PUBLICADO segmentado por objetivo (o "General"); (3) NUEVO paso 12 "Tu prediccion personalizada": peso actual, peso objetivo, fecha estimada INFORMATIVA (hoy + semanas del plan recomendado, `formatDate`), texto de prediccion publicado segun objetivo (fallback a "General" y luego a un texto por defecto seguro), recompensas publicadas (iconos target/trophy/sparkles/gift/star/medal), y un disclaimer explicito de que es informativo y NO garantiza resultados ni es recomendacion medica. Helpers locales en el wizard: `pickByObjective` (coincide objetivo -> "General" -> primero), `weeksFromLabel`, `addWeeksISO`. El contenido se carga en `useEffect` (cliente) y se selecciona con `useMemo` por objetivo. El flujo sigue igual: "Quiero comenzar" en el paso 12 guarda el lead + pending y redirige a `/register` -> dashboard. No se toco el resto de la landing ni el flujo de registro; sin Supabase ni backend. Verificado end-to-end (coach despublica una recompensa y el alumno ya no la ve; mensaje/prediccion segun "Perder grasa"; peso actual/objetivo/fecha estimada; registro -> dashboard con `targetWeight` guardado), lint, build y movil 375px sin overflow.
- Video del ejercicio embebido + auditoria del flujo de ejercicios/programas (rama `feature/student-mobile-premium-experience`, quinto incremento de v1.5, MEJORA SEGURA + verificacion, nada eliminado): se auditó de punta a punta el flujo que ya existia (biblioteca de ejercicios -> programas -> asignacion -> dashboard del alumno -> modo entrenamiento) y se confirmo que el coach ya podia CRUD de ejercicios con TODOS los campos (nombre, grupo/musculos secundarios, imagen, gif, video YouTube, equipo, dificultad, descripcion, tecnica, errores, consejos, variantes, sustituciones, tiempo y descanso recomendados), armar programas ELIGIENDO ejercicios de la biblioteca, y asignarlos a alumnos. UNICA mejora agregada (aditiva): el enlace de YouTube del ejercicio ahora se REPRODUCE EMBEBIDO dentro de la ficha del alumno y del modo entrenamiento, en vez de solo abrir en pestaña nueva. Componente reutilizable `ExerciseVideo` (`src/components/exercise-video.tsx`) + helper `src/lib/youtube.ts` (`youtubeEmbedUrl` normaliza watch/youtu.be/shorts/embed/live a `/embed/ID`; soporta enlaces NO LISTADOS). En la ficha (`training-program-view.tsx`) el boton "Ver demostracion" alterna un iframe 16:9 con enlace "Abrir en YouTube"; en `/entrenar` la variante `link` hace lo mismo. Si el enlace no es de YouTube, se mantiene el comportamiento previo (abrir en pestaña nueva). Aclaracion en el formulario de la biblioteca: el video puede ser publico o NO LISTADO (los privados no se reproducen fuera de la cuenta del dueño). Verificado end-to-end (crear ejercicio con foto+video+descripcion, editar, eliminar, agregar a programa, asignar a alumno, alumno lo ve en dashboard y en modo entrenamiento, video embebido con src `/embed/ID`), lint, build y movil 375px sin overflow. Sin Supabase ni backend; no se elimino nada de v1.4/v1.5.
- CMS del contenido del onboarding administrado por el coach (rama `feature/student-mobile-premium-experience`, cuarto incremento de v1.5, PRIMERA MITAD — solo el panel del coach; el onboarding premium y la pantalla de prediccion que consumen este contenido se conectan despues): siguiendo la REGLA PERMANENTE, antes de tocar la vista del alumno se construyo PRIMERO el panel del coach. Modulo CMS en `/admin` con 3 entidades y 4 acciones cada una (Crear/Editar/Eliminar/Publicar-despublicar): (1) Mensajes motivacionales (`message` + `category`/segmento, que usa las etiquetas de objetivo del onboarding o "General"); (2) Recompensas (`title`, `description`, `icon` — set de iconos target/trophy/sparkles/gift/star/medal); (3) Textos de prediccion (`objective`, `title`, `body`, `timeframe`). Cada item tiene `published: boolean`; el onboarding/prediccion consumiran SOLO lo publicado (`onboardingContentService.getPublishedMessages/Rewards/Predictions` filtran por `published`), mientras el coach ve y administra todo. Capas espejo de Descubre: tipos `OnboardingMessage`/`OnboardingReward`/`OnboardingPrediction` + `CreateOnboarding*` (`Omit<…,"id"|"published">`) en `src/types`; `onboardingContentService` (getters de publicados + CRUD) -> `LocalOnboardingContentRepository` (`Local*`, helpers genericos read/create/update/remove/publish) -> `localStorage`; seeds en `src/data/onboarding-content.ts` (marcados `published:true`, solo demo). Claves nuevas en `STORAGE_KEYS`: `onboardingMessages`, `onboardingRewards`, `onboardingPredictions`. Ids `om-`/`or-`/`op-` + timestamp+random. UI: `onboarding-content-manager.tsx` (admin, pestañas Mensajes/Recompensas/Prediccion; barra de pestañas desplazable en movil, mismo estilo que `discover-manager.tsx`). NO se toco el onboarding, la landing ni la vista del alumno todavia; sin Supabase ni backend.
- CMS de "Descubre" administrado por el coach (rama `feature/student-mobile-premium-experience`, tercer incremento de v1.5, primera aplicacion de la REGLA PERMANENTE de que el coach administra TODO el contenido): el contenido de "Descubre" dejo de ser seed fijo (`MockDiscoverRepository`) y ahora es 100% administrado por el coach desde `/admin` y persistido en `localStorage`. Modulo CMS con 3 entidades y 4 acciones cada una (Crear/Editar/Eliminar/Publicar-despublicar): (1) Rutinas destacadas (titulo, categoria, nivel, duracion, minutos, descripcion, imagen opcional); (2) Categorias (nombre, descripcion, icono, grupos musculares relacionados — se cruzan con `muscleGroup` de la biblioteca para contar ejercicios reales); (3) Articulos/recursos (titulo, categoria, tiempo de lectura, contenido, imagen opcional). Cada item tiene `published: boolean`; el alumno en `/descubre` SOLO ve lo publicado (`discoverService.getPublishedRoutines/Categories/Articles` filtran por `published`), mientras el coach ve y administra todo. Capas: tipos `DiscoverRoutine`/`DiscoverCategory`/`DiscoverArticle` + `CreateDiscover*` (`Omit<…,"id"|"published">`) en `src/types`; `discoverService` (getters de publicados para el alumno + CRUD para el coach) -> `LocalDiscoverRepository` (`Local*`, CRUD generico + `setXPublished`) -> `localStorage`; seeds en `src/data/discover.ts` (marcados `published:true`, solo demo inicial). Claves nuevas en `STORAGE_KEYS`: `discoverRoutines`, `discoverCategories`, `discoverArticles`. Ids `dr-`/`dc-`/`da-` + timestamp+random. UI: `discover-manager.tsx` (admin, pestañas Rutinas/Categorias/Articulos; barra de pestañas desplazable en movil) y `/descubre` actualizado (nombres de campo `category`/`content`, iconos de categoria por nombre via mapa `CATEGORY_ICONS`). Se ELIMINO `MockDiscoverRepository` (reemplazado por el Local). No se agregaron funciones nuevas al alumno; no se cambio el diseño general; sin Supabase ni backend; no se toco landing ni onboarding.
- Descubre + Obtener mi plan (rama `feature/student-mobile-premium-experience`, segundo incremento de v1.5, TODO ADITIVO): seccion "Descubre" (`/descubre`) estilo app movil con filas horizontales: rutinas populares (seed `src/data/discover.ts`), categorias por zona (cuerpo completo, abdominales, pecho, hombros/espalda, piernas) que muestran el conteo y la lista de ejercicios REALES de la biblioteca (`exerciseLibraryService`, cruzando `muscleGroups`), y articulos/recursos (seed). El contenido de Descubre se sirve por `discoverService` -> `MockDiscoverRepository` (seeds estaticos, sin localStorage, como el contenido de la landing). Pantalla "Obtener mi plan" (`/plan`) previa/adicional al dashboard: resumen del plan recomendado, zona principal (evaluacion.focusZone/objective o dia del programa), nivel, duracion, calorias estimadas (informativas, `metricsService`), vista previa de semanas y de ejercicios del programa asignado, y boton "Entrar a mi plan" -> `/dashboard` (sin pagos). `planService.getPlanForUser` compone programa asignado + evaluacion. En el dashboard del alumno (solo con acceso Activo) se agrego una fila de ACCESOS RAPIDOS (Mi plan, Descubre, Mi perfil). El redirect de registro sigue yendo a `/dashboard` (la integracion pre-dashboard del onboarding queda para el incremento de onboarding). No se elimino nada; sin Supabase ni backend; no se toco landing ni onboarding.
- Modo entrenamiento + historial + perfil (rama `feature/student-mobile-premium-experience`, primer incremento de v1.5, TODO ADITIVO): experiencia tipo app en `/entrenar` que recorre la "rutina de hoy" (o `?day=<dayId>`) con pantalla de preparacion, contador 3-2-1, temporizador por ejercicio (duracion desde `recommendedTime` de la biblioteca o 40s por defecto), pausa/reanudar, anterior/siguiente, descanso (rest del ejercicio o 30s) con +20s y omitir, progreso "Ejercicio i/N", multimedia del ejercicio desde la biblioteca, y resumen (duracion, ejercicios, calorias estimadas *informativas*, sensacion difícil/adecuado/facil). Al finalizar guarda un `WorkoutResult` (clave `workout-results`, por clientId) via `trainingService.saveResultForUser` y marca el dia como completado (`toggleDayForUser`), por lo que se refleja en logros (derivados de `workout-progress`) y en el nuevo historial. `WorkoutHistory` (en el dashboard, solo si el acceso es Activo) DERIVA de los `WorkoutResult`: racha de dias, calendario mensual con min/kcal por dia y lista de sesiones. "Mi perfil" (`/perfil`) muestra pesos, IMC (`metricsService`), grafica de peso (LineChart con inicio/actual/meta si hay datos, si no serie demo) y totales, con contacto WhatsApp del coach. Nuevos tipos: `WorkoutResult`/`WorkoutFeeling`/`CreateWorkoutResult` y campos opcionales en `LeadEvaluation` (`targetWeight`/`motivation`/`focusZone`/`birthYear`/`injuries`/`reward`, para el onboarding premium que viene despues). `DashboardShell` admite `navHref` (el nombre del header enlaza a `/perfil`). No se elimino nada de v1.4; sin Supabase ni backend.
- Contacto centralizado del coach (en `main` desde v1.4): `src/config/coachConfig.ts` es la UNICA fuente del contacto (nombre "Cristian Valdez", telefono, WhatsApp `17868704262`, `monthlyPrice` para ingresos estimados). Los botones de contactar/renovar/ayuda/soporte (pantalla de acceso bloqueado, "Contactar coach" del dashboard, WhatsApp del admin sobre alumnos) abren `whatsappUrl(mensaje)` -> `wa.me/17868704262` (numero del coach) con un mensaje prellenado. EXCEPCION: el WhatsApp de un LEAD en el admin abre `whatsappTo(lead.phone, mensaje)` -> el numero del propio LEAD (mensaje "Hola {lead}, soy {coach}, tu coach fitness..."); si el lead no tiene telefono valido el boton se muestra deshabilitado ("Sin teléfono"). Para cambiar el numero/datos del coach solo se edita ese archivo.
- Panel del coach profesional (en `main` desde v1.4): `/admin` tiene un PANEL EJECUTIVO con 10 metricas derivadas (total alumnos, activos, vencidos, pausados, renuevan esta semana, sin programa, sin nutricion, sin evaluacion, leads pendientes, ingresos estimados = activos x `monthlyPrice`) via `adminDashboardService.getExecutiveStats`. La tabla de alumnos tiene BUSCADOR (nombre/email; el email se resuelve del usuario enlazado) y FILTROS (Todos, Activos, Vencidos, Pausados, Sin programa, Sin nutricion, Sin evaluacion, Renovacion proxima) calculados con banderas derivadas en `getClientRows` (`hasProgram`/`hasNutrition`/`hasEvaluation`/`renewSoon` + `email`). Acciones rapidas por fila: Perfil, Editar, Entrenamiento (asigna programa real), Nutricion (asigna plan real), WhatsApp, Renovar (30 dias, metodo Efectivo), Pausar, Eliminar. Leads: buscador (nombre/email/telefono), Ficha, Editar (`leadService.updateLead`), WhatsApp, Convertir y Eliminar (`leadService.deleteLead`). Nuevos metodos: `userRepository.getUsers`, `leadRepository.updateLead/deleteLead`. Los editores legacy (acceso detallado, asignacion ProgramRow, progreso basico) siguen en el codigo (`EditorCard`) pero ya no tienen boton en la fila. Sin Supabase ni backend; no se toco landing ni onboarding.
- Modulo de nutricion (planes reales, en `main` desde v1.2): el coach crea/edita/elimina planes nutricionales en `/admin` con macros objetivo diario (calorias, proteinas, carbohidratos, grasas), agua recomendada, notas y dias con comidas (nombre + alimentos); los asigna a un alumno. En `/dashboard` el alumno ve su plan asignado: macros diarios, agua recomendada, "comidas de hoy" (primer dia con comidas pendientes) y todos los dias, con checklist para marcar comidas completadas (persistido). Capas espejo del modulo de entrenamiento: tipos `NutritionPlan`/`NutritionPlanDay`/`NutritionPlanMeal`/`AssignedNutrition` (`src/types`), `nutritionService` -> `nutritionPlanRepository` (`Local*`) -> `localStorage`; seed en `src/data/nutrition.ts` (plan "Recomposicion 2200 kcal" asignado a `c-demo`). Claves nuevas en `STORAGE_KEYS`: `nutritionPlans`, `nutritionAssignments` (clientId -> planId), `nutritionProgress` (clientId -> ids de comidas completadas). El alumno se resuelve por `userId` (`getAssignedForUser`/`toggleMealForUser`). Es INDEPENDIENTE de la seccion demo "Nutricion" del dashboard premium (`NutritionMeal`/`NutritionState`), que sigue intacta. UI: `nutrition-plans.tsx` (admin) y `nutrition-plan-view.tsx` (alumno); no se toco landing ni onboarding.
- Biblioteca de ejercicios (catalogo profesional, en `main` desde v1.1): coleccion independiente de ejercicios con ficha completa (nombre, grupo muscular, musculos secundarios, imagen, gif, video YouTube, equipo, dificultad, descripcion, tecnica correcta, errores comunes, consejos del coach, variantes, sustituciones, tiempo y descanso recomendados). CRUD completo en `/admin` (`exerciseLibraryService` -> `exerciseLibraryRepository` -> `localStorage`, clave `exercise-library`; seed `src/data/exercise-library.ts`). Al armar un programa, el coach NO escribe ejercicios: los ELIGE de la biblioteca (el dia guarda `exerciseId` + prescripcion `sets`/`reps`/`rest`/`notes` y el `name` denormalizado). El alumno, al abrir un ejercicio, ve su ficha completa (imagen/gif grande, boton "Ver demostracion" si hay video, tecnica, errores, consejos, equipo, musculos) y un CHECKLIST POR SERIES (Serie 1..N segun `sets`); al marcar todas: "Ejercicio completado". El progreso por serie se persiste por cliente (clave `exercise-progress`, `clientId -> exerciseInstanceId -> indices`); el progreso por dia sigue en `workout-progress`. `AssignedTraining` incluye `seriesProgress`. Si un ejercicio del programa no tiene `exerciseId` (o se borro de la biblioteca), se muestra solo el nombre + prescripcion sin ficha. Para imagenes/gifs de URL arbitraria se usa `<img>` con fallback `onError` (no `next/image`, para no requerir dominios en config). Sin backend ni Supabase; no se toco landing ni onboarding.
- Modulo de programas de entrenamiento (builder real, en `main` desde v1.0): el coach crea/edita/elimina programas en `/admin` con dias y ejercicios (series, repeticiones, descanso, notas, nivel, duracion, objetivo) y los asigna a un alumno; el alumno ve en `/dashboard` su programa asignado con la "rutina de hoy", todos los dias, sus ejercicios y un boton "Marcar entrenamiento completado" que persiste el progreso. Capas: tipos `TrainingProgram`/`TrainingDay`/`TrainingExercise`/`AssignedTraining` (`src/types`), `trainingService` -> `trainingProgramRepository` (`Local*`) -> `localStorage`; seed en `src/data/training.ts` (programa "Hipertrofia 3 días" asignado a `c-demo`). Claves nuevas en `STORAGE_KEYS`: `trainingPrograms`, `programAssignments` (clientId -> programId), `workoutProgress` (clientId -> ids de dias completados). El alumno se resuelve por `userId` (`getAssignedForUser`/`toggleDayForUser`). "Rutina de hoy" = primer dia no completado (si todos hechos, el primero). Este modulo es INDEPENDIENTE de la lista simple "Programas" (`ProgramRow`) que sigue intacta. Sin backend, sin Supabase. UI: `training-programs.tsx` (admin) y `training-program-view.tsx` (alumno); no se toco landing ni onboarding.
- No usar nombre real ni logo real por ahora. Mantener textos genericos como "Coach Fitness" y "Fitness Coaching".
- Los textos demo de resultados (Antes y Despues), programas y testimonios estan humanizados para parecer casos reales de coaching (nombres anonimos tipo "Carlos R.", objetivos, detalles y citas naturales). No representan identidades reales y no se usan fotos reales. Viven en `src/data` (`transformations.ts`, `programs.ts`, `testimonials.ts`), nunca hardcodeados en componentes.
- La seccion Antes y Despues quedo preparada para usar imagenes profesionales de transformaciones. Las rutas viven en `src/data/transformations.ts` (`beforeImage`/`afterImage`) y apuntan a `/public/images/transformations/` (`carlos-before.webp`, `carlos-after.webp`, `mariana-*`, `andres-*`). Si el archivo aun no existe, `TransformationImage` (`src/components/transformation-image.tsx`) muestra un placeholder elegante via `onError` sin romper el diseno. Ver `public/images/transformations/README.md` para nombres y prompts. Imagenes ficticias y realistas: sin personas famosas ni fotos de clientes reales.
- Persistencia local real con `localStorage` (sin backend ni Supabase). Se persisten: usuarios registrados, clientes/alumnos, leads, programas del panel y progreso basico del cliente. Las claves viven en `STORAGE_KEYS` (`src/lib/local-store.ts`).
- Registrar un alumno crea su usuario y tambien un cliente enlazado por `userId`; por eso aparece de inmediato en el panel admin y ve su propio progreso. Los totales del admin (clientes, leads, programas) se derivan contando las colecciones, asi se actualizan solos.
- Modelo de datos: el cliente/alumno (`Client`) tiene `id`, `userId` opcional, campos de acceso (`accessStatus`, `accessExpiresAt`, `lastPaymentDate`, `paymentMethod`) y una `evaluation` opcional (la evaluacion inicial del onboarding). El progreso (`ClientProgress`) se indexa por id de cliente; el dashboard del alumno resuelve su cliente por `userId` y lee ese progreso. La tabla del admin une cliente + progreso (programa y % derivados).
- Gestion desde `/admin` (todo persistido en `localStorage` via servicios -> repositorios): CRUD completo de alumnos — crear cliente, editar cliente (nombre/estado), ELIMINAR cliente (con confirmacion) ademas de crear programa, asignar programa a un alumno y editar su progreso basico. Las tablas se recargan tras cada cambio. Eliminar un alumno borra en cascada su cliente y todos sus datos asociados (progreso, fotos y checklists) PERO no toca las cuentas de usuario/login (no se rompen los usuarios demo). Metodos nuevos en la capa de datos: `clientRepository.deleteClient`, `progressRepository.removeForClient`, `coachingRepository.removeClient`; orquestados por `adminDashboardService.deleteClient`. UI: boton "Eliminar" (rojo) por fila + tarjeta de confirmacion (`DeleteClientForm`).
- Gestion de leads (sin WhatsApp ni backend): se crean leads en `localStorage` via `leadService`. En `/admin` el dueno ve los leads, abre su ficha (detalle + evaluacion), cambia su estado (`Nuevo` / `Contactado` / `Convertido` / `Descartado`) y puede convertir un lead en alumno (crea el `Client` y marca el lead como `Convertido`). El alumno convertido entra con acceso `Vencido` por defecto.
- Captacion en la landing: la seccion `#agenda` es el onboarding inteligente (wizard de 12 pasos, `src/components/onboarding-wizard.tsx`; el paso 12 es la pantalla de prediccion). El hero "Agendar llamada" hace scroll a `#agenda`. Tambien existe `/agendar`, un formulario simple alternativo (source `Landing`) que sigue funcionando. NO modificar otras secciones de la landing al tocar el onboarding.
- Onboarding inteligente (evaluacion inicial, sin IA): wizard de 11 pasos (paso 1: nombre, email, telefono, edad, sexo; luego estado actual, tipo de cuerpo con tarjetas, objetivo con tarjetas, experiencia, disponibilidad, habitos; pasos 8-10: formulario de salud y alimentacion; paso 11: resumen). Barra de progreso, botones Anterior/Siguiente, animacion suave (`.onboarding-step` en globals.css), responsive. La recomendacion de plan usa reglas simples por objetivo (`PLAN_BY_OBJECTIVE` en `src/data/onboarding.ts`): perder grasa/recomposicion -> Transformacion 12 Semanas; ganar musculo/rendimiento -> Coaching Performance; tonificar/condicion fisica -> Base Fitness. Las ilustraciones son SVG vectoriales propias (estilo neon consistente) en `/public/images/onboarding/` en cuatro series: `body-types/`, `goals/`, `levels/` y `places/` (con fallback de silueta/icono via `onError`). Los pasos de tipo de cuerpo, objetivo, nivel y lugar usan tarjetas con ilustracion (`SelectCard` + `CardMedia`); las opciones con imagen viven en `src/data/onboarding.ts` (`BODY_TYPES`, `OBJECTIVES`, `LEVEL_OPTIONS`, `PLACE_OPTIONS`). Para servir SVG locales via `next/image` se habilito `images.dangerouslyAllowSVG` en `next.config.ts` (solo ilustraciones propias). La `evaluation` guarda: objetivo, edad, sexo, peso, altura, cintura, tipo corporal, nivel, lugar, disponibilidad, sueno, alimentacion y plan recomendado.
- Copys del onboarding (voz de coach, no genericos): cada paso tiene eyebrow ("Paso X de 11"), titulo atractivo y subtitulo humano via `StepHeader` (acepta `subtitle`). El paso 11 es un "diagnostico" profesional: resumen con icono por campo (Objetivo, Nivel, Tipo corporal, Peso, Estatura, Lugar, Dias disponibles, Frecuencia semanal) + tarjeta premium con el plan recomendado (duracion y frecuencia) y el mensaje "Basandonos en tu evaluacion creemos que este plan tiene el mayor potencial para ayudarte a conseguir tus objetivos." Microanimaciones: hover/seleccion de tarjetas (lift + glow + pop de la ilustracion), transicion entre pasos (`.onboarding-step`) y barra de progreso animada. Solo visual/contenido: no cambia flujo, servicios, repositorios ni el valor guardado (nivel/lugar siguen guardando su `label`).
- Formulario de salud y alimentacion (pasos 8-10 del wizard, basado en el formulario del cliente): se AGREGAN preguntas SIN quitar las anteriores. Paso 8 "Datos y antecedentes": direccion + antecedentes (hipertension, hepatitis, cirugias previas, asmatico, otra condicion). Pasos 9-10 "Alimentacion": consumo de azucar y habitos, refrescos, alcohol, pollo, carne roja, cerdo, alimentos del mar (Pescados/Mariscos/Ambos/Ninguno), lacteos (Si/No/Intolerante a la lactosa), frutas, vegetales, arroz (Si/No/Integral), viveres, tipo de pan (Blanco/Integral/Ambos/Ninguno), pastas, condimentos artificiales, alergias alimentarias y alimento que prefiere evitar. Estos pasos son OPCIONALES (se puede continuar sin llenarlos). Opciones en `src/data/onboarding.ts` (`YES_NO`, `SEAFOOD_OPTIONS`, `DAIRY_OPTIONS`, `RICE_OPTIONS`, `BREAD_OPTIONS`); campos opcionales en `LeadEvaluation` (`src/types`). Toda la informacion se guarda dentro de la misma `evaluation` del lead y del alumno (sin cambios en servicios ni repositorios: el objeto fluye completo por el pipeline existente).
- Onboarding -> registro -> perfil del alumno: al pulsar "Quiero comenzar" el wizard guarda el `Lead` (source `Evaluación`), guarda un `PendingOnboarding` (`{ name, email, evaluation }`) como pendiente (`pendingEvaluationRepository`, clave `coach-fitness:pending-evaluation`) y redirige a `/register`. En `/register`, si hay pendiente se prellenan nombre y email y se muestra un aviso ("Tu evaluación inicial está lista. Crea tu cuenta para guardar tu progreso."). Al registrarse, `authService.register` lee el pendiente, guarda la `evaluation` en el `Client` creado y la limpia. En `/login`, si hay pendiente se limpia automaticamente (para no adjuntarla a una cuenta equivocada). El alumno ve su evaluacion en `/dashboard` (seccion "Mi evaluacion inicial") y el coach en la ficha del alumno (y del lead) en `/admin`. Componente compartido: `src/components/evaluation-details.tsx`, que agrupa la evaluacion en bloques (Datos personales, Antecedentes, Alimentacion) y solo muestra los campos con valor (las evaluaciones antiguas sin las preguntas de salud no muestran casillas vacias). Al convertir un lead con evaluacion, esta tambien se copia al alumno.
- Control de acceso mensual manual (sin pagos reales todavia): cada alumno tiene `accessStatus` (`Activo` | `Vencido` | `Pausado`). Desde `/admin` el coach puede renovar 30 dias (registrando metodo de pago: PayPal, Zelle, Western Union, Efectivo, Transferencia), pausar o marcar vencido; ve estado y fecha de vencimiento por alumno. La tabla del admin muestra el estado de acceso y la fecha. El alumno recien creado/registrado arranca `Vencido` hasta que el coach lo renueva. En `/dashboard`, si el acceso esta `Activo` el alumno ve el aviso elegante (`AccessNotice`, verde) y el dashboard completo. Si esta `Vencido` o `Pausado`, el dashboard se BLOQUEA: se condiciona el renderizado (no se elimina nada) y solo se muestra `LockedDashboard`, ocultando TODOS los modulos premium (estadisticas, progreso, evaluacion, nutricion, tareas, calendario, chat, fotos, graficos). El gating se calcula con `access.accessStatus !== "Activo"` y espera a que el acceso cargue (`accessLoaded`) para no parpadear. Pantalla de bloqueo (mejorada): el header solo muestra el logo y "Salir" (sin enlaces Cliente/Admin) via `minimalNav` en `DashboardShell`; el saludo es "Hola, {nombre real}" y si no hay nombre (o es el placeholder "Cliente") solo "Hola" — nunca "Hola, Cliente". La tarjeta tiene tres variantes por estado (Activo verde / Pausado amarillo / Vencido rojo, `LOCKED_CONFIG`): icono, titulo ("Tu acceso ha vencido" / "Tu acceso está en pausa"), subtitulo "Tu plan se encuentra temporalmente desactivado.", badge (`AccessBadge`), fecha si existe ("Venció el …" / "Vigente hasta el …"), mensaje y dos botones visuales sin funcion todavia: "RENOVAR ACCESO" (verde) y "CONTACTAR COACH" (secundario) con nota de "se habilitaran proximamente". Operaciones en `dashboardService` (`renewAccess`, `pauseAccess`, `markExpired`, `getAccessForUser`); badge compartido en `src/components/access-badge.tsx`. Solo afecta la vista del alumno: no se toco onboarding, landing, admin, repositorios ni servicios.
- IDs locales: no deben depender solo de `Date.now()`. Para clientes y usuarios locales se usa `Date.now()` + sufijo aleatorio, para evitar colisiones por doble clic o creaciones rapidas. Al migrar a Supabase, los IDs deberan ser UUID generados por la base de datos / Auth.
- Autenticacion simulada con Context API (sin JWT ni sesiones reales). La sesion se guarda en `localStorage` (`coach-fitness:auth-user`). Usuarios demo: `admin@coach.com` / `123456` y `cliente@coach.com` / `123456`.
- Migracion futura a base de datos / Supabase: implementar las interfaces de `src/repositories` con nuevas clases y cambiar el cableado en `src/repositories/index.ts`, sin tocar UI ni servicios.
- Dashboard premium del alumno (en `main` desde v0.4): se AGREGAN 18 secciones tipo Trainerize/TrueCoach sin romper lo existente (acceso, programa, tareas, "Mi evaluacion inicial" siguen intactos). Secciones: galería de progreso "Mi transformación" (timeline + alta de registros), gráficas de progreso (peso/cintura/grasa/musculo, SVG), objetivos de la semana, calendario de entrenamiento, medidas corporales, cumplimiento general, logros, progreso hacia la meta, historial, rutina del día, nutrición, chat con el coach (demo), recursos, recordatorios, comparador antes/después (slider), métricas corporales calculadas (IMC, peso ideal, calorias Mifflin-St Jeor, agua, macros), barra principal de transformación y próximo check-in. Arquitectura: `coachingService` (compone seed `src/data/coaching.ts` + persistidos) y `metricsService` (formulas reales); persistencia via `LocalCoachingRepository` (fotos y checklists por id de cliente, claves `coach-fitness:progress-photos` y `coach-fitness:checklists`). Lo interactivo (objetivos, nutricion, recordatorios, fotos) persiste en localStorage; el resto son datos demo preparados para Supabase. Imagenes demo vacias por defecto (placeholder elegante via `onError`).
- Dashboard premium del alumno — secciones FUNCIONALES (en `main` desde v1.3): todas las secciones visibles son interactivas y persisten en `localStorage`, manteniendo la arquitectura UI -> services -> repositories. Objetivos de la semana, recordatorios y "Plan alimenticio" (demo) usan `coachingService.toggleCheck` (clave `checklists`). Calendario de entrenamiento: cada dia es un boton que cicla pendiente -> entrenado -> 100% -> pendiente, persistido por fecha (`checklists` listas `calendar-trained`/`calendar-full`). Rutina del dia: "Iniciar entrenamiento" -> "En progreso" -> "Marcar como completado" (+ "Reiniciar"), persistido (`checklists` lista `routine`: `started`/`completed`). Chat con el coach: los mensajes del alumno se persisten por cliente (`coachingRepository.getChat/addChatMessage`, clave `coach-fitness:chat`, sembrado con `chatDemo` para `c-demo`) y se envian con `coachingService.addChatMessage`. Recursos: al hacer clic se abre un panel de detalle (sin descarga real todavia). Comparador Antes/Despues: usa las fotos de progreso del alumno (si hay >=2 muestra selectores de fecha para elegir antes/despues); si no hay, mantiene el placeholder. Logros e Historial se DERIVAN de acciones reales en `coachingService.getDashboard` (no son seed): logros segun entrenamientos completados (`workout-progress`), kg perdidos (progreso) y % de meta; historial segun evaluacion, asignaciones de programa/plan, entrenamientos y comidas completadas, fotos agregadas y logros desbloqueados. Las graficas siguen usando datos demo (`metricSeries`) como fallback, con la arquitectura lista para series reales. El header del dashboard del alumno es minimo (logo + nombre real + "Salir", sin enlaces Cliente/Admin) via `minimalNav` + `navName` en `DashboardShell`; el admin no cambia.
- DECISION de ramas: el onboarding y el dashboard premium se integraron juntos en `main` en v0.4 (el dashboard depende de los datos del onboarding). Las nuevas funcionalidades del dashboard ya pueden ramificar desde `main`, que contiene ambas. Mantener la regla de evitar ramas paralelas que toquen `dashboard/page.tsx` a la vez.
- No implementar todavia: Supabase, pagos, IA, WhatsApp/Instagram/Facebook Messenger, CRM avanzado, nutricion avanzada, videos avanzados ni automatizaciones. Se agregan en etapas futuras.
- Footer obligatorio con credito: "Desarrollado por Michael Perez" y enlaces a portafolio (https://djmaykiss.github.io/Minuevocurriculum/), sitio web (https://markingwebs.com/) y GitHub (https://github.com/Djmaykiss). Se muestra en todas las paginas: footer completo en la landing y `MiniFooter` (compacto) en login, registro y dashboards.
- La sesion mock se cierra con el boton "Salir" del header de los dashboards (`src/components/logout-button.tsx`).
- El saludo de ambos dashboards usa el nombre real del usuario autenticado (`Bienvenido, ${user.firstName}` desde `useAuth`); nunca se hardcodea el nombre en el componente.
- Copys del login: titulo "Bienvenido a tu nueva version.", subtitulo orientado al cliente, formulario "Accede a tu espacio" y boton "Continuar".
- WhatsApp aun no esta conectado: el dashboard del cliente muestra un boton "Contacto pendiente" deshabilitado con la nota "El numero del coach se agregara despues". No usar numeros falsos ni `wa.me` vacio.
- Sin enlaces vacios: no usar `href="#"`, `href=""` ni `wa.me` sin numero. Para rutas internas usar siempre `<Link>` de `next/link`.
- Tema visual: negro, gris oscuro, verde neon, cards premium con glassmorphism ligero, bordes redondeados y transiciones suaves.
- Sistema visual (utilidades en `src/app/globals.css`, reutilizar antes de crear estilos nuevos): `.premium-card` (glassmorphism + sombra en capas + highlight interno; base de TODAS las tarjetas de landing, dashboard, admin, auth y wizard), `.card-hover` (opt-in: lift + glow neon al pasar el cursor, para tarjetas interactivas), `.reveal-up` + `.reveal-delay-1/2/3` (entrada suave sin JS, usada en el hero y formularios), `.neon-ring` (resplandor neon para CTA y wizard), `.gym-hero`/`.hero-grid`/`.trainer-card` (fondos). Detalles globales: `body::before` (halo radial sutil de fondo), `:focus-visible` neon, scrollbar a tono, `prefers-reduced-motion` respetado. Botones primarios = gradiente `from-[#85ff73] to-[#65ff4f]` + lift en hover + `active:scale-[0.98]` (patron unificado en `ButtonLink`, auth, wizard y `primaryBtn` del admin). Inputs = focus con borde neon + halo `shadow-[0_0_0_3px_rgba(101,255,79,0.12)]`. Mantener SIEMPRE la paleta actual (negro/blanco/gris/verde neon); el pulido visual no agrega funciones ni toca logica/localStorage.
- Textos de cara al usuario: redactados para el cliente final. No exponer terminos tecnicos internos (MVP, mock, backend, leads) en la UI.

## Reglas de desarrollo
- No borrar archivos importantes existentes sin indicacion explicita.
- Despues de cada modificacion, abrir o recargar la pagina para verificarla. Revisar siempre en desktop y en movil (responsive).
- Ejecutar `npm run lint` y `npm run build` antes de entregar cambios finales.
- Mantener componentes separados, responsivos y preparados para crecer.

## Infraestructura de desarrollo (servidor Next)
- `npm run dev` ejecuta automaticamente `predev` (`scripts/free-port.mjs`) ANTES de arrancar: libera el puerto 3000 y mata procesos `next dev`/`next-server` huerfanos, garantizando un unico servidor Next. Resuelve el problema recurrente de procesos huerfanos que dejaban el 3000 ocupado y hacian saltar el dev a otro puerto. El script es cross-platform (Windows/macOS/Linux), sin dependencias y best-effort (cualquier error se ignora; nunca impide el arranque) y NO toca la app.
- `npm run clean:port` ejecuta la misma limpieza manualmente (acepta un puerto opcional: `node scripts/free-port.mjs 3001`).
- `.claude/launch.json` mantiene `port: 3000` + `autoPort: true`: normalmente arranca en 3000 (porque `predev` lo deja libre) y, si por algo 3000 estuviera ocupado por un proceso ajeno, Claude Preview cae a otro puerto y lo MUESTRA claramente. Next dev tambien anuncia el puerto si cambia.
- Si el build falla con `EPERM ... unlink '.next\\...'` (lock de Windows/OneDrive), borrar `.next` (`rm -rf .next`) y reconstruir.

## Flujo de trabajo y mantenimiento (OBLIGATORIO en cada tarea importante)
Estas reglas son permanentes; aplicarlas automaticamente sin que el usuario las recuerde.

0. FILOSOFIA PERMANENTE (ver seccion "FILOSOFIA DEL PRODUCTO" arriba): el coach administra TODO el contenido; el alumno solo consume. Antes de construir cualquier funcionalidad de contenido, disenar PRIMERO como lo administra el coach (CRUD + publicar/despublicar + asignar) via UI -> Service -> Repository -> Storage. Nada de contenido fijo; los seeds son temporales.
1. Antes de empezar una funcionalidad, leer `CLAUDE.md` y `CHANGELOG.md` para entender el estado actual del proyecto.
2. Registrar SIEMPRE en `CLAUDE.md` (y en `CHANGELOG.md` si corresponde) toda nueva regla de arquitectura, decision tecnica, convencion, modulo, cambio importante de flujo o version. El objetivo es poder retomar el proyecto meses despues sin perder contexto.
3. Si una nueva implementacion contradice reglas o decisiones existentes, NOTIFICARLO al usuario antes de modificar el codigo.
4. Nunca eliminar funcionalidades existentes sin autorizacion explicita.
5. Antes de dar una tarea por terminada: ejecutar `npm run lint` y `npm run build`, y verificar (preview en vivo) que la app sigue funcionando, en desktop y movil. Verificar tambien antes de commit/push.
6. Al terminar una funcionalidad, indicar si conviene: dejarla en rama de feature, hacer merge a `main`, crear una nueva version (v0.x) y/o crear un tag de Git. Si queda estable y completa, indicarlo explicitamente.
7. Al finalizar, indicar si hay documentacion adicional que deba actualizarse (p. ej. `README.md`, READMEs de carpetas).
8. Proponer mejoras de arquitectura que no rompan compatibilidad, al finalizar la tarea (sin aplicarlas sin autorizacion).
9. Versionado: trabajar en ramas `feature/*` (nunca directo en `main`); merge a `main` solo tras lint+build+pruebas; cada version estable se documenta en `CLAUDE.md` + `CHANGELOG.md` y se etiqueta con `git tag -a vX.Y`.
10. MIGRACION A SUPABASE (REGLA PERMANENTE): `DATABASE_MASTER_PLAN.md` es la fuente de verdad del MODELO/esquema de BD y sus fases; `APP_MIGRATION_PLAN.md` es la fuente de verdad de la MIGRACION DE LA APP (localStorage -> Supabase). Toda migracion de datos/repositorios sigue OBLIGATORIAMENTE el orden, las dependencias, el checklist por repositorio, la estrategia de rollback, la estrategia de pruebas y los criterios de "bloque terminado" definidos en `APP_MIGRATION_PLAN.md`. Reglas duras: (a) no migrar un repositorio sin su fase de BD aplicada y verificada; (b) los `Supabase*Repository` cumplen las MISMAS interfaces de `src/repositories/types.ts` — NO se toca UI ni services (unica excepcion: el interior de `auth-context` en el bloque de Auth); (c) se mantiene el flag `NEXT_PUBLIC_DATA_BACKEND=local|supabase` y los `Local*` NO se eliminan durante la migracion (rollback por flag); (d) ningun `DROP`/`DELETE` de datos sin backup + confirmacion explicita; (e) cada bloque cierra con lint + build + pruebas de paridad + consola limpia + responsive, y se documenta cualquier decision nueva en `CLAUDE.md`. Antes de tocar codigo de migracion, releer ambos planes.
11. MIGRACION — NO DEJAR REPOS A MEDIAS (REGLA PERMANENTE): nunca dejar un repositorio parcialmente migrado. Cuando se empieza un `Supabase*Repository` debe implementarse al 100% (todas las firmas de su interfaz), probarse y verificarse (integracion + paridad) ANTES de continuar con otro repositorio. Prohibido spread de medias-implementaciones.
12. MIGRACION — REPORTE DE CIERRE POR BLOQUE (REGLA PERMANENTE): al finalizar cada bloque, entregar una tabla con: Repositorio | Total de metodos | Metodos implementados | Estado (✅ Completado / ⚠️ Pendiente).
13. MIGRACION — UNA SOLA FUENTE DE DATOS POR ENTIDAD (REGLA PERMANENTE): nunca mezclar una misma entidad entre localStorage y Supabase. Cada repositorio tiene UNA unica fuente de datos activa segun el feature flag (`Local*` o `Supabase*`, nunca ambas a la vez para la misma entidad).

## Migracion a Supabase (DISEÑO DEFINITIVO v2 — sin ejecutar aun, pendiente de aprobacion)
Estado: DISEÑO. No se ha creado ninguna tabla ni tocado codigo; v1.5 sigue 100% en
`localStorage`. Esquema DEFINITIVO pensado para crecer años sin rehacer la base. La
migracion NO reescribe UI ni servicios: se implementan `Supabase*Repository` que cumplen
las MISMAS interfaces de `src/repositories/types.ts` y se cambia el cableado en
`src/repositories/index.ts` por repositorio, con flag
`NEXT_PUBLIC_DATA_BACKEND=local|supabase` (modo hibrido/reversible).

Decisiones base (definitivas):
- MULTI-TENANT real: raiz `organizations`. TODO lleva `organization_id`. Un usuario se
  vincula a orgs via `memberships` (profile-organization-role), soportando cientos de
  orgs y roles distintos por org.
- Identidad en 4 capas: `auth.users` (Supabase Auth) -> `profiles` (identidad global
  1:1) -> `memberships` (rol en una org) -> `coaches` (perfil PROFESIONAL). La MARCA/
  white-label (nombre, logo, colores, legales, contacto) vive en `organizations`; la
  info profesional del coach (bio, especialidades, certificaciones) en `coaches`.
- Roles en `memberships.role`: owner | admin | coach | client.
- IDs `uuid`; columnas comunes en toda tabla: `id`, `organization_id`, `created_at`,
  `updated_at` (trigger), `created_by`, y `deleted_at` (SOFT DELETE) en el contenido.
- Enums como `text` + `CHECK` (extensibles sin migracion dura). Campos flexibles en
  `jsonb`; lo que se filtra/ordena queda como columna.
- MULTIMEDIA generico: `media_assets` (recurso: kind image/gif/video/pdf/file/link,
  bucket+path o url, mime, size) + puentes con FK real por dominio (`exercise_media`, a
  futuro `nutrition_media`/`discover_media`). Reemplaza el campo `video` unico y las
  columnas image/gif por-entidad; soporta multiples recursos.
- ASIGNACIONES genericas: una sola `student_assignments` (client + `resource_type` +
  `resource_id` + status) reemplaza `program_assignments`/`nutrition_assignments` y sirve
  para programas, nutricion, cursos, retos, documentos, rutinas, ejercicios, etc. El
  "programa actual" = assignment activo con `resource_type='training_program'`.
- TAXONOMIA: `exercise_categories`/`nutrition_categories`/`program_categories`
  (jerarquicas via `parent_id`) + `tags` global + puentes `exercise_tags`/`program_tags`.
- CHAT escalable: `conversations` + `conversation_members` (con `last_read_at`) +
  `messages` (reemplaza la unica `chat_messages`).
- NOTIFICACIONES: tabla real `notifications` (recipient, type, priority, entity, read_at,
  `dedupe_key` unico) que la app upsertea desde su derivacion actual; leido = `read_at`.
- AUDITORIA: `audit_logs` (actor, tabla, accion, before/after jsonb, ip, user_agent,
  fecha) por TRIGGER generico `SECURITY DEFINER` en tablas clave, desde la fase 1.
- FUTURO (tablas creadas desde ya, aunque inicien vacias): `appointments`; pagos
  `plans`/`subscriptions`/`payments`; `reports`.
- NO migran: `pending-evaluation` (pre-auth, transitorio, queda en localStorage) ni el
  contenido `Mock*` de marketing (estatico).

Inventario de tablas (por dominio):
- Tenant/identidad: `organizations`, `profiles`, `memberships`, `coaches`.
- Taxonomia/media: `exercise_categories`, `nutrition_categories`, `program_categories`,
  `tags`, `exercise_tags`, `program_tags`, `media_assets`, `exercise_media`.
- Catalogo del coach: `library_exercises`, `training_programs`, `training_days`,
  `training_exercises`, `nutrition_plans`, `nutrition_days`, `nutrition_meals`,
  `discover_routines`, `discover_categories`, `discover_articles`, `onboarding_messages`,
  `onboarding_rewards`, `onboarding_predictions`.
- Alumnos/CRM: `clients`, `leads`, `evaluations`, `client_progress`, `crm_records`,
  `crm_history`, `student_assignments`.
- Actividad del alumno: `workout_results`, `workout_day_progress`,
  `exercise_series_progress`, `nutrition_meal_progress`, `client_checklists`,
  `progress_photos`.
- Chat: `conversations`, `conversation_members`, `messages`.
- Notificaciones: `notifications`.
- Negocio/futuro: `appointments`, `plans`, `subscriptions`, `payments`, `reports`.
- Transversal: `audit_logs`.
- Deprecada (no se crea): `program_rows` (la reemplaza `training_programs` + vista).

Buckets de Storage (path `{organization_id}/{entidad}/{id}/{archivo}`):
- Publicos (lectura): `logos`, `discover-images`, `exercise-images`, `exercise-gifs`,
  `nutrition-images`.
- Privados (RLS por org/usuario): `avatars`, `progress-photos`, `documents`,
  `exercise-videos` (solo si se suben; YouTube queda como URL), `message-attachments`,
  `report-files`.

Flujo de autenticacion: Supabase Auth (email/clave). Trigger `on auth.users insert` crea
`profiles`. El owner crea su `organization` + membership owner; invita coaches (membership
coach); el alumno entra por onboarding (lead->convert) que crea `auth.users` + `clients`
+ membership client. `useAuth()` mantiene su API; solo cambia su interior. El onboarding
anonimo escribe el lead via RPC `SECURITY DEFINER` (sin INSERT abierto). Org y rol se
resuelven por `memberships`.

Estrategia RLS (definitiva): `ENABLE`+`FORCE` en todas las tablas. Helpers
`SECURITY DEFINER STABLE`: `current_org_ids()`, `has_org_role(org, roles[])`,
`is_org_staff(org)` (owner/admin/coach), `my_client_id(org)`. Patron: (a) staff -> CRUD
donde `organization_id` esta en `current_org_ids()`; (b) alumno -> SELECT de su `clients`,
de sus recursos asignados (via `student_assignments`) y del contenido `published` de su
org; INSERT/UPDATE solo de SU actividad donde `client_id = my_client_id()`; (c) anonimo ->
nada directo, solo RPC de captura de lead y lectura de publicado via RPC/servidor.
`audit_logs`/`payments` solo lectura de staff y escritura por trigger o service-role.
Storage: politicas por prefijo `{org}/…`; el alumno solo su carpeta.

Orden seguro de implementacion (cada fase con lint+build+pruebas y su repo swap):
0) Extensiones (pgcrypto), helpers RLS, trigger `updated_at`, trigger generico de audit.
1) Tenant+identidad (`organizations`,`profiles`,`memberships`,`coaches`) + Auth trigger +
   RLS base + buckets/politicas de Storage.
2) Taxonomia+media (`*_categories`,`tags`,`*_tags`,`media_assets`).
3) Catalogo del coach (`library_exercises`+`exercise_media`, `discover_*`, `onboarding_*`).
4) Leads+`evaluations` (RPC anonima).
5) `clients`+`client_progress`+`student_assignments`.
6) Entrenamiento (`training_programs`->dias->ejercicios).
7) Nutricion (`nutrition_plans`->dias->comidas).
8) Actividad del alumno (`workout_results`,`*_progress`,`client_checklists`,`progress_photos`).
9) Chat (`conversations`,`conversation_members`,`messages`).
10) CRM (`crm_records`+`crm_history`).
11) `notifications`.
12) Pagos (`plans`,`subscriptions`,`payments`).
13) `appointments`.  14) `reports`.  15) Swap final y retiro del flag `local`.

Implementacion Fase 0 y Fase 1 (HECHA — SQL generado, NO ejecutado contra ninguna BD):
- Fuente de verdad del modelo: `DATABASE_MASTER_PLAN.md` (raiz). El SQL vive en
  `supabase/migrations/*.sql` con `supabase/README.md` (orden + anotaciones). Rama
  `feature/supabase-migration` (sin merge/push).
- Archivos (todos idempotentes, sin `DROP`/`DELETE` de datos, solo estructura,
  CONSERVAR): `0000_phase0_infra.sql` (pgcrypto, `set_updated_at`, `audit_logs`+RLS
  bloqueada, `audit_trigger` generico); `0001_phase1_identity_tables.sql`
  (`organizations`,`profiles`,`memberships`,`coaches` + indices + triggers updated_at
  y auditoria); `0002_phase1_functions.sql` (helpers `current_org_ids`/`has_org_role`/
  `is_org_staff`, trigger `handle_new_user`, RPC `create_organization`);
  `0003_phase1_rls_policies.sql`; `0004_phase1_storage.sql` (11 buckets + politicas).
- Decisiones tecnicas nuevas registradas en la implementacion:
  (a) Los helpers RLS que dependen de `memberships` se crean en Fase 1, no en Fase 0
  (dependencia de tabla). (b) `my_client_id()` y la ESCRITURA de `progress-photos` por
  el propio alumno se difieren a Fase 5 (necesitan `clients`); en Fase 1 esos buckets
  son solo-staff. (c) `avatars` usa convencion de path `{profile_id}/…` (excepcion a la
  convencion general `{organization_id}/…`), porque el avatar es del usuario. (d) La
  creacion de org y el membership owner se hacen atomicamente via RPC
  `create_organization` (SECURITY DEFINER), evitando politicas de INSERT abiertas;
  `revoke execute … from public` + `grant … to authenticated`. (e) El `audit_trigger`
  intenta leer `ip`/`user_agent` de `request.headers` en modo best-effort (nunca rompe
  la escritura si no estan). (f) DELETE bloqueado por RLS en `organizations`/`coaches`
  (se usa soft delete `deleted_at`). (g) Verificacion: sin Postgres local, la sintaxis
  se valido de forma estatica (bloques `$$` balanceados, sin sentencias de datos
  peligrosas); `supabase db lint` requiere DB local (Docker) no disponible; la
  validacion en runtime la hace Supabase al ejecutar los scripts.

Politica de anotacion de cada SQL (al entregar el script): por bloque (1) MODIFICA DATOS
o SOLO LECTURA; (2) RIESGO (bajo/medio/alto); (3) CONSERVAR o BORRAR despues. DDL/RLS/
funciones/triggers = esquema, riesgo bajo, CONSERVAR. Seed de org/coach = datos,
CONSERVAR. Seeds demo/importador unico = datos, BORRAR despues. Ningun `DROP`/`DELETE`
sin backup y confirmacion explicita.

## Publicacion GitHub
- Fecha de publicacion: 2026-06-25.
- Repositorio: `fitness-coach-platform`.
- URL: https://github.com/Djmaykiss/fitness-coach-platform
- Rama principal: `main`.
- Commit inicial publicado: `b92d020` (`feat: initial fitness coach platform`).
