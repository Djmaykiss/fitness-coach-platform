# Producción sin demo — Inventario y plan

> Estado: **DISEÑO** (sin código, sin commit, sin push). Nueva filosofía: la app es
> PRODUCCIÓN. Nada de demo visible para clientes; una instalación nueva empieza VACÍA; el
> contenido lo crea el coach. Los seeds solo existen para desarrollo local/pruebas internas.

## Principio permanente (nuevo)
```
Coach crea contenido → lo administra → decide qué es público → decide qué asigna
        → el alumno solo consume lo que el coach publica o asigna.
```
Aplica a TODO el contenido de la plataforma.

## REGLA PERMANENTE — Empty-state profesional (placeholders, nunca demo)
Toda sección/módulo público existe **desde el día uno**, pero su contenido se comporta así:
- **Sin contenido real del coach → placeholder profesional, elegante y atractivo** con un
  mensaje que invita a publicar (ej.: "Aquí aparecerán las transformaciones de tus
  alumnos.", "Publica testimonios para generar confianza.", "Tus programas aparecerán aquí
  cuando los publiques.", "Agrega contenido desde el panel del coach.").
- **Con contenido real → se reemplaza automáticamente** por el contenido real.
- **NUNCA** nombres, fotos, testimonios, transformaciones ni resultados **inventados**;
  nunca datos demo ni contenido ficticio en producción.
- Aplica a: Transformaciones, Testimonios, Programas, Recursos, Artículos, Biblioteca,
  Galerías, Antes/Después y **cualquier módulo público** (lista viva).
- Todo el contenido lo administra el **coach** desde su panel (CMS). Las secciones cuya
  administración aún no existe (marketing de la landing) se migran a CRUD del coach; hasta
  entonces muestran el placeholder, **no** el seed ficticio.
- Regla operativa: `sin contenido = placeholder` / `con contenido = real`. El demo/seed solo
  vive tras `isDemoContent()` (dev/pruebas internas), nunca en producción.

## Hecho confirmado (bueno)
- `create_organization` (RPC) **NO siembra** ejercicios/programas/planes → **un coach/org
  nuevo YA arranca vacío**. `register_client` solo crea el propio alumno. La demo NO viene
  de crear cuentas nuevas: viene de (A) demo NO gateado por el flag y (B) datos demo ya
  sembrados en la org de pruebas.

## Inventario de demo/seed (por VISIBILIDAD)

### A) Demo VISIBLE al cliente EN PRODUCCIÓN (no gateado por backend) — PRIORIDAD
1. **Landing / marketing (repos `Mock*`, SIEMPRE activos, no pasan por el flag):**
   - `src/data/programs.ts` → sección Programas.
   - `src/data/transformations.ts` → "Antes/Después" (casos ficticios).
   - `src/data/testimonials.ts` → testimonios ficticios ("Carlos R.", etc.).
   - `src/data/benefits.ts` + `src/data/site.ts` → beneficios, nav, copy del hero.
   - Cableado: `contentRepository`/`testimonialRepository`/`transformationRepository` =
     `Mock*` en `index.ts` (NO `pickRepository`) → `landingService` → `landing-sections.tsx`.
2. **Login (`src/components/auth-form.tsx`):** bloque "Cuentas demo"
   (admin@coach.com / cliente@coach.com / 123456) + copys "Acceso local con cuentas demo"
   y "cuenta de cliente de prueba".
3. **Dashboard del alumno (premium):** `src/services/coaching.service.ts` importa
   directo de `@/data/coaching` → `metricSeries` (gráficas), `resources`, `beforeAfter`,
   `chatDemo`, y hace fallback `clientId = "c-demo"`. Se muestra **sin importar el backend**.
4. **Datos demo ya sembrados en Supabase:** org demo, cuentas demo (admin/cliente),
   cliente `c-demo`, ejercicios/programas/planes de los seeds (`0100`/`0103`) + filas de
   prueba de las verificaciones de bloques. (Higiene de datos.)

### B) Demo SOLO en modo LOCAL/dev (NO llega a producción supabase)
- Seeds de los `Local*` (se siembran en `localStorage` solo con backend `local`):
  `exercise-library`, `training`(+asignaciones), `clients`, `leads`, `plans`(+clientPlans),
  `users`, `discover`, `onboarding-content`, `nutrition`, `coaching`(chat/fotos),
  `dashboard`/`progress`. En `supabase` NO se usan. Riesgo: una nueva pestaña en modo local
  re-siembra (solo dev).

### C) NO es demo — NO tocar
- `src/data/onboarding.ts` → **opciones del wizard** (SEXES, BODY_TYPES, OBJECTIVES,
  LEVELS, PLACES…): configuración de UI, no contenido demo.
- `src/data/settings.ts` → default de marca / fallback white-label.

## Plan de eliminación (sin afectar el desarrollo local)

Idea central: **el backend ya gatea la Categoría B** (en `supabase` no hay seeds locales) →
la fase E1 (forzar supabase en prod) ya saca la Categoría B de los clientes. Falta gatear
la **Categoría A (no gateada)** con un interruptor de demo explícito.

### P1 — Interruptor único de demo — ✅ BASE HECHA
- ✅ `src/lib/demo.ts` → `isDemoContent()` (lee `NEXT_PUBLIC_DEMO_CONTENT`, default `false`
  = producción; `true` = dev). SSR-safe.
- ✅ `src/components/content-placeholder.tsx` → `ContentPlaceholder` (Empty-State
  profesional, **server-safe**, variantes `section`/`inline`, icono + título + mensaje +
  CTA "Agrega contenido desde el panel del coach"). Placeholder canónico de la plataforma.
- ✅ Primera integración validada: bloque "Cuentas demo" del login gateado por
  `isDemoContent()` (producción NO muestra credenciales demo). Verificado en vivo ambos
  estados; lint + build limpios. Sin commit/push.
- ⏭️ Pendiente (P2): gatear el resto de la Categoría A con placeholders (landing Mock,
  `coaching.service`, siembra local) — ver abajo.

### P2 — Gatear la Categoría A (con placeholders, no ocultar)
- **Landing (Mock):** cuando demo=off, los repos `Mock*` devuelven **vacío** y cada sección
  renderiza su **placeholder profesional** (la sección SIEMPRE existe; nunca contenido
  ficticio). Componente reutilizable `EmptyState`/`SectionPlaceholder` (icono + título +
  mensaje + CTA "Agrega contenido desde el panel del coach").
- **Login:** ocultar el bloque "Cuentas demo" y cambiar los copys "demo/prueba" por texto
  neutro cuando demo=off.
- **Dashboard alumno (`coaching.service`):** cuando demo=off, NO componer `metricSeries`/
  `resources`/`beforeAfter`/`chatDemo`; mostrar **placeholders/estados vacíos** elegantes
  ("Aún no hay datos"); quitar el fallback `c-demo` en producción (usar el cliente real).
  ✅ HECHO (sin commit): gráficas, recursos y Antes/Después con placeholder; fallback
  `c-demo` gateado. Verificado local (on/off) + supabase (no roto).
- **Dashboard alumno — resto del PremiumDashboard (DECISIÓN: OPCIÓN B):** las secciones demo
  que DUPLICAN pestañas reales (Rutina del día → pestaña "Hoy"; Nutrición → pestaña "Mi
  plan") se **OCULTAN en producción** (demo=off); las secciones analíticas sin datos reales
  (medidas, cumplimiento, objetivos semanales, recordatorios, check-in, métricas corporales)
  muestran **placeholder profesional**. NUNCA rutina/nutrición/métricas/recordatorios/
  objetivos falsos. (Pendiente de implementar en la continuación de P2.)

### P3 — Gatear también la siembra local (para poder probar "modo producción" en local)
- `readCollection(key, isDemoContent() ? seed : [])` (y equivalente en `readRecord`) → en
  local con demo=off, las colecciones arrancan **vacías** (útil para QA realista).

### P4 — Higiene de datos en Supabase (Categoría A.4)
- Script revisable `supabase/seed/0104_cleanup_demo.sql`: **lista** y luego **soft-delete**
  de ejercicios/programas/planes de prueba de la org; DECISIÓN sobre borrar o conservar las
  cuentas demo (`admin@coach.com`/`cliente@coach.com`) y la org demo (¿QA interno?).
- **No** ejecutar los seeds `0100`/`0103` en orgs de producción. Documentarlo.

### P5 — Guardas para el futuro
- Regla en `CLAUDE.md`: seeds SOLO tras `isDemoContent()`; prohibido contenido demo no
  gateado; toda superficie nueva parte vacía y se llena desde el panel del coach.

## DECISIÓN (RESUELTA) — Landing y módulos públicos = placeholder + CMS del coach
- Las secciones **NO se ocultan** y **NO muestran ficticio**: sin contenido real muestran
  un **placeholder profesional** (ver REGLA PERMANENTE arriba). Con contenido real del
  coach, se reemplazan automáticamente.
- Marketing de la landing (Transformaciones, Testimonios, Programas) se **migra a CRUD del
  coach** (CMS) como los demás módulos; mientras no exista el CMS de una sección, esa
  sección muestra su placeholder (nunca el seed ficticio).
- Fase de trabajo dedicada (posterior a E1/P1-P2): **CMS de marketing** (testimonios /
  transformaciones / programas de la landing) administrado desde `/admin`, con estado
  publicado/no publicado como el resto del contenido.

## Relación con el plan de ejercicios
Esta limpieza de demo es **transversal** y se ejecuta junto con las fases E1–E6 de
`EXERCISE_SYSTEM_PLAN.md` (E1 backend único ya resuelve la Categoría B; P4 se alinea con
E6). Orden sugerido: E1 → P1/P2 (demo off) → E2… → E6/P4.

## Reglas
Sin borrado destructivo sin OK; migraciones/scripts nuevos, aditivos, revisables;
Local/Supabase en paridad; el modo local/dev conserva la demo con el flag; sin commit/push
hasta confirmar cada paso.
```
