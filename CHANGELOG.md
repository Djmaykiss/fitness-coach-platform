# Changelog

Todos los cambios relevantes del proyecto se registran en este archivo.

## v0.4 (en rama `feature/intelligent-onboarding`, pendiente de merge)

### Agregado
- Onboarding inteligente: la seccion "Agenda" de la landing se reemplaza por un wizard de evaluacion inicial de 8 pasos (datos personales, estado actual, tipo de cuerpo, objetivo, experiencia, disponibilidad, habitos, resumen con plan recomendado).
- Barra de progreso, botones Anterior/Siguiente, animaciones suaves y responsive (desktop/tablet/movil).
- Recomendacion de plan con reglas simples por objetivo (sin IA ni calculos complejos).
- Al finalizar guarda un `Lead` con la evaluacion completa (`Lead.evaluation`), source `Evaluación`. No crea alumno todavia.
- En `/admin`, ficha del lead: el coach abre el detalle y ve toda la evaluacion (peso, altura, objetivo, tipo corporal, nivel, disponibilidad, plan recomendado, etc.).
- Ilustraciones de tipo de cuerpo preparadas (`/public/images/onboarding/`) con placeholder de silueta.

### Sin cambios de base
- Sin backend, sin Supabase, sin IA, sin pagos: todo en `localStorage`.
- Arquitectura intacta: UI -> services -> repositories -> localStorage.
- No se modifico ninguna otra seccion de la landing ni de la app.

## v0.3

Version estable actual en `main`.

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
