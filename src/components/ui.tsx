import type { ComponentType, ReactNode } from "react";
import type { LucideProps } from "lucide-react";
import Link from "next/link";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
}: ButtonLinkProps) {
  const styles =
    variant === "primary"
      ? "bg-[#65ff4f] text-black shadow-[0_0_32px_rgba(101,255,79,0.18)] hover:bg-[#85ff73]"
      : "border border-white/15 bg-white/5 text-white backdrop-blur hover:border-[#65ff4f]/50 hover:bg-[#65ff4f]/10";

  return (
    <Link
      href={href}
      className={`inline-flex min-h-12 items-center justify-center rounded-lg px-5 text-sm font-black uppercase tracking-wide transition duration-300 ${styles}`}
    >
      {children}
    </Link>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      <p className="mb-3 text-sm font-black uppercase tracking-[0.24em] text-[#65ff4f]">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-zinc-400 sm:text-lg">
        {description}
      </p>
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: ComponentType<LucideProps>;
}) {
  return (
    <div className="premium-card rounded-2xl p-5 transition duration-300 hover:-translate-y-1 hover:border-[#65ff4f]/30">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-400">{label}</p>
          <p className="mt-2 text-3xl font-black text-white">{value}</p>
        </div>
        {Icon ? (
          <div className="rounded-md border border-[#65ff4f]/20 bg-[#65ff4f]/10 p-3 text-[#65ff4f]">
            <Icon size={22} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col bg-[#050706] text-white">
      <div className="hero-grid flex flex-1 flex-col">{children}</div>
      <MiniFooter />
    </main>
  );
}

/** Enlaces del credito del desarrollador (fuente unica). */
const creditLinks = [
  { label: "Portafolio", href: "https://djmaykiss.github.io/Minuevocurriculum/" },
  { label: "Sitio web", href: "https://markingwebs.com/" },
  { label: "GitHub", href: "https://github.com/Djmaykiss" },
];

function CreditLinks({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap gap-x-4 gap-y-2 ${className}`}>
      {creditLinks.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          className="hover:text-[#65ff4f]"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/30 px-5 py-10 text-sm text-zinc-500 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="font-black uppercase tracking-wide text-white">
            Coach <span className="text-[#65ff4f]">Fitness</span>
          </p>
          <p className="mt-2 max-w-md leading-6">
            Coaching fitness con planificación, seguimiento y acompañamiento
            semanal para sostener tu progreso.
          </p>
        </div>
        <div className="flex flex-col gap-2 md:items-end">
          <p className="font-semibold text-zinc-300">
            Desarrollado por Michael Perez
          </p>
          <CreditLinks className="md:justify-end" />
        </div>
      </div>
    </footer>
  );
}

/** Footer compacto con el credito, para login, registro y dashboards. */
export function MiniFooter() {
  return (
    <footer className="border-t border-white/10 px-5 py-6 text-xs text-zinc-500 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
        <p className="font-semibold text-zinc-400">
          Desarrollado por Michael Perez
        </p>
        <CreditLinks className="justify-center" />
      </div>
    </footer>
  );
}
