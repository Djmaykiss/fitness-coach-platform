import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

/**
 * ContentPlaceholder — Empty-State profesional para módulos PÚBLICOS / de contenido
 * (Fase 1 de `PRODUCTION_READINESS_PLAN.md`). Regla permanente de la plataforma:
 *   sin contenido real del coach  = este placeholder (elegante, invita a publicar)
 *   con contenido real            = se reemplaza automáticamente por el contenido
 * NUNCA contenido ficticio/demo/nombres inventados en producción.
 *
 * Es SERVER-SAFE (sin `"use client"`, sin hooks) para poder usarse tanto en la landing
 * (server components) como en el dashboard/panel (client). Para estados vacíos
 * interactivos del panel del coach también existe `EmptyState` en `ui-kit.tsx` (client);
 * este es el placeholder canónico de secciones de contenido público.
 *
 * Reutilizable en: Transformaciones, Testimonios, Programas, Recursos, Artículos,
 * Biblioteca, Galerías, Antes/Después y cualquier módulo público (regla en `CLAUDE.md`).
 */

type ContentPlaceholderProps = {
  icon?: ComponentType<LucideProps>;
  title: string;
  message?: string;
  /** Pista de acción; por defecto invita a publicar desde el panel del coach. */
  hint?: string | null;
  /** `section` (grande, para landing/secciones) o `inline` (compacto). */
  variant?: "section" | "inline";
  className?: string;
};

export function ContentPlaceholder({
  icon: Icon,
  title,
  message,
  hint = "Agrega contenido desde el panel del coach.",
  variant = "section",
  className = "",
}: ContentPlaceholderProps) {
  const pad = variant === "section" ? "px-6 py-14 sm:py-16" : "px-5 py-8";
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/12 bg-white/[0.02] text-center ${pad} ${className}`}
    >
      {Icon ? (
        <span className="rounded-2xl border border-[#65ff4f]/25 bg-[#65ff4f]/10 p-4 text-[#65ff4f]">
          <Icon size={variant === "section" ? 28 : 22} />
        </span>
      ) : null}
      <p className={variant === "section" ? "text-lg font-black text-white sm:text-xl" : "text-base font-bold text-white"}>
        {title}
      </p>
      {message ? (
        <p className="max-w-md text-sm leading-6 text-zinc-400">{message}</p>
      ) : null}
      {hint ? (
        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#65ff4f]/80">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
