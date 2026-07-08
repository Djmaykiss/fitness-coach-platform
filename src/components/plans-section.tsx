"use client";

import { useEffect, useState } from "react";
import { Check, Crown } from "lucide-react";
import { plansService } from "@/services/plans.service";
import type { Plan } from "@/types";

/**
 * Sección "Planes" de la landing (SOLO presentacion). Muestra los planes ACTIVOS que
 * el coach administra (`plansService.getActivePlans`). Responsive: 3 col desktop, 2
 * tablet, 1 movil. El plan `recommended` se destaca. No agrega logica de pago.
 */
export function PlansSection() {
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    let active = true;
    plansService.getActivePlans().then((p) => {
      if (active) setPlans(p);
    });
    return () => {
      active = false;
    };
  }, []);

  if (plans.length === 0) return null;

  return (
    <section id="planes" className="border-t border-white/5 px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 text-sm font-black uppercase tracking-[0.24em] text-[#65ff4f]">
            Planes
          </p>
          <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
            Elige tu nivel de acompañamiento
          </h2>
          <p className="mt-4 text-base leading-7 text-zinc-400">
            Desde comenzar tu transformación hasta el máximo nivel de coaching personalizado.
          </p>
        </div>

        <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const accent = plan.color || "#65ff4f";
  return (
    <article
      className={`premium-card relative flex flex-col rounded-2xl p-6 transition duration-300 ${
        plan.recommended ? "neon-ring lg:-translate-y-2" : "card-hover"
      }`}
      style={{ borderTop: `3px solid ${accent}` }}
    >
      {plan.recommended ? (
        <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-gradient-to-b from-[#85ff73] to-[#65ff4f] px-3 py-1 text-xs font-black uppercase tracking-wide text-black shadow-[0_8px_24px_-8px_rgba(101,255,79,0.6)]">
          <Crown size={13} /> Recomendado
        </span>
      ) : null}

      {plan.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={plan.image}
          alt={plan.name}
          className="mb-4 h-32 w-full rounded-xl object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      ) : null}

      <h3 className="text-2xl font-black tracking-tight" style={{ color: accent }}>
        {plan.name}
      </h3>
      {plan.modality ? (
        <p className="mt-1 text-xs font-bold uppercase tracking-wide text-zinc-500">
          {plan.modality}
        </p>
      ) : null}
      {plan.priceLabel ? (
        <p className="mt-3 text-lg font-black text-white">{plan.priceLabel}</p>
      ) : null}
      {plan.idealFor ? (
        <p className="mt-3 text-sm leading-6 text-zinc-400">{plan.idealFor}</p>
      ) : null}

      <ul className="mt-5 flex-1 space-y-2.5">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
            <span className="mt-0.5 shrink-0 text-[#65ff4f]">
              <Check size={16} />
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <a
        href="#agenda"
        className={`mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-lg px-5 text-sm font-black uppercase tracking-wide transition duration-300 hover:-translate-y-0.5 active:scale-[0.98] ${
          plan.recommended
            ? "bg-gradient-to-b from-[#85ff73] to-[#65ff4f] text-black shadow-[0_8px_30px_-8px_rgba(101,255,79,0.5)] hover:brightness-110"
            : "border border-white/15 bg-white/5 text-white hover:border-[#65ff4f]/50 hover:bg-[#65ff4f]/10"
        }`}
      >
        {plan.buttonLabel || "Comenzar"}
      </a>
    </article>
  );
}
