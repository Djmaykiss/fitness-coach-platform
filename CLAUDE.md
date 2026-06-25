# Coach Fitness MVP

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

No agregar funciones nuevas sobre esta version: es la base oficial para iniciar
la Fase 2. Ver `CHANGELOG.md`.

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

- `src/app`: rutas principales (`/`, `/login`, `/register`, `/dashboard`, `/admin`).
- `src/components`: componentes reutilizables de UI y composicion.
- `src/sections`: secciones grandes de la landing page.
- `src/layouts`: layouts reutilizables para vistas tipo dashboard.
- `src/context`: providers de React (auth mock con Context API).
- `src/data`: semillas (seed) iniciales de cada coleccion.
- `src/lib/local-store.ts`: capa de persistencia sobre `localStorage` (lectura/escritura + siembra; segura en SSR).
- `src/repositories`: interfaces + implementaciones. `Mock*` sirve contenido de marketing estatico (lo lee la landing en el servidor); `Local*` persiste datos operativos en `localStorage`. Unico punto a cambiar al migrar a una base de datos (`src/repositories/index.ts`).
- `src/services`: capa que consumen los componentes. Metodos `async` (lectura y escritura) listos para un backend real.
- `src/components/admin/admin-panel.tsx`: UI de gestion del panel admin (crear/editar cliente, crear programa, asignar programa, editar progreso).
- `src/types`: tipos compartidos del proyecto.

Importante: `localStorage` solo existe en el navegador. Por eso las paginas que
muestran datos persistidos (`/admin`, `/dashboard`) son componentes cliente que
cargan via servicios en `useEffect`. La landing sigue siendo servidor (su
contenido es estatico y no requiere persistencia).

## Decisiones tecnicas
- No usar nombre real ni logo real por ahora. Mantener textos genericos como "Coach Fitness" y "Fitness Coaching".
- Los textos demo de resultados (Antes y Despues), programas y testimonios estan humanizados para parecer casos reales de coaching (nombres anonimos tipo "Carlos R.", objetivos, detalles y citas naturales). No representan identidades reales y no se usan fotos reales. Viven en `src/data` (`transformations.ts`, `programs.ts`, `testimonials.ts`), nunca hardcodeados en componentes.
- La seccion Antes y Despues quedo preparada para usar imagenes profesionales de transformaciones. Las rutas viven en `src/data/transformations.ts` (`beforeImage`/`afterImage`) y apuntan a `/public/images/transformations/` (`carlos-before.webp`, `carlos-after.webp`, `mariana-*`, `andres-*`). Si el archivo aun no existe, `TransformationImage` (`src/components/transformation-image.tsx`) muestra un placeholder elegante via `onError` sin romper el diseno. Ver `public/images/transformations/README.md` para nombres y prompts. Imagenes ficticias y realistas: sin personas famosas ni fotos de clientes reales.
- Persistencia local real con `localStorage` (sin backend ni Supabase). Se persisten: usuarios registrados, clientes/alumnos, leads, programas del panel y progreso basico del cliente. Las claves viven en `STORAGE_KEYS` (`src/lib/local-store.ts`).
- Registrar un alumno crea su usuario y tambien un cliente enlazado por `userId`; por eso aparece de inmediato en el panel admin y ve su propio progreso. Los totales del admin (clientes, leads, programas) se derivan contando las colecciones, asi se actualizan solos.
- Modelo de datos: el cliente/alumno (`Client`) tiene `id` y `userId` opcional. El progreso (`ClientProgress`) se indexa por id de cliente; el dashboard del alumno resuelve su cliente por `userId` y lee ese progreso. La tabla del admin une cliente + progreso (programa y % derivados).
- Gestion desde `/admin` (todo persistido en `localStorage` via servicios -> repositorios): crear cliente, editar cliente (nombre/estado), crear programa, asignar programa a un alumno y editar su progreso basico. Las tablas se recargan tras cada cambio.
- IDs locales: no deben depender solo de `Date.now()`. Para clientes y usuarios locales se usa `Date.now()` + sufijo aleatorio, para evitar colisiones por doble clic o creaciones rapidas. Al migrar a Supabase, los IDs deberan ser UUID generados por la base de datos / Auth.
- Autenticacion simulada con Context API (sin JWT ni sesiones reales). La sesion se guarda en `localStorage` (`coach-fitness:auth-user`). Usuarios demo: `admin@coach.com` / `123456` y `cliente@coach.com` / `123456`.
- Migracion futura a base de datos / Supabase: implementar las interfaces de `src/repositories` con nuevas clases y cambiar el cableado en `src/repositories/index.ts`, sin tocar UI ni servicios.
- No implementar todavia: Supabase, pagos, IA, WhatsApp/Instagram/Facebook Messenger, CRM avanzado, nutricion avanzada, videos avanzados ni automatizaciones. Se agregan en etapas futuras.
- Footer obligatorio con credito: "Desarrollado por Michael Perez" y enlaces a portafolio (https://djmaykiss.github.io/Minuevocurriculum/), sitio web (https://markingwebs.com/) y GitHub (https://github.com/Djmaykiss). Se muestra en todas las paginas: footer completo en la landing y `MiniFooter` (compacto) en login, registro y dashboards.
- La sesion mock se cierra con el boton "Salir" del header de los dashboards (`src/components/logout-button.tsx`).
- El saludo de ambos dashboards usa el nombre real del usuario autenticado (`Bienvenido, ${user.firstName}` desde `useAuth`); nunca se hardcodea el nombre en el componente.
- Copys del login: titulo "Bienvenido a tu nueva version.", subtitulo orientado al cliente, formulario "Accede a tu espacio" y boton "Continuar".
- WhatsApp aun no esta conectado: el dashboard del cliente muestra un boton "Contacto pendiente" deshabilitado con la nota "El numero del coach se agregara despues". No usar numeros falsos ni `wa.me` vacio.
- Sin enlaces vacios: no usar `href="#"`, `href=""` ni `wa.me` sin numero. Para rutas internas usar siempre `<Link>` de `next/link`.
- Tema visual: negro, gris oscuro, verde neon, cards premium con glassmorphism ligero, bordes redondeados y transiciones suaves.
- Textos de cara al usuario: redactados para el cliente final. No exponer terminos tecnicos internos (MVP, mock, backend, leads) en la UI.

## Reglas de desarrollo
- No borrar archivos importantes existentes sin indicacion explicita.
- Despues de cada modificacion, abrir o recargar la pagina para verificarla. Revisar siempre en desktop y en movil (responsive).
- Ejecutar `npm run lint` y `npm run build` antes de entregar cambios finales.
- Mantener componentes separados, responsivos y preparados para crecer.

## Publicacion GitHub
- Fecha de publicacion: 2026-06-25.
- Repositorio: `fitness-coach-platform`.
- URL: https://github.com/Djmaykiss/fitness-coach-platform
- Rama principal: `main`.
- Commit inicial publicado: `b92d020` (`feat: initial fitness coach platform`).
