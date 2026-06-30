# Changelog

Todos los cambios relevantes del proyecto se registran en este archivo.

## (en rama `feature/coach-admin-professional`, pendiente de merge)

### Agregado — Panel del coach profesional + contacto centralizado
- Configuración global del coach en `src/config/coachConfig.ts` (nombre, teléfono,
  WhatsApp, precio mensual). Es la única fuente del contacto en toda la app.
- WhatsApp: todos los botones de contactar/renovar/ayuda (pantalla de acceso
  bloqueado, contacto del dashboard, acciones del admin) abren
  `wa.me/17868704262` con un mensaje prellenado vía `whatsappUrl()`.
- Dashboard del alumno: header con logo + nombre real + Salir (sin Cliente/Admin).
- Admin: panel ejecutivo con total alumnos, activos, vencidos, pausados, renuevan
  esta semana, sin programa, sin nutrición, sin evaluación, leads pendientes e
  ingresos estimados.
- Admin: buscador de alumnos (nombre/email) y filtros (Todos, Activos, Vencidos,
  Pausados, Sin programa, Sin nutrición, Sin evaluación, Renovación próxima).
- Admin: acciones rápidas por alumno — Perfil, Editar, Entrenamiento (asignar),
  Nutrición (asignar), WhatsApp, Renovar, Pausar, Eliminar.
- Admin: leads con buscador (nombre/email/teléfono), editar, eliminar, convertir y
  WhatsApp.

### Técnico
- Nuevos derivados/métodos: `adminDashboardService.getExecutiveStats`, banderas en
  `getClientRows` (`hasProgram`/`hasNutrition`/`hasEvaluation`/`renewSoon`/`email`),
  `userRepository.getUsers`, `leadRepository.updateLead`/`deleteLead`.
- Arquitectura UI → services → repositories → localStorage intacta. Sin Supabase ni
  backend. No se tocó landing ni onboarding; sin cambios de diseño general.
  Responsive (desktop, tablet, móvil) verificado sin overflow.

## v1.3

Version estable actual en `main` (dashboard del alumno totalmente interactivo).

### Mejorado — Dashboard del alumno totalmente interactivo (todo en localStorage)
- Header del alumno: en `/dashboard` se muestran solo el logo, el nombre real del
  alumno y "Salir" (sin enlaces "Cliente"/"Admin"). El header del admin no cambia.
- Objetivos de la semana, recordatorios y "Plan alimenticio" (demo): marcar/
  desmarcar con porcentaje, persistido.
- Calendario de entrenamiento: cada día se puede marcar (pendiente → entrenado →
  100% → pendiente), guardado por fecha y reflejado visualmente.
- Rutina del día: "Iniciar entrenamiento" → "En progreso" → "Marcar como
  completado" (con opción de reiniciar), persistido.
- Galería de progreso: el botón "Agregar" abre el formulario (fecha + nota) y
  guarda el registro en la línea de tiempo.
- Chat con el coach: enviar mensajes que se guardan localmente y se muestran en el
  historial de la conversación.
- Recursos: al hacer clic se abre un panel de detalle del recurso (sin descarga
  real todavía).
- Comparador Antes / Después: usa las fotos de progreso del alumno; si hay varias,
  permite elegir la foto de antes y la de después; si no hay, mantiene el
  placeholder elegante.
- Logros: se desbloquean según acciones reales (primer entrenamiento, primera
  semana, 5 kg perdidos, 30 días, objetivo alcanzado).
- Historial: se construye automáticamente a partir de evaluación, asignaciones,
  entrenamientos y comidas completadas, fotos y logros.
- Gráficas: usan datos demo como fallback, con la arquitectura lista para datos
  reales.

### Técnico
- `coachingService.getDashboard` deriva logros e historial de los datos reales
  (workout-progress, nutrition-progress, fotos, progreso, evaluación) y compone el
  estado de calendario/rutina/chat. Nuevo persistido de chat
  (`coachingRepository.getChat/addChatMessage`, clave `coach-fitness:chat`).
