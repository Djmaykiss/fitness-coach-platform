"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, ClipboardCheck, LockKeyhole } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { onboardingService } from "@/services/onboarding.service";
import { plansService } from "@/services/plans.service";
import { getSelectedPlan, clearSelectedPlan } from "@/lib/selected-plan";
import { isDemoContent } from "@/lib/demo";
import { isValidEmail } from "@/lib/validation";
import type { AuthUser } from "@/types";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { login, register } = useAuth();
  const toast = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPendingEvaluation, setHasPendingEvaluation] = useState(false);
  const isLogin = mode === "login";

  // Onboarding pendiente: en /register prellena nombre/email y muestra aviso;
  // en /login se limpia para no adjuntarlo a una cuenta equivocada.
  useEffect(() => {
    if (isLogin) {
      onboardingService.clearPending();
      return;
    }
    let active = true;
    onboardingService.getPending().then((pending) => {
      if (!active || !pending) return;
      const [first, ...rest] = pending.name.trim().split(" ");
      setFirstName(first ?? "");
      setLastName(rest.join(" "));
      setEmail(pending.email);
      setHasPendingEvaluation(true);
    });
    return () => {
      active = false;
    };
  }, [isLogin]);

  function redirectByRole(user: AuthUser) {
    router.push(user.role === "admin" ? "/admin" : "/dashboard");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValidEmail(email)) {
      setMessage("Ingresa un email válido.");
      toast.error("Ingresa un email válido.");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden.");
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    const result = isLogin
      ? await login({ email, password })
      : await register({ firstName, lastName, email, password });

    setIsSubmitting(false);

    if (!result.ok) {
      setMessage(result.error);
      toast.error(result.error);
      return;
    }

    // Registro con plan elegido en la landing: asigna ese plan al alumno recién
    // creado (client_plans) y limpia la selección. Si no hay plan, flujo normal.
    if (!isLogin) {
      const selected = getSelectedPlan();
      if (selected) {
        try {
          await plansService.contractPlanForUser(result.user.id, selected);
        } catch {
          // No bloquear el registro si la asignación del plan falla.
        }
        clearSelectedPlan();
      }
    }

    toast.success(isLogin ? "Sesión iniciada." : "Cuenta creada.");
    setMessage(
      isLogin
        ? "Sesión iniciada. Redirigiendo..."
        : "Cuenta creada. Redirigiendo a tu dashboard...",
    );
    redirectByRole(result.user);
  }

  return (
    <form onSubmit={handleSubmit} className="premium-card reveal-up w-full rounded-2xl p-6 sm:p-8">
      <div className="mb-8">
        <div className="mb-5 inline-flex rounded-xl border border-[#65ff4f]/20 bg-[#65ff4f]/10 p-3 text-[#65ff4f]">
          <LockKeyhole size={24} />
        </div>
        <h1 className="text-3xl font-black tracking-tight">
          {isLogin ? "Accede a tu espacio" : "Crear cuenta"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          {isLogin
            ? "Acceso local con cuentas demo para cliente y administrador."
            : "Registro local para crear una cuenta de cliente de prueba."}
        </p>
      </div>

      {!isLogin && hasPendingEvaluation ? (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-[#65ff4f]/30 bg-[#65ff4f]/[0.06] p-4">
          <ClipboardCheck className="mt-0.5 shrink-0 text-[#65ff4f]" size={20} />
          <p className="text-sm leading-6 text-zinc-200">
            Tu evaluación inicial está lista. Crea tu cuenta para guardar tu
            progreso.
          </p>
        </div>
      ) : null}

      {!isLogin ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Nombre" value={firstName} onChange={setFirstName} placeholder="Nombre" />
          <TextField label="Apellido" value={lastName} onChange={setLastName} placeholder="Apellido" />
        </div>
      ) : null}

      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="cliente@email.com"
      />

      <TextField
        label="Contraseña"
        type="password"
        value={password}
        onChange={setPassword}
        placeholder="Mínimo 6 caracteres"
      />

      {!isLogin ? (
        <TextField
          label="Confirmar contraseña"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Repite tu contraseña"
        />
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="group mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-[#85ff73] to-[#65ff4f] px-5 text-sm font-black uppercase tracking-wide text-black shadow-[0_8px_30px_-8px_rgba(101,255,79,0.5)] transition duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_10px_40px_-8px_rgba(101,255,79,0.7)] active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {isSubmitting
          ? "Procesando..."
          : isLogin
            ? "Continuar"
            : "Registrarme"}
        <ArrowRight size={18} />
      </button>

      {isLogin && isDemoContent() ? (
        <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs leading-5 text-zinc-400">
          <p className="font-bold text-zinc-300">Cuentas demo</p>
          <p>Admin: admin@coach.com / 123456</p>
          <p>Cliente: cliente@coach.com / 123456</p>
        </div>
      ) : null}

      {message ? (
        <p className="mt-4 rounded-lg border border-[#65ff4f]/20 bg-[#65ff4f]/10 p-3 text-sm leading-6 text-zinc-200">
          {message}
        </p>
      ) : null}

      <p className="mt-6 text-center text-sm text-zinc-500">
        {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
        <Link
          href={isLogin ? "/register" : "/login"}
          className="font-bold text-[#65ff4f]"
        >
          {isLogin ? "Regístrate" : "Entrar"}
        </Link>
      </p>
    </form>
  );
}

function TextField({
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
    <label className="mt-5 block text-sm font-bold text-zinc-200 first:mt-0">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required
        minLength={type === "password" ? 6 : undefined}
        className="mt-2 h-12 w-full rounded-lg border border-white/10 bg-black/35 px-4 text-white outline-none transition duration-300 placeholder:text-zinc-600 hover:border-white/20 focus:border-[#65ff4f] focus:bg-black/50 focus:shadow-[0_0_0_3px_rgba(101,255,79,0.12)]"
      />
    </label>
  );
}
