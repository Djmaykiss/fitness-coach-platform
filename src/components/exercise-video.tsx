"use client";

import { useState } from "react";
import { ExternalLink, Play } from "lucide-react";
import { youtubeEmbedUrl } from "@/lib/youtube";

/**
 * Botón "Ver demostración" del video del ejercicio.
 *
 * - Si el enlace es de YouTube (incluye NO LISTADOS), lo reproduce embebido dentro
 *   de la ficha (toggle) y ofrece además abrirlo en YouTube.
 * - Si es cualquier otro enlace, abre directamente en una pestaña nueva.
 *
 * `variant="link"` lo muestra como enlace de texto (para el modo entrenamiento).
 */
export function ExerciseVideo({
  url,
  title,
  variant = "button",
}: {
  url: string;
  title: string;
  variant?: "button" | "link";
}) {
  const [open, setOpen] = useState(false);
  const embed = youtubeEmbedUrl(url);

  // Enlace no-YouTube: abrir en pestaña nueva.
  if (!embed) {
    if (variant === "link") {
      return (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 block text-center text-sm font-bold text-[#65ff4f] hover:underline"
        >
          Ver demostración del ejercicio
        </a>
      );
    }
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#65ff4f]/40 px-5 text-sm font-black uppercase tracking-wide text-[#65ff4f] transition duration-300 hover:bg-[#65ff4f]/10"
      >
        <Play size={16} />
        Ver demostración
      </a>
    );
  }

  const toggleClass =
    variant === "link"
      ? "mt-4 block w-full text-center text-sm font-bold text-[#65ff4f] hover:underline"
      : "mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#65ff4f]/40 px-5 text-sm font-black uppercase tracking-wide text-[#65ff4f] transition duration-300 hover:bg-[#65ff4f]/10";

  return (
    <div className={variant === "link" ? "mt-4" : "mt-3"}>
      <button type="button" onClick={() => setOpen((o) => !o)} className={toggleClass}>
        {variant === "button" ? <Play size={16} /> : null}
        {open ? "Ocultar video" : "Ver demostración"}
      </button>

      {open ? (
        <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-black">
          <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
            <iframe
              src={embed}
              title={`Demostración: ${title}`}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1.5 border-t border-white/10 py-2 text-xs font-bold text-zinc-400 transition hover:text-[#65ff4f]"
          >
            <ExternalLink size={13} />
            Abrir en YouTube
          </a>
        </div>
      ) : null}
    </div>
  );
}