- `DashboardShell` admite `navName` (nombre en el header). Arquitectura
  UI → services → repositories → localStorage intacta. Sin Supabase ni backend.
- No se tocó landing ni onboarding; sin cambios de diseño general. Responsive
  (móvil) verificado sin overflow.

## v1.2

Version previa (módulo real de nutrición).

### Agregado — Módulo de nutrición (todo en localStorage)
- Admin (`/admin`): nueva sección "Planes de nutrición" con CRUD completo: crear,
  editar y eliminar plan (nombre, objetivo, calorías, proteínas, carbohidratos,
  grasas, agua recomendada y notas del coach); crear días; agregar/quitar comidas
  por día (nombre + alimentos); y asignar el plan a un alumno.
- Alumno (`/dashboard`): nueva sección "Mi plan de nutrición" que muestra el plan
  asignado con sus macros diarios, agua recomendada, las "comidas de hoy" y todos
  los días, con checklist para marcar comidas completadas (progreso guardado en
  `localStorage`).
- Arquitectura intacta (UI → services → repositories → localStorage): tipos
  `NutritionPlan`/`NutritionPlanDay`/`NutritionPlanMeal`/`AssignedNutrition`,
  `nutritionService`, `LocalNutritionPlanRepository` y seed `src/data/nutrition.ts`
  (plan demo "Recomposición 2200 kcal" asignado al alumno demo). Claves nuevas:
  `nutrition-plans`, `nutrition-assignments`, `nutrition-progress`.

### Sin cambios
- Independiente de la sección demo "Nutrición" del dashboard premium (que sigue
  igual). No se tocó landing ni onboarding, sin cambios de diseño general, sin
  pagos, sin Supabase ni backend. Verificado responsive (móvil) sin overflow.

## v1.1

Version previa (biblioteca profesional de ejercicios + programas que eligen
ejercicios de la biblioteca).

### Agregado — Biblioteca de ejercicios (todo en localStorage)
- Admin (`/admin`): nueva "Biblioteca de ejercicios" con CRUD completo. Cada
  ejercicio tiene nombre, grupo muscular, músculos secundarios, imagen, GIF, video
  YouTube, equipo, dificultad, descripción, técnica correcta, errores comunes,
  consejos del coach, variantes, sustituciones, tiempo y descanso recomendados.
- El builder de programas ahora ELIGE ejercicios de la biblioteca (ya no se
  escriben a mano): cada ejercicio del día guarda la referencia (`exerciseId`) más
  la prescripción (series, reps, descanso, notas).
- Alumno (`/dashboard`): al abrir un ejercicio ve su ficha completa — imagen/GIF
  grande, botón "Ver demostración" si hay video, técnica, errores comunes,
  consejos, equipo y músculos trabajados — y un CHECKLIST POR SERIES (Serie 1..N
  según las series prescritas). Al marcar todas: "✓ Ejercicio completado". El
  progreso por serie se guarda en `localStorage`.
- Capa de datos (UI → services → repositories → localStorage): tipos
  `LibraryExercise`/`CreateLibraryExerciseInput`, `TrainingExercise.exerciseId`,
  `AssignedTraining.seriesProgress`; `exerciseLibraryService` +
  `LocalExerciseLibraryRepository` + seed `src/data/exercise-library.ts` (12
  ejercicios, el programa demo los referencia). Claves nuevas: `exercise-library`,
  `exercise-progress`.

### Sin cambios
- No se tocó landing ni onboarding, sin cambios de diseño general, sin pagos, sin
  Supabase ni backend. Verificado responsive (móvil) sin overflow.

## v1.0

Version previa (primer módulo funcional completo de programas de entrenamiento).

### Agregado — Módulo de programas de entrenamiento (todo en localStorage)
- Admin (`/admin`): nueva sección "Programas de entrenamiento" con builder real:
  crear, editar y eliminar programa (nombre, objetivo, nivel, duración, notas);
  crear días de entrenamiento; agregar/quitar ejercicios por día (series,
  repeticiones, descanso, notas); y asignar el programa a un alumno.
