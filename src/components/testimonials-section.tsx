"use client";

import { useEffect, useState } from "react";
import { Quote } from "lucide-react";
import { testimonialService } from "@/services/testimonial.service";
import { SectionHeader } from "@/components/ui";
import { ContentPlaceholder } from "@/components/content-placeholder";
import type { Testimonial } from "@/types";

/**
 * Sección "Testimonios" de la landing (SOLO presentación). Muestra los testimonios
 * `public` que administra el coach (`testimonialService.getPublishedTestimonials`). Si no
 * hay ninguno, muestra un Empty-State profesional (nunca contenido ficticio). Cliente:
 * funciona en modo local y supabase (fetch en el navegador), como `PlansSection`.
 */
export function TestimonialsSection() {
  const [items, setItems] = useState<Testimonial[] | null>(null);

  useEffect(() => {
    let active = true;
    testimonialService.getPublishedTestimonials().then((t) => {
      if (active) setItems(t);
    });
    return () => {
      active = false;
    };
  }, []);

  if (items === null) return null; // aún cargando

  return (
    <section className="border-y border-white/10 bg-[#0a0d0b] px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Testimonios"
          title="Historias de progreso"
          description="Personas reales que entrenaron con dirección y lograron sostener sus resultados."
        />
        {items.length === 0 ? (
          <ContentPlaceholder
            icon={Quote}
            title="Aún no hay testimonios"
            message="Pronto compartiremos historias reales de progreso."
            hint={null}
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {items.map((item) => (
              <article key={item.id} className="premium-card card-hover rounded-2xl p-6">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="mb-4 h-16 w-16 rounded-full border border-white/10 object-cover"
                  />
                ) : null}
                <p className="text-4xl font-black text-[#65ff4f]">{item.result}</p>
                <p className="mt-5 text-base leading-7 text-zinc-300">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div className="mt-6 border-t border-white/10 pt-5">
                  <p className="font-black text-white">{item.name}</p>
                  <p className="mt-1 text-sm text-zinc-500">{item.role}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
