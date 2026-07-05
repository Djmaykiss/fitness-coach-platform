"use client";

import type { ComponentType, ReactNode } from "react";
import type { LucideProps } from "lucide-react";

/**
 * Kit de UI del rediseño (Bloque 12A). SOLO presentacion: componentes reutilizables,
 * controlados por props, sin datos, servicios, repositorios ni rutas. Mantiene la
 * paleta neon actual (`#65ff4f` / gradiente `#85ff73`→`#65ff4f`) y las utilidades
 * existentes (`.premium-card`, `.card-hover`). Nadie los consume todavia: en 12A solo
 * se crean; la reorganizacion de admin/dashboard llega en 12B+.
 */

/* ---------------------------------------------------------------- TabNav ---- */

export type TabItem = {
  key: string;
  label: string;
  icon?: ComponentType<LucideProps>;
  /** Contador opcional (p. ej. no leidas, cantidad de items). */
  badge?: number;
};

type TabNavProps = {
  tabs: TabItem[];
  active: string;
  onChange: (key: string) => void;
  /** `pills` = barra horizontal desplazable (default). `bottom` = nav movil fija. */
  variant?: "pills" | "bottom";
  className?: string;
  "aria-label"?: string;
};

/**
 * Navegacion por pestañas (controlada). No cambia rutas ni datos: solo emite
 * `onChange(key)`. En `pills` la barra hace scroll horizontal en movil (sin barra de
 * scroll visible). En `bottom` se fija al pie para una navegacion tipo app.
 */
export function TabNav({
  tabs,
  active,
  onChange,
  variant = "pills",
  className = "",
  "aria-label": ariaLabel = "Secciones",
}: TabNavProps) {
  if (variant === "bottom") {
    return (
      <nav
        role="tablist"
        aria-label={ariaLabel}
        className={`fixed inset-x-0 bottom-0 z-40 grid border-t border-white/10 bg-black/80 backdrop-blur-xl [grid-template-columns:repeat(var(--cols),minmax(0,1fr))] sm:hidden ${className}`}
        style={{ "--cols": tabs.length } as React.CSSProperties}
      >
        {tabs.map((tab) => {
          const selected = tab.key === active;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(tab.key)}
              className={`flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[0.65rem] font-bold transition ${
                selected ? "text-[#65ff4f]" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {Icon ? (
                <span className="relative">
                  <Icon size={20} />
                  {tab.badge ? <BadgeDot value={tab.badge} /> : null}
                </span>
              ) : null}
              <span className="max-w-full truncate">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    );
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 ${className}`}
    >
      {tabs.map((tab) => {
        const selected = tab.key === active;
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.key)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition duration-300 active:scale-[0.98] ${
              selected
                ? "bg-gradient-to-b from-[#85ff73] to-[#65ff4f] text-black shadow-[0_8px_24px_-10px_rgba(101,255,79,0.6)]"
                : "border border-white/10 bg-white/5 text-zinc-300 hover:border-[#65ff4f]/40 hover:text-[#65ff4f]"
            }`}
          >
            {Icon ? <Icon size={16} /> : null}
            <span className="whitespace-nowrap">{tab.label}</span>
            {tab.badge ? (
              <span
                className={`ml-0.5 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-black ${
                  selected ? "bg-black/20 text-black" : "bg-[#65ff4f]/15 text-[#65ff4f]"
                }`}
              >
                {tab.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function BadgeDot({ value }: { value: number }) {
  return (
    <span className="absolute -right-2 -top-1.5 inline-flex min-w-4 items-center justify-center rounded-full bg-[#65ff4f] px-1 text-[0.6rem] font-black leading-none text-black">
      {value > 9 ? "9+" : value}
    </span>
  );
}

/* ----------------------------------------------------------- SectionCard ---- */

type SectionCardProps = {
  title?: ReactNode;
  description?: ReactNode;
  icon?: ComponentType<LucideProps>;
  /** Nodo alineado a la derecha del encabezado (botones, filtros, badge). */
  actions?: ReactNode;
  /** Ancla opcional (para deep-links / scroll). */
  id?: string;
  className?: string;
  /** Clases extra del cuerpo (p. ej. quitar padding para tablas). */
  bodyClassName?: string;
  children?: ReactNode;
};

/**
 * Tarjeta de seccion compacta y consistente (encabezado opcional + cuerpo). Es el
 * ladrillo del rediseño; reemplaza el patron ad-hoc "SectionHeader + div".
 */
export function SectionCard({
  title,
  description,
  icon: Icon,
  actions,
  id,
  className = "",
  bodyClassName = "",
  children,
}: SectionCardProps) {
  const hasHeader = title || description || actions || Icon;
  return (
    <section
      id={id}
      className={`premium-card rounded-2xl p-4 sm:p-5 [&>*]:min-w-0 ${className}`}
    >
      {hasHeader ? (
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            {Icon ? (
              <span className="mt-0.5 shrink-0 rounded-xl border border-[#65ff4f]/20 bg-[#65ff4f]/10 p-2 text-[#65ff4f]">
                <Icon size={18} />
              </span>
            ) : null}
            <div className="min-w-0">
              {title ? (
                <h2 className="truncate text-lg font-black tracking-tight text-white">
                  {title}
                </h2>
              ) : null}
              {description ? (
                <p className="mt-1 text-sm leading-6 text-zinc-400">{description}</p>
              ) : null}
            </div>
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
        </header>
      ) : null}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

/* -------------------------------------------------------- DashboardHeader ---- */

type DashboardHeaderProps = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Acciones a la derecha (CTA, buscador, etc.). */
  actions?: ReactNode;
  className?: string;
};

/**
 * Encabezado de pagina COMPACTO (denso vs. el titulo `text-6xl` del `DashboardShell`).
 * Para las vistas rediseñadas; no reemplaza al shell todavia.
 */
export function DashboardHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  className = "",
}: DashboardHeaderProps) {
  return (
    <div className={`mb-5 flex flex-wrap items-end justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#65ff4f]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-zinc-400">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------ EmptyState ---- */

type EmptyStateProps = {
  icon?: ComponentType<LucideProps>;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
};

/** Estado vacio compacto y centrado (sin datos que mostrar). */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center ${className}`}
    >
      {Icon ? (
        <span className="rounded-xl border border-[#65ff4f]/20 bg-[#65ff4f]/10 p-3 text-[#65ff4f]">
          <Icon size={22} />
        </span>
      ) : null}
      <p className="text-base font-bold text-white">{title}</p>
      {description ? (
        <p className="max-w-sm text-sm leading-6 text-zinc-400">{description}</p>
      ) : null}
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}

/* ---------------------------------------------------------- LoadingState ---- */

/** Carga compacta: skeleton de barras (o una etiqueta). No bloquea el layout. */
export function LoadingState({
  label = "Cargando…",
  rows = 3,
  className = "",
}: {
  label?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-3 ${className}`} role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-4 animate-pulse rounded-md bg-white/5"
          style={{ width: `${90 - i * 12}%` }}
        />
      ))}
    </div>
  );
}