- Alumno (`/dashboard`): nueva sección "Mi programa de entrenamiento" que muestra
  el programa asignado, los días, la "rutina de hoy" con sus ejercicios
  (series/reps/descanso/notas) y las notas del coach, con un botón
  "Marcar entrenamiento completado" cuyo progreso se guarda en `localStorage`.
- Arquitectura intacta (UI → services → repositories → localStorage): tipos
  `TrainingProgram`/`TrainingDay`/`TrainingExercise`/`AssignedTraining`,
  `trainingService`, `LocalTrainingProgramRepository` y seed `src/data/training.ts`
  (programa demo "Hipertrofia 3 días" asignado al alumno demo). Claves nuevas:
  `training-programs`, `program-assignments`, `workout-progress`.

### Sin cambios
- Independiente de la lista simple "Programas" existente (que sigue igual). No se
  tocó landing ni onboarding, sin cambios de diseño general, sin pagos, sin
  Supabase. Verificado responsive (móvil) sin overflow.

## v0.9

Version previa (infraestructura de desarrollo robusta + rediseño de la pantalla de
acceso bloqueado del alumno).

### Infraestructura de desarrollo (no cambia la app)
- Solucionado el problema recurrente de procesos `next dev` huerfanos que dejaban
  el puerto 3000 ocupado y hacian que el dev saltara a otro puerto o que
  localhost:3000 quedara caido.
- Nuevo `scripts/free-port.mjs` (cross-platform, sin dependencias, best-effort):
  antes de arrancar libera el puerto 3000 y mata procesos `next dev`/`next-server`
  huerfanos, garantizando un unico servidor Next.
- `package.json`: `predev` ejecuta la limpieza automaticamente antes de `dev`;
  nuevo `clean:port` para limpiarlo manualmente. `dev`, `build`, `start` y `lint`
  sin cambios.
- `.claude/launch.json` revisado: se mantiene `port: 3000` + `autoPort: true` para
  preferir el 3000 (ya liberado por `predev`) y, si estuviera ocupado, mostrar
  claramente el puerto alternativo.

### Pantalla de acceso bloqueado del alumno (solo vista del alumno)
- Header de la pantalla bloqueada: se eliminan los enlaces "Cliente" y "Admin";
  solo se muestran el logo y el botón "Salir" (`minimalNav` en `DashboardShell`).
- Saludo: siempre el nombre real del alumno ("Hola, Michael"). Si no hay nombre
  (o es el placeholder "Cliente") muestra solo "Hola"; nunca "Hola, Cliente".
- Tarjeta de acceso bloqueado rediseñada: título "Tu acceso ha vencido" /
  "Tu acceso está en pausa", subtítulo "Tu plan se encuentra temporalmente
  desactivado.", badge de estado, fecha ("Venció el …" / "Vigente hasta el …") y
  mensaje para recuperar el acceso.
- Botones: "RENOVAR ACCESO" (verde, principal) y "CONTACTAR COACH" (secundario),
  por ahora sin funcionalidad (nota de que se habilitarán próximamente).
- Tres variantes visuales de estado: Activo (verde, `AccessNotice`), Pausado
  (amarillo) y Vencido (rojo), cada una con su icono y mensaje (`LOCKED_CONFIG`).
- Cuando el acceso NO es Activo se ocultan por completo todos los módulos premium
  (estadísticas, progreso, evaluación, nutrición, tareas, calendario, chat, fotos,
  gráficos): solo se ve la tarjeta de acceso bloqueado.

### Sin cambios
- No se tocó onboarding, landing, admin, repositorios ni servicios. Sin Supabase,
  sin backend. Verificado responsive (móvil) sin overflow.

## v0.8

Version previa (bloqueo del dashboard por mensualidad + CRUD completo de alumnos).

