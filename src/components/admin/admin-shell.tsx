"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import {
  Bell,
  LayoutDashboard,
  Library,
  PanelLeft,
  Settings2,
  UserRound,
  Users,
  Workflow,
} from "lucide-react";
import { BrandLink } from "@/components/brand-link";
import { LogoutButton } from "@/components/logout-button";
import { MiniFooter } from "@/components/ui";

/**
 * Shell del panel del coach — rediseño VISUAL tipo SaaS/admin (solo presentacion).
 *
 * NO cambia logica/datos/permisos: es un layout (sidebar desktop + header superior +
 * area de contenido) que controla la seccion activa por props (`active`/`onChange`),
 * las mismas 6 secciones del `AdminPanel`. En movil/tablet el sidebar se oculta y la
 * navegacion la da la tira de tabs compacta del propio `AdminPanel` (`lg:hidden`).
 */

export type AdminNavItem = {
  key: string;
  label: string;
  icon: ComponentType<LucideProps>;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { key: "inicio", label: "Inicio", icon: LayoutDashboard },
  { key: "alumnos", label: "Alumnos", icon: Users },
  { key: "crm", label: "CRM", icon: Workflow },
  { key: "contenido", label: "Contenido", icon: Library },
  { key: "notificaciones", label: "Notificaciones", icon: Bell },
  { key: "configuracion", label: "Configuración", icon: Settings2 },
];

function labelFor(key: string): string {
  return ADMIN_NAV.find((i) => i.key === key)?.label ?? "Panel";
}

export function AdminShell({
  active,
  onChange,
  children,
}: {
  active: string;
  onChange: (key: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050706] text-white">
      <div className="lg:flex">
        {/* ---- Sidebar (desktop) ---- */}
        <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-white/10 lg:bg-[#0a0d0b]/90 lg:backdrop-blur-xl">
          <div className="flex h-16 shrink-0 items-center border-b border-white/10 px-5">
            <BrandLink />
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Secciones del panel">
            <p className="px-3 pb-2 text-[0.65rem] font-black uppercase tracking-[0.2em] text-zinc-600">
              Panel
            </p>
            {ADMIN_NAV.map((item) => {
              const Icon = item.icon;
              const on = item.key === active;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onChange(item.key)}
                  aria-current={on ? "page" : undefined}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
                    on
                      ? "bg-[#65ff4f]/[0.12] text-[#65ff4f] shadow-[inset_0_0_0_1px_rgba(101,255,79,0.25)]"
                      : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <span
                    className={`grid h-8 w-8 place-items-center rounded-lg border transition ${
                      on
                        ? "border-[#65ff4f]/30 bg-[#65ff4f]/10 text-[#65ff4f]"
                        : "border-white/10 bg-white/[0.03] text-zinc-400 group-hover:text-white"
                    }`}
                  >
                    <Icon size={16} />
                  </span>
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="shrink-0 space-y-1 border-t border-white/10 p-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.03]">
                <UserRound size={16} />
              </span>
              Ver como cliente
            </Link>
            <div className="px-1 pt-1">
              <LogoutButton />
            </div>
          </div>
        </aside>

        {/* ---- Área principal ---- */}
        <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:pl-64">
          {/* Header superior */}
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-white/10 bg-[#050706]/85 px-4 backdrop-blur-xl sm:px-6 lg:h-16 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <span className="lg:hidden">
                <BrandLink />
              </span>
              <div className="hidden items-center gap-2 lg:flex">
                <PanelLeft size={16} className="text-zinc-600" />
                <h1 className="truncate text-lg font-black tracking-tight">
                  {labelFor(active)}
                </h1>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="lg:hidden">
                <LogoutButton />
              </span>
            </div>
          </header>

          <div className="mx-auto w-full max-w-7xl flex-1 overflow-x-clip px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            {children}
          </div>

          <MiniFooter />
        </div>
      </div>
    </div>
  );
}
