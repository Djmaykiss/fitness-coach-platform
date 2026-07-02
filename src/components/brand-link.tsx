"use client";

import Link from "next/link";
import { useSettings } from "@/context/settings-context";

/**
 * Marca del negocio en el header (white-label). Lee el nombre configurado por el
 * coach; si aun no carga, usa el default. La primera palabra va en blanco y el
 * resto en verde, conservando el estilo del logotipo original.
 */
export function BrandLink() {
  const { settings } = useSettings();
  const name = settings.businessName || "Coach Fitness";
  const [first, ...rest] = name.split(" ");
  return (
    <Link
      href="/"
      className="min-w-0 truncate font-black uppercase tracking-wide"
    >
      {first} {rest.length > 0 ? <span className="text-[#65ff4f]">{rest.join(" ")}</span> : null}
    </Link>
  );
}