### Agregado
- Bloqueo del dashboard del alumno por mensualidad: si el `accessStatus` es
  `Vencido` o `Pausado`, en `/dashboard` se ocultan las funciones premium y solo
  se muestra una vista restringida elegante (`LockedDashboard`) con: nombre del
  alumno, estado de acceso, fecha de vencimiento (si existe), mensaje "Renueva tu
  mensualidad con tu coach para recuperar el acceso." y un botón visual "Contactar
  coach" (sin WhatsApp todavía). Con acceso `Activo` se ve el dashboard completo.
  Solo se condiciona el renderizado: no se eliminó ningún componente.
- CRUD completo de alumnos en `/admin`: además de crear y editar, ahora se puede
  ELIMINAR un alumno con confirmación. El borrado limpia en cascada su cliente,
  progreso, fotos y checklists, sin tocar las cuentas de usuario/login (no rompe
  los usuarios demo). Botón "Eliminar" (rojo) por fila + tarjeta de confirmación.

### Técnico
- Nuevos métodos en la capa de datos (UI → services → repositories → localStorage):
  `clientRepository.deleteClient`, `progressRepository.removeForClient`,
  `coachingRepository.removeClient`, orquestados por
  `adminDashboardService.deleteClient`.
- Sin Supabase, sin backend, sin cambios de diseño general; no se tocó la landing
  ni el onboarding. Verificado responsive (móvil) sin overflow.

## v0.7

Version previa (ilustraciones y copy premium del onboarding).

### Mejorado (solo onboarding: visual y contenido)
- Ilustraciones vectoriales propias (SVG, estilo neón consistente) que reemplazan
  los placeholders del onboarding, en `public/images/onboarding/`: `body-types/`
  (6), `goals/` (6), `levels/` (3) y `places/` (3). Se mantiene el fallback
  `onError`. Habilitado `images.dangerouslyAllowSVG` en `next.config.ts` para
  servir los SVG propios via `next/image`.
- Los pasos de nivel y lugar de entrenamiento pasan a tarjetas con ilustración
  (antes eran "pills"), con el mismo dato guardado (su `label`).
- Reescritura de TODOS los textos con voz de coach: cada paso tiene título
  atractivo, subtítulo humano y contexto breve (`StepHeader` ahora acepta
  `subtitle`).
- Resumen final rediseñado como diagnóstico profesional: tarjetas con icono por
  campo (Objetivo, Nivel, Tipo corporal, Peso, Estatura, Lugar, Días disponibles,
  Frecuencia semanal) + tarjeta premium con plan recomendado, duración, frecuencia
  y el mensaje "Basándonos en tu evaluación creemos que este plan tiene el mayor
  potencial para ayudarte a conseguir tus objetivos."
- Microanimaciones suaves: hover y selección de tarjetas (lift + glow + pop de la
  ilustración), transición entre pasos y barra de progreso animada.
- Verificado responsive (desktop, tablet, móvil) sin overflow horizontal.

### Sin cambios
- No se agregaron funciones ni preguntas; no se modificó el flujo, los servicios,
  los repositorios, los tipos, `localStorage` ni el dashboard.

## v0.6

Version previa (pulido visual premium, solo diseño).

### Mejorado (solo diseño)
- Pulido visual general para una apariencia más premium y comercial, manteniendo
  la paleta actual (negro, blanco, gris, verde neón). Sin funciones nuevas, sin
  cambios de arquitectura y sin tocar la lógica de `localStorage`.
- `globals.css`: `.premium-card` con sombras en capas + highlight interno y
  transición suave; nueva utilidad `.card-hover` (lift + glow neón en hover);
  animación de entrada `.reveal-up` (+ delays) sin JS; halo de fondo sutil
  (`body::before`); `:focus-visible` neón; scrollbar a tono; `.neon-ring` y
  `.gym-hero` con más profundidad; soporte de `prefers-reduced-motion`.
- Botones primarios unificados con gradiente neón, lift en hover y `active:scale`
  (landing, login/registro, wizard y panel admin).
