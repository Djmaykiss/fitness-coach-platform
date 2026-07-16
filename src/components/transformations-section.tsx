"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Sparkles } from "lucide-react";
import { transformationService } from "@/services/transformation.service";
import { SectionHeader } from "@/components/ui";
import { ContentPlaceholder } from "@/components/content-placeholder";
import { TransformationImage } from "@/components/transformation-image";
import type { Transformation } from "@/types";

/**
 * Sección "Antes y después" de la landing (SOLO presentación). Muestra las
 * transformaciones que el coach publicó CON consentimiento
 * (`transformationService.getPublishedTransformations`). Si no hay ninguna, muestra un
 * Empty-State profesional (nunca contenido ficticio). Cliente: funciona en modo local y
 * supabase (fetch en el navegador), como `TestimonialsSection`.
 */
export function TransformationsSection() {
  const [items, setItems] = useState<Transformation[] | null>(null);

  useEffect(() => {
    let active = true;
    transformationService.getPublishedTransformations().then((t) => {
      if (active) setItems(t);
    });
    return () => {
      active = false;
    };
  }, []);

  if (items === null) return null; // aún cargando

  return (
    <section id="transformaciones" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <SectionHeader
        eyebrow="Antes y después"
        title="Resultados que puedes lograr"
        description="Ejemplos de progreso en fuerza, composición corporal y consistencia con un plan estructurado."
      />
      {items.length === 0 ? (
        <ContentPlaceholder
          icon={Sparkles}
          title="Aún no hay transformaciones"
          message="Aquí aparecerán las transformaciones de tus alumnos cuando las publiques."
          hint={null}
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="premium-card card-hover rounded-2xl p-5">
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
                <TransformationImage
                  src={item.beforeUrl}
                  alt={`${item.clientName} - Antes`}
                  label="Antes"
                />
                <TransformationImage
                  src={item.afterUrl}
                  alt={`${item.clientName} - Después`}
                  label="Después"
                  after
                />
              </div>
              <h3 className="mt-5 text-2xl font-black">{item.clientName}</h3>
              {item.title ? (
                <p className="mt-1 text-sm font-semibold text-zinc-500">{item.title}</p>
              ) : null}
              {item.result ? (
                <p className="mt-3 text-lg font-black text-[#65ff4f]">{item.result}</p>
              ) : null}
              {item.description || item.duration ? (
                <ul className="mt-4 space-y-2">
                  {item.duration ? (
                    <li className="flex items-start gap-2 text-sm leading-6 text-zinc-400">
                      <CheckCircle2 className="mt-0.5 shrink-0 text-[#65ff4f]" size={16} />
                      <span>{item.duration}</span>
                    </li>
                  ) : null}
                  {item.description ? (
                    <li className="flex items-start gap-2 text-sm leading-6 text-zinc-400">
                      <CheckCircle2 className="mt-0.5 shrink-0 text-[#65ff4f]" size={16} />
                      <span>{item.description}</span>
                    </li>
                  ) : null}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
