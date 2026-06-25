import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { PageShell } from "@/components/ui";

export default function RegisterPage() {
  return (
    <PageShell>
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-5 py-10 sm:px-8">
        <Link href="/" className="mb-8 text-sm font-bold text-[#65ff4f]">
          Volver al inicio
        </Link>
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_440px]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-[#65ff4f]">
              Nueva cuenta
            </p>
            <h1 className="mt-4 text-5xl font-black uppercase leading-none sm:text-7xl">
              Primer paso hacia el plan.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-400">
              Crea tu cuenta para acceder a tu plan, tu progreso y tus tareas de
              la semana.
            </p>
          </div>
          <AuthForm mode="register" />
        </div>
      </div>
    </PageShell>
  );
}