- Inputs con foco neón + halo y hover de borde (auth, wizard y admin).
- Landing: animación de entrada del hero, hover premium en tarjetas de programas,
  beneficios, transformaciones y testimonios; CTA final con flecha animada.
- Encabezados de sección con acento neón; `StatCard` con jerarquía y glow.
- Dashboard del alumno: nav superior fija con blur; íconos de sección con glow.
- Panel admin: tablas con hover de fila y encabezados más legibles.
- Mejor jerarquía visual, espaciados y responsive; verificado en desktop y móvil
  sin overflow horizontal.

## v0.5

Version previa (formulario de salud y alimentacion del cliente integrado en el
onboarding inteligente).

### Agregado
- Formulario de salud y alimentacion del cliente integrado en el onboarding, SIN
  eliminar ninguna pregunta existente. El wizard pasa de 8 a 11 pasos.
- Paso 8 "Datos y antecedentes": direccion + antecedentes personales (hipertension
  arterial, hepatitis, cirugias previas, asmatico, otra condicion a mencionar).
- Pasos 9-10 "Alimentacion": consume azucar + habitos, refrescos, alcohol, pollo,
  carne roja, cerdo, alimentos del mar (Pescados/Mariscos/Ambos/Ninguno), lacteos
  (Si/No/Intolerante a la lactosa), frutas, vegetales, arroz (Si/No/Integral),
  viveres, tipo de pan (Blanco/Integral/Ambos/Ninguno), pastas, condimentos
  artificiales, alergias alimentarias y alimento que prefiere no consumir.
- Estos pasos son opcionales: el alumno puede continuar y completarlos con el coach.
- Toda la informacion se guarda dentro de la misma evaluacion inicial del lead y
  del alumno (campos opcionales en `LeadEvaluation`; el objeto fluye completo por el
  pipeline existente, sin cambios en servicios ni repositorios).
- "Mi evaluacion inicial" (dashboard del alumno) y las fichas del admin (alumno y
  lead) ahora muestran la evaluacion agrupada en bloques: Datos personales,
  Antecedentes y Alimentacion (`evaluation-details` solo renderiza campos con valor).

### Sin cambios de base
- Sin backend, sin Supabase, sin IA, sin pagos: todo en `localStorage`.
- Arquitectura intacta: UI -> services -> repositories -> localStorage.
- No se modifico el diseno general ni otras secciones de la landing/app.

## v0.4

Version previa (integra onboarding inteligente + dashboard premium).

### Agregado
- Onboarding inteligente: la seccion "Agenda" de la landing se reemplaza por un wizard de evaluacion inicial de 8 pasos (paso 1 con nombre, email, telefono, edad y sexo; luego estado actual, tipo de cuerpo, objetivo, experiencia, disponibilidad, habitos, resumen con plan recomendado).
- Barra de progreso, botones Anterior/Siguiente, animaciones suaves y responsive (desktop/tablet/movil).
- Recomendacion de plan con reglas simples por objetivo (sin IA ni calculos complejos).
- Al finalizar: guarda un `Lead` con la evaluacion completa (source `Evaluación`), guarda la evaluacion como pendiente y redirige a `/register`.
- En `/register`: si hay un onboarding pendiente se prellenan nombre y email y se muestra un aviso ("Tu evaluación inicial está lista..."). Al crear la cuenta, la evaluacion se guarda en el perfil del alumno (`Client.evaluation`) y se limpia.
- En `/login`: si hay un onboarding pendiente se limpia automaticamente (evita adjuntarlo a una cuenta equivocada).
- En `/dashboard`: nueva seccion "Mi evaluacion inicial" con todos los datos del alumno.
- En `/admin`: ficha del lead y ficha del alumno muestran la evaluacion inicial (componente compartido `evaluation-details`).
- Ilustraciones preparadas en `/public/images/onboarding/body-types/` y `/goals/` con placeholders (silueta/icono).

