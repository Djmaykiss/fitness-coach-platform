"use client";

import { useState } from "react";

/**
 * Tarjeta de imagen de una transformacion (Antes/Despues).
 *
 * Contenido DINAMICO (URLs de Supabase Storage o rutas arbitrarias): se usa `<img>` con
 * `onError`, NO `next/image` — misma convencion que el resto del proyecto (Testimonios,
 * Biblioteca, Descubre) para no depender de `images.remotePatterns` en `next.config`.
 * Si la URL viene vacia / null / undefined o la imagen falla, se muestra SOLO el
 * placeholder elegante (el fondo del tile + la etiqueta), sin romper el diseno ni
 * renderizar nunca `src=""`.
 */
export function TransformationImage({
  src,
  alt,
  label,
  after = false,
}: {
  src: string;
  alt: string;
  label: string;
  after?: boolean;
}) {
  const [broken, setBroken] = useState(false);
  const hasImage = typeof src === "string" && src.trim() !== "" && !broken;

  return (
    <div
      className={`relative overflow-hidden rounded-xl ${
        after
          ? "transformation-tile transformation-tile-after"
          : "transformation-tile"
      }`}
    >
      {hasImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setBroken(true)}
        />
      ) : null}
      <span className="absolute left-3 top-3 z-10 rounded-md bg-black/55 px-2 py-1 text-xs font-bold uppercase tracking-wide text-white backdrop-blur">
        {label}
      </span>
    </div>
  );
}
