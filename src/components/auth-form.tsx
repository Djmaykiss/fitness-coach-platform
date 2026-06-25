"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import type { AuthUser } from "@/types";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { login, register } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLogin = mode === "login";

  function redirectByRole(user: AuthUser) {
    router.push(user.role === "admin" ? "/admin" : "/dashboard");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isLogin && password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden.");
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
      return;
    }

    setMessage(
      isLogin
        ? "Sesión iniciada. Redirigiendo..."
        : "Cuenta creada. Redirigiendo a tu dashboard...",
    );
    redirectByRole(result.user);
  }

  return (
    <form onSubmit={handleSubmit} className="premium-card w-full rounded-2xl p-6">
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
        className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#65ff4f] px-5 text-sm font-black uppercase tracking-wide text-black transition hover:bg-[#85ff73] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting
          ? "Procesando..."
          : isLogin
            ? "Continuar"
            : "Registrarme"}
        <ArrowRight size={18} />
      </button>

      {isLogin ? (
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
        className="mt-2 h-12 w-full rounded-lg border border-white/10 bg-black/35 px-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-[#65ff4f]"
      />
    </label>
  );
}
