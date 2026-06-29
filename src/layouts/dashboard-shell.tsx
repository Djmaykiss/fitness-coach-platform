import Link from "next/link";
import type { ReactNode } from "react";
import { LogoutButton } from "@/components/logout-button";
import { MiniFooter } from "@/components/ui";

export function DashboardShell({
  title,
  subtitle,
  eyebrow = "Área privada",
  minimalNav = false,
  children,
}: {
  title: string;
  subtitle: string;
  eyebrow?: string;
  /** Si es true, el header solo muestra el logo y "Salir" (sin Cliente/Admin). */
  minimalNav?: boolean;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col bg-[#050706] text-white">
      <div className="hero-grid flex flex-1 flex-col">
        <nav className="sticky top-0 z-30 border-b border-white/10 bg-black/50 px-5 py-4 backdrop-blur-xl sm:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <Link href="/" className="font-black uppercase tracking-wide">
              Coach <span className="text-[#65ff4f]">Fitness</span>
            </Link>
            <div className="flex items-center gap-3 text-sm font-bold text-zinc-300 sm:gap-4">
              {minimalNav ? null : (
                <>
                  <Link href="/dashboard" className="hover:text-[#65ff4f]">
                    Cliente
                  </Link>
                  <Link href="/admin" className="hover:text-[#65ff4f]">
                    Admin
                  </Link>
                </>
              )}
              <LogoutButton />
            </div>
          </div>
        </nav>

        <section className="mx-auto w-full max-w-7xl flex-1 px-5 py-10 sm:px-8">
          <div className="mb-8">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-[#65ff4f]">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
                {subtitle}
              </p>
            ) : null}
          </div>
          {children}
        </section>
      </div>
      <MiniFooter />
    </main>
  );
}
