"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Tarjeta de imagen de una transformacion (Antes/Despues).
 *
 * Muestra la foto desde /public si existe; si el archivo aun no esta, el
 * `onError` la oculta y queda el placeholder elegante (patron del tile), sin
 * romper el diseno. La etiqueta (ANTES / DESPUES / SEMANA X) va superpuesta.
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
  const [showImage, setShowImage] = useState(true);

  return (
    <div
      className={`relative overflow-hidden rounded-xl ${
        after
          ? "transformation-tile transformation-tile-after"
          : "transformation-tile"
      }`}
    >
      {showImage ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
          className="object-cover"
          onError={() => setShowImage(false)}
        />
      ) : null}
      <span className="absolute left-3 top-3 z-10 rounded-md bg-black/55 px-2 py-1 text-xs font-bold uppercase tracking-wide text-white backdrop-blur">
        {label}
      </span>
    </div>
  );
}