### Dashboard premium del alumno (sobre esta misma rama)
- 18 secciones tipo Trainerize/TrueCoach añadidas al `/dashboard` sin romper lo existente: "Mi transformación" (galería + timeline + alta de registros), gráficas de progreso (peso/cintura/grasa/músculo, SVG propio), objetivos de la semana, calendario de entrenamiento, medidas corporales, cumplimiento general, logros, progreso hacia la meta, historial, rutina del día, nutrición, chat con el coach (demo), recursos, recordatorios, comparador antes/después (slider), métricas corporales calculadas (IMC, peso ideal, calorías, agua, macros), barra de transformación y próximo check-in.
- Objetivos, nutrición, recordatorios y fotos se marcan/agregan y persisten en `localStorage` (por id de cliente); el resto son datos demo preparados para Supabase.
- Servicios `coachingService` y `metricsService`; repositorio `LocalCoachingRepository`. Sin dependencias nuevas.
- El dashboard usa los datos del onboarding (evaluacion del alumno); ambas funcionalidades quedan integradas juntas en `main` desde v0.4.

### Sin cambios de base
- Sin backend, sin Supabase, sin IA, sin pagos: todo en `localStorage`.
- Arquitectura intacta: UI -> services -> repositories -> localStorage.
- No se modifico ninguna otra seccion de la landing ni de la app.

## v0.3

Version previa (gestion de leads).

### Agregado
- Gestion de leads. El boton "Agendar llamada" de la landing lleva a `/agendar`, un formulario (nombre, email, telefono, objetivo, mensaje) que crea un lead en `localStorage`.
- En `/admin`, seccion Leads interactiva: ver leads, cambiar estado (`Nuevo` / `Contactado` / `Convertido` / `Descartado`) y convertir un lead en alumno (crea el cliente y marca el lead como `Convertido`).
- Tipos nuevos: `Lead`, `LeadStatus`, `CreateLeadInput`; servicio `leadService`.

### Sin cambios de base
- Sin backend, sin Supabase, sin WhatsApp, sin pagos reales: todo en `localStorage`.
- Arquitectura intacta: UI -> services -> repositories -> localStorage.

## v0.2

Version estable actual en `main`.

### Agregado
- Control de acceso mensual manual de alumnos (estado `Activo` / `Vencido` / `Pausado`).
- Campos en el alumno: `accessStatus`, `accessExpiresAt`, `lastPaymentDate`, `paymentMethod`.
- Admin: renovar acceso 30 dias (registrando metodo de pago: PayPal, Zelle, Western Union, Efectivo, Transferencia), pausar y marcar vencido; ver estado y fecha de vencimiento por alumno.
- Alumno: aviso de acceso en el dashboard (estado + fecha + mensaje); si esta vencido o pausado se indica renovar con el coach (sin bloquear la pagina).
- Imagenes de transformaciones preparadas con fallback elegante (`/public/images/transformations/`).
- Textos demo humanizados y ortografia con acentos correctos.

### Sin cambios de base
- Sin backend, sin Supabase, sin pagos reales: todo en `localStorage`.
- Arquitectura intacta: UI -> services -> repositories -> localStorage.

## v0.1

Primera version funcional (congelada) — base oficial para la Fase 2.

### Incluye
- Landing Page.
- Login y registro.
- Dashboard del cliente.
- Dashboard del administrador.
- Persistencia completa mediante `localStorage`.
- CRUD basico de clientes.
- CRUD basico de programas.
- Asignacion de programas a alumnos.
- Gestion del progreso del alumno.
- Guards de acceso por rol.
- Diseño responsive.
- Footer con informacion del desarrollador.

### Arquitectura
- Flujo por capas: UI -> Services -> Repositories -> localStorage.
- Base preparada para migracion futura (cambiar solo `src/repositories/index.ts`).

### No incluye (etapas futuras)
- Sin backend.
- Sin Supabase.
- Sin pagos.
- Sin IA.
- Sin automatizaciones.
