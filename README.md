# Fitness Coach Platform

Plataforma web de coaching fitness: una landing de captación con onboarding
inteligente, un dashboard premium para el alumno y un panel de administración para
el coach. Pensada como producto real de coaching online, con una arquitectura por
capas lista para migrar a un backend.

🔗 **Demo en vivo:** https://fitness-coach-platform-one.vercel.app/
📦 **Repositorio:** https://github.com/Djmaykiss/fitness-coach-platform

> **Estado actual (v0.5):** demo funcional con persistencia local en
> `localStorage`. Todavía **sin backend ni Supabase** y sin pagos reales: los datos
> son reales pero viven en el navegador y sobreviven a recargas. La arquitectura
> está preparada para conectar una base de datos sin tocar la UI ni los servicios.

---

## ✨ Funciones actuales (v0.5)

### Landing y captación
- Landing page responsive (hero, beneficios, programas, antes/después,
  testimonios) con tema oscuro y verde neón.
- **Onboarding inteligente** embebido en la landing: wizard de evaluación inicial
  de **11 pasos** (datos personales, estado físico, tipo de cuerpo, objetivo,
  experiencia, disponibilidad, hábitos, **antecedentes de salud** y
  **formulario de alimentación**).
- Recomendación de plan según el objetivo (reglas simples, sin IA).
- Del onboarding al registro: la evaluación se guarda y queda en el perfil del
  alumno tras crear la cuenta.
- Formulario alternativo de agendar llamada (`/agendar`).

### Dashboard del alumno
- **Dashboard premium** con 18 secciones tipo Trainerize/TrueCoach: galería de
  progreso, gráficas (peso/cintura/grasa/músculo), objetivos de la semana,
  calendario de entrenamiento, medidas corporales, cumplimiento, logros, historial,
  rutina del día, nutrición, chat con el coach (demo), recursos, recordatorios,
  comparador antes/después y métricas corporales calculadas (IMC, peso ideal,
  calorías, agua, macros).
- Sección **"Mi evaluación inicial"** con la evaluación agrupada en bloques
  (Datos personales, Antecedentes, Alimentación).
- Aviso de **acceso mensual** (Activo / Vencido / Pausado).

### Panel del coach (admin)
- Gestión de alumnos (crear, editar, asignar programa, editar progreso).
- Gestión de **leads** (estados Nuevo / Contactado / Convertido / Descartado y
  conversión de lead a alumno).
- Ficha de alumno y de lead con la **evaluación inicial completa** por bloques.
- Control de **acceso mensual manual** (renovar 30 días con método de pago, pausar
  o marcar vencido).

---

## 🧱 Stack técnico

- [Next.js](https://nextjs.org) 16 (App Router) + TypeScript
- React 19
- [Tailwind CSS](https://tailwindcss.com) v4
- [lucide-react](https://lucide.dev) (iconos)
- Gráficas SVG propias (sin librerías de charting)
- Persistencia local con `localStorage` (sin backend)

---

## 🏗️ Arquitectura

Flujo de datos por capas — **la UI nunca toca los datos directamente**:

```
UI (components / sections / pages)
        ↓
    Services        ← lo que consumen los componentes (métodos async)
        ↓
  Repositories      ← interfaces + implementaciones (único punto de migración)
        ↓
 data (seed) / localStorage
```

- `src/app` — rutas (`/`, `/login`, `/register`, `/agendar`, `/dashboard`, `/admin`).
- `src/components`, `src/sections`, `src/layouts` — UI y composición.
- `src/context` — auth simulado con Context API.
- `src/services` — capa de negocio que consume la UI (lectura/escritura `async`).
- `src/repositories` — `Mock*` (contenido estático de marketing) y `Local*`
  (datos operativos en `localStorage`). Cableado en `src/repositories/index.ts`.
- `src/data` — semillas iniciales de cada colección.
- `src/lib/local-store.ts` — capa de persistencia sobre `localStorage` (segura en SSR).
- `src/types` — tipos compartidos.

**Migración futura:** implementar las interfaces de `src/repositories` con nuevas
clases (p. ej. Supabase) y cambiar el cableado en `src/repositories/index.ts`, sin
tocar UI ni servicios.

---

## 🚀 Instalación y ejecución

Requisitos: Node.js 20+ y npm.

```bash
# 1. Clonar el repositorio
git clone https://github.com/Djmaykiss/fitness-coach-platform.git
cd fitness-coach-platform

# 2. Instalar dependencias
npm install

# 3. Levantar el entorno de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

Otros scripts:

```bash
npm run lint    # análisis estático con ESLint
npm run build   # build de producción
npm run start   # servir el build de producción
```

---

## 👤 Cuentas demo

| Rol    | Email              | Contraseña |
|--------|--------------------|------------|
| Admin  | `admin@coach.com`  | `123456`   |
| Alumno | `cliente@coach.com`| `123456`   |

> También puedes crear tu propia cuenta desde `/register` (o completando el
> onboarding de la landing). Los datos se guardan en `localStorage` del navegador.

---

## 🗺️ Roadmap futuro

- [ ] Backend real / Supabase (auth, base de datos, almacenamiento de imágenes).
- [ ] Pagos reales y automatización de la renovación de acceso.
- [ ] Notificaciones y conexión con WhatsApp / Instagram / Facebook Messenger.
- [ ] Nutrición avanzada y biblioteca de rutinas/videos.
- [ ] Recomendaciones con IA a partir de la evaluación.
- [ ] CRM avanzado de leads y métricas del negocio.

---

## 👨‍💻 Desarrollador

**Michael Perez**

- 🌐 Portafolio: https://djmaykiss.github.io/Minuevocurriculum/
- 💼 Sitio web: https://markingwebs.com/
- 🐙 GitHub: https://github.com/Djmaykiss
