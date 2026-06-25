"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CalendarCheck, CheckCircle2 } from "lucide-react";
import { leadService } from "@/services/lead.service";

const LEAD_OBJECTIVES = [
  "Perder grasa",
  "Ganar músculo",
  "Recomposición corporal",
  "Fuerza",
  "Mejorar hábitos",
  "Rendimiento",
];

export function LeadForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [objective, setObjective] = useState(LEAD_OBJECTIVES[0]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    await leadService.createLead({ name, email, phone, objective, message });
    setSubmitting(false);
    setDone(true);
  }

  if (done) {
    return (
      <div className="premium-card w-full rounded-2xl p-8 text-center">
        <div className="mx-auto mb-5 inline-flex rounded-xl border border-[#65ff4f]/20 bg-[#65ff4f]/10 p-3 text-[#65ff4f]">
          <CalendarCheck size={28} />
        </div>
        <h2 className="text-2xl font-black">¡Solicitud enviada!</h2>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Recibimos tu solicitud. Te contactaremos pronto para coordinar tu
          llamada y armar tu plan.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#65ff4f]"
        >
          <CheckCircle2 size={16} />
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="premium-card w-full rounded-2xl p-6">
      <h2 className="text-2xl font-black tracking-tight">Agenda tu llamada</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-400">
        Déjanos tus datos y nos pondremos en contacto.
      </p>

      <Field label="Nombre" value={name} onChange={setName} placeholder="Tu nombre" />
      <Field
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="tu@email.com"
      />
      <Field
        label="Teléfono"
        type="tel"
        value={phone}
        onChange={setPhone}
        placeholder="+1 555 0000"
      />

      <label className="mt-5 block text-sm font-bold text-zinc-200">
        Objetivo
        <select
          value={objective}
          onChange={(event) => setObjective(event.target.value)}
          className="mt-2 h-12 w-full rounded-lg border border-white/10 bg-black/35 px-4 text-white outline-none transition focus:border-[#65ff4f]"
        >
          {LEAD_OBJECTIVES.map((option) => (
            <option key={option} value={option} className="bg-[#0a0d0b]">
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-5 block text-sm font-bold text-zinc-200">
        Mensaje (opcional)
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Cuéntanos un poco sobre ti..."
          rows={3}
          className="mt-2 w-full rounded-lg border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-[#65ff4f]"
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#65ff4f] px-5 text-sm font-black uppercase tracking-wide text-black transition hover:bg-[#85ff73] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Enviando..." : "Solicitar llamada"}
        <ArrowRight size={18} />
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="mt-5 block text-sm font-bold text-zinc-200">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required
        className="mt-2 h-12 w-full rounded-lg border border-white/10 bg-black/35 px-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-[#65ff4f]"
      />
    </label>
  );
}
