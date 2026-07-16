import Link from "next/link";
import { ArrowRight, CheckCircle2, Dumbbell, ShieldCheck } from "lucide-react";
import { landingService } from "@/services/landing.service";
import { ButtonLink, Footer, SectionHeader } from "@/components/ui";
import { ContentPlaceholder } from "@/components/content-placeholder";
import { isDemoContent } from "@/lib/demo";
import { OnboardingWizard } from "@/components/onboarding-wizard";

export async function HeroSection() {
  const navLinks = await landingService.getNavLinks();

  return (
    <section className="gym-hero min-h-[92vh] border-b border-white/10">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="text-lg font-black uppercase tracking-wide">
          Coach <span className="text-[#65ff4f]">Fitness</span>
        </Link>
        <div className="hidden items-center gap-6 text-sm font-semibold text-zinc-300 md:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-[#65ff4f]">
              {link.label}
            </a>
          ))}
        </div>
        <ButtonLink href="/login" variant="secondary">
          Entrar
        </ButtonLink>
      </nav>

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-14 sm:px-8 lg:min-h-[calc(92vh-88px)] lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="reveal-up mb-6 inline-flex items-center gap-2 rounded-lg border border-[#65ff4f]/30 bg-[#65ff4f]/10 px-3 py-2 text-sm font-bold text-[#65ff4f] backdrop-blur">
            <ShieldCheck size={16} />
            Fitness coaching premium
          </div>
          <h1 className="reveal-up reveal-delay-1 max-w-4xl text-5xl font-black uppercase leading-[0.96] tracking-tight sm:text-7xl lg:text-8xl">
            Entrena fuerte. Mide todo. Cambia de verdad.
          </h1>
          <p className="reveal-up reveal-delay-2 mt-6 max-w-2xl text-lg leading-8 text-zinc-300 sm:text-xl">
            Entrenamiento personalizado, seguimiento semanal y un plan claro para
            que avances con dirección y sin improvisar.
          </p>
          <div className="reveal-up reveal-delay-3 mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="#agenda">Agendar llamada</ButtonLink>
            <ButtonLink href="#programas" variant="secondary">
              Ver programas
            </ButtonLink>
          </div>
        </div>

        <div className="premium-card reveal-up reveal-delay-2 hidden overflow-hidden rounded-3xl p-4 lg:block">
          <div className="trainer-card min-h-[520px] rounded-2xl border border-white/10" />
        </div>
      </div>
    </section>
  );
}

export function AboutSection() {
  return (
    <section id="sobre-mi" className="mx-auto grid max-w-7xl gap-10 px-5 py-24 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.24em] text-[#65ff4f]">
          Sobre mí
        </p>
        <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">
          Coaching basado en estructura, datos y ejecución.
        </h2>
      </div>
      <div className="space-y-5 text-lg leading-8 text-zinc-400">
        <p>
          Combino planificación, fuerza, hábitos y seguimiento semanal para que
          cada entrenamiento tenga un propósito claro.
        </p>
        <p>
          Trabajamos con objetivos medibles y ajustes constantes, para que el
          progreso sea sostenible y se mantenga en el tiempo.
        </p>
      </div>
    </section>
  );
}

export async function ProgramsSection() {
  // Producción sin demo: solo contenido real del coach; sin él, placeholder profesional.
  const programs = isDemoContent() ? await landingService.getPrograms() : [];

  return (
    <section id="programas" className="border-y border-white/10 bg-[#0a0d0b] px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Programas"
          title="Planes para distintos niveles"
          description="Elige el plan que mejor se ajusta a tu nivel, tu objetivo y tu disponibilidad semanal."
        />
        {programs.length === 0 ? (
          <ContentPlaceholder
            icon={Dumbbell}
            title="Aún no hay programas publicados"
            message="Tus programas aparecerán aquí cuando los publiques."
          />
        ) : (
        <div className="grid gap-5 md:grid-cols-3">
          {programs.map((program) => (
            <article key={program.title} className="premium-card card-hover rounded-2xl p-6">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#65ff4f]">
                {program.duration}
              </p>
              <h3 className="mt-4 text-2xl font-black">{program.title}</h3>
              <p className="mt-2 text-sm font-semibold text-zinc-500">
                {program.level}
              </p>
              <p className="mt-4 min-h-16 text-sm leading-6 text-zinc-400">
                <span className="font-bold text-zinc-200">Ideal para:</span>{" "}
                {program.idealFor}.
              </p>
              <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                Incluye
              </p>
              <ul className="mt-3 space-y-3">
                {program.points.map((point) => (
                  <li key={point} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="text-[#65ff4f]" size={18} />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        )}
      </div>
    </section>
  );
}

// TransformationsSection se movió a `src/components/transformations-section.tsx` (cliente,
// módulo real administrable por el coach; landing muestra solo `public` con consentimiento).
// TestimonialsSection se movió a `src/components/testimonials-section.tsx` (cliente,
// módulo real administrable por el coach; landing muestra solo `public`).

export async function BenefitsSection() {
  const benefits = await landingService.getBenefits();

  return (
    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <SectionHeader
        eyebrow="Beneficios"
        title="Un sistema simple para sostener el progreso"
        description="Claridad, acción y seguimiento para que sepas siempre qué hacer y cómo vas avanzando."
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((benefit) => {
          const Icon = benefit.icon;
          return (
            <article key={benefit.title} className="premium-card card-hover rounded-2xl p-6">
              <div className="mb-5 inline-flex rounded-xl border border-[#65ff4f]/20 bg-[#65ff4f]/10 p-3 text-[#65ff4f] shadow-[0_0_24px_-8px_rgba(101,255,79,0.5)]">
                <Icon size={24} />
              </div>
              <h3 className="text-xl font-black">{benefit.title}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{benefit.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function BookingSection() {
  return (
    <section id="agenda" className="border-y border-white/10 bg-[#0a0d0b] px-5 py-24 sm:px-8">
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-[#65ff4f]">
          Evaluación inicial
        </p>
        <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">
          Empecemos con tu evaluación.
        </h2>
        <p className="mt-5 text-lg leading-8 text-zinc-400">
          Responde unas preguntas rápidas, como en una consulta con tu coach, y
          te recomendamos el plan ideal para ti.
        </p>
      </div>
      <OnboardingWizard />
    </section>
  );
}

export function FinalCtaSection() {
  return (
    <section className="px-5 py-24 sm:px-8">
      <div className="neon-ring mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 rounded-3xl bg-[#65ff4f] p-8 text-black md:flex-row md:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em]">Empieza hoy</p>
          <h2 className="mt-2 text-3xl font-black uppercase sm:text-5xl">
            Construye tu mejor versión con un plan medible.
          </h2>
        </div>
        <a
          href="/register"
          className="group inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-black px-6 text-sm font-black uppercase tracking-wide text-white shadow-[0_12px_30px_-12px_rgba(0,0,0,0.8)] transition duration-300 hover:-translate-y-0.5 hover:bg-zinc-900 active:translate-y-0 active:scale-[0.98]"
        >
          Empezar ahora
          <ArrowRight
            size={18}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </a>
      </div>
    </section>
  );
}

export { Footer };
