# Coach Fitness MVP

# Version 1.3 (Estable - main)
Version estable actual en `main`. Incluye todo lo de v1.2 mas el dashboard del
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
- `src/components/onboarding-wizard.tsx`: wizard de evaluacion inicial (11 pasos) embebido en la seccion `#agenda` de la landing. Consume `onboardingService`.
- `src/services/onboarding.service.ts` + `src/data/onboarding.ts`: recomendacion de plan (reglas simples) y opciones de cada paso.
- `src/components/admin/exercise-library.tsx`: CRUD de la biblioteca de ejercicios en `/admin` (catalogo con ficha completa). Consume `exerciseLibraryService`.
- `src/components/admin/training-programs.tsx`: builder real de programas en `/admin` (CRUD de programa + dias + asignar a alumno; los ejercicios se ELIGEN de la biblioteca, no se escriben). Consume `trainingService` + `exerciseLibraryService`.
- `src/components/dashboard/training-program-view.tsx`: programa asignado del alumno (rutina de hoy, dias, ficha completa por ejercicio resuelta desde la biblioteca y checklist por series). Consume `trainingService` + `exerciseLibraryService`.
- `src/services/training.service.ts` + `src/repositories/local/training-program.repository.ts` + `src/data/training.ts`: modulo de programas de entrenamiento (datos, persistencia y logica).
- `src/services/exercise-library.service.ts` + `src/repositories/local/exercise-library.repository.ts` + `src/data/exercise-library.ts`: biblioteca de ejercicios (catalogo reutilizable).
- `src/components/admin/nutrition-plans.tsx`: builder de planes de nutricion en `/admin` (CRUD de plan + dias + comidas + asignar a alumno). Consume `nutritionService`.
- `src/components/dashboard/nutrition-plan-view.tsx`: plan nutricional asignado del alumno (macros diarios, agua, comidas del dia y checklist de comidas). Consume `nutritionService`.
- `src/services/nutrition.service.ts` + `src/repositories/local/nutrition-plan.repository.ts` + `src/data/nutrition.ts`: modulo de nutricion (datos, persistencia y logica).
- `src/types`: tipos compartidos del proyecto.

Importante: `localStorage` solo existe en el navegador. Por eso las paginas que
muestran datos persistidos (`/admin`, `/dashboard`) son componentes cliente que
cargan via servicios en `useEffect`. La landing sigue siendo servidor (su
contenido es estatico y no requiere persistencia).

## Decisiones tecnicas
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
- Captacion en la landing: la seccion `#agenda` es el onboarding inteligente (wizard de 11 pasos, `src/components/onboarding-wizard.tsx`). El hero "Agendar llamada" hace scroll a `#agenda`. Tambien existe `/agendar`, un formulario simple alternativo (source `Landing`) que sigue funcionando. NO modificar otras secciones de la landing al tocar el onboarding.
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

1. Antes de empezar una funcionalidad, leer `CLAUDE.md` y `CHANGELOG.md` para entender el estado actual del proyecto.
2. Registrar SIEMPRE en `CLAUDE.md` (y en `CHANGELOG.md` si corresponde) toda nueva regla de arquitectura, decision tecnica, convencion, modulo, cambio importante de flujo o version. El objetivo es poder retomar el proyecto meses despues sin perder contexto.
3. Si una nueva implementacion contradice reglas o decisiones existentes, NOTIFICARLO al usuario antes de modificar el codigo.
4. Nunca eliminar funcionalidades existentes sin autorizacion explicita.
5. Antes de dar una tarea por terminada: ejecutar `npm run lint` y `npm run build`, y verificar (preview en vivo) que la app sigue funcionando, en desktop y movil. Verificar tambien antes de commit/push.
6. Al terminar una funcionalidad, indicar si conviene: dejarla en rama de feature, hacer merge a `main`, crear una nueva version (v0.x) y/o crear un tag de Git. Si queda estable y completa, indicarlo explicitamente.
7. Al finalizar, indicar si hay documentacion adicional que deba actualizarse (p. ej. `README.md`, READMEs de carpetas).
8. Proponer mejoras de arquitectura que no rompan compatibilidad, al finalizar la tarea (sin aplicarlas sin autorizacion).
9. Versionado: trabajar en ramas `feature/*` (nunca directo en `main`); merge a `main` solo tras lint+build+pruebas; cada version estable se documenta en `CLAUDE.md` + `CHANGELOG.md` y se etiqueta con `git tag -a vX.Y`.

## Publicacion GitHub
- Fecha de publicacion: 2026-06-25.
- Repositorio: `fitness-coach-platform`.
- URL: https://github.com/Djmaykiss/fitness-coach-platform
- Rama principal: `main`.
- Commit inicial publicado: `b92d020` (`feat: initial fitness coach platform`).
